import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { Product, ProductStatus } from '../products/entities/products.entity.js';
import { Order } from './entities/order.entity.js';
import { OrdersService } from './orders.service.js';

const CUSTOMER = '11111111-1111-4111-8111-111111111111';
const P1 = '22222222-2222-4222-8222-222222222222';
const P2 = '33333333-3333-4333-8333-333333333333';

const product = (over: Partial<Product> = {}) =>
  ({
    id: P1,
    name: 'Thermostat',
    price: 25,
    currency: 'NPR',
    stock: 5,
    status: ProductStatus.ACTIVE,
    ...over,
  }) as Product;

describe('OrdersService', () => {
  let service: OrdersService;
  let rows: Product[]; // the fake products table
  let orderRepo: { find: ReturnType<typeof vi.fn> };
  let manager: {
    find: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    create: (entity: new () => object, data: object) => object;
  };

  beforeEach(async () => {
    rows = [product()];
    orderRepo = { find: vi.fn(async () => []) };
    manager = {
      find: vi.fn(async (_entity, options: { where: { id: { value: string[] } } }) =>
        rows.filter((row) => options.where.id.value.includes(row.id)),
      ),
      save: vi.fn(async (entity) => entity),
      create: (entity, data) => Object.assign(new entity(), data),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useValue: orderRepo },
        {
          provide: getDataSourceToken(),
          useValue: {
            transaction: vi.fn(async (run: (m: unknown) => unknown) =>
              run(manager),
            ),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(OrdersService);
  });

  describe('create', () => {
    it('locks the rows, snapshots the line and decrements stock', async () => {
      const order = (await service.create(
        { items: [{ productId: P1, quantity: 2 }] },
        CUSTOMER,
      )) as never as Order;

      const [, options] = manager.find.mock.calls[0];
      expect(options.lock).toEqual({ mode: 'pessimistic_write' });
      expect(options.where.id.value).toEqual([P1]);

      expect(rows[0].stock).toBe(3);
      expect(order.total).toBe(50);
      expect(order.currency).toBe('NPR');
      // the writer goes through the relation, never a bare customer_id
      expect(order.customer).toEqual({ id: CUSTOMER });
      expect(order.items[0]).toMatchObject({
        product_name: 'Thermostat',
        unit_price: 25,
        quantity: 2,
      });
    });

    it('folds duplicate lines before checking stock', async () => {
      rows = [product({ stock: 3 })];

      // 2 + 2 = 4 does not fit in 3; unfolded each line alone would pass
      await expect(
        service.create(
          {
            items: [
              { productId: P1, quantity: 2 },
              { productId: P1, quantity: 2 },
            ],
          },
          CUSTOMER,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(rows[0].stock).toBe(3);
    });

    it('refuses to oversell and rolls back cleanly', async () => {
      rows = [product({ stock: 1 })];

      await expect(
        service.create({ items: [{ productId: P1, quantity: 2 }] }, CUSTOMER),
      ).rejects.toThrow(/Only 1 left/);
      expect(rows[0].stock).toBe(1);
      expect(manager.save).not.toHaveBeenCalled();
    });

    it('rejects a product that is not on sale', async () => {
      rows = [];

      await expect(
        service.create({ items: [{ productId: P1, quantity: 1 }] }, CUSTOMER),
      ).rejects.toThrow(/not available/);
    });

    it('rejects a mixed-currency cart', async () => {
      rows = [product(), product({ id: P2, currency: 'USD' })];

      await expect(
        service.create(
          {
            items: [
              { productId: P1, quantity: 1 },
              { productId: P2, quantity: 1 },
            ],
          },
          CUSTOMER,
        ),
      ).rejects.toThrow(/one currency/);
    });
  });

  describe('findMine', () => {
    it('scopes to the caller and loads the lines', async () => {
      await service.findMine(CUSTOMER);
      expect(orderRepo.find).toHaveBeenCalledWith({
        where: { customer: { id: CUSTOMER } },
        relations: { items: true },
        order: { created_at: 'DESC' },
      });
    });
  });
});
