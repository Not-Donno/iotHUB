import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import {
  Product,
  ProductStatus,
} from '../products/entities/products.entity.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { OrderItem } from './entities/order-item.entity.js';
import { Order } from './entities/order.entity.js';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  /** checkout: verify, snapshot prices, decrement stock, all in one transaction */
  create(dto: CreateOrderDto, customerId: string) {
    // fold duplicate lines first: two lines of the same product would each
    // pass the stock check on their own
    const wanted = new Map<string, number>();
    for (const item of dto.items) {
      wanted.set(
        item.productId,
        (wanted.get(item.productId) ?? 0) + item.quantity,
      );
    }

    return this.dataSource.transaction(async (manager) => {
      // row locks: two checkouts racing for the last unit must serialize
      const products = await manager.find(Product, {
        where: { id: In([...wanted.keys()]) },
        lock: { mode: 'pessimistic_write' },
      });
      const byId = new Map(products.map((product) => [product.id, product]));

      let currency = '';
      let total = 0;
      const items: OrderItem[] = [];

      for (const [productId, quantity] of wanted) {
        const product = byId.get(productId);
        if (!product || product.status !== ProductStatus.ACTIVE) {
          throw new BadRequestException(`Product ${productId} is not available`);
        }
        if (product.stock < quantity) {
          throw new BadRequestException(
            `Only ${product.stock} left of "${product.name}"`,
          );
        }
        if (currency && product.currency !== currency) {
          throw new BadRequestException(
            'All items in one order must share one currency',
          );
        }
        currency = product.currency;

        product.stock -= quantity;
        await manager.save(product);

        total += product.price * quantity;
        // snapshot: the line outlives the product, its name and its price
        items.push(
          manager.create(OrderItem, {
            product,
            product_name: product.name,
            unit_price: product.price,
            quantity,
          }),
        );
      }

      return manager.save(
        manager.create(Order, {
          customer: { id: customerId },
          currency,
          total: Math.round(total * 100) / 100, // decimal(10,2); kill float dust
          items,
        }),
      );
    });
  }

  findMine(customerId: string) {
    return this.orders.find({
      where: { customer: { id: customerId } },
      relations: { items: true },
      order: { created_at: 'DESC' },
    });
  }
}
