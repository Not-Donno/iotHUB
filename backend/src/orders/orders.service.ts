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

type Sale = {
  id: string;
  created_at: Date;
  currency: string;
  items: {
    id: string;
    product_name: string;
    unit_price: number;
    quantity: number;
  }[];
  subtotal: number;
};

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(OrderItem) private readonly items: Repository<OrderItem>,
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
        // snapshot: the line outlives the product — name, price and vendor
        items.push(
          manager.create(OrderItem, {
            product,
            product_name: product.name,
            unit_price: product.price,
            quantity,
            vendor: { id: product.vendor_id },
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

  /** orders containing this vendor's lines, newest first; the subtotal sums
   *  only this vendor's lines — one order can span several vendors */
  async findSales(vendorId: string): Promise<Sale[]> {
    const lines = await this.items.find({
      where: { vendor: { id: vendorId } },
      relations: { order: true },
      order: { order: { created_at: 'DESC' } },
    });

    const sales = new Map<string, Sale>();
    for (const line of lines) {
      let sale = sales.get(line.order.id);
      if (!sale) {
        sale = {
          id: line.order.id,
          created_at: line.order.created_at,
          currency: line.order.currency,
          items: [],
          subtotal: 0,
        };
        sales.set(sale.id, sale);
      }
      sale.items.push({
        id: line.id,
        product_name: line.product_name,
        unit_price: line.unit_price,
        quantity: line.quantity,
      });
      sale.subtotal += line.unit_price * line.quantity;
    }

    // decimal(10,2); kill float dust like create() does
    return [...sales.values()].map((sale) => ({
      ...sale,
      subtotal: Math.round(sale.subtotal * 100) / 100,
    }));
  }
}
