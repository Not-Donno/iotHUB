import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product, ProductStatus } from './entities/products.entity.js';
import { ProductsService } from './products.service.js';

const VENDOR = '11111111-1111-4111-8111-111111111111';
const OTHER_VENDOR = '22222222-2222-4222-8222-222222222222';
const PRODUCT_ID = '33333333-3333-4333-8333-333333333333';

const owned = (vendorId = VENDOR) =>
  ({ id: PRODUCT_ID, name: 'Thermostat', vendor_id: vendorId }) as Product;

describe('ProductsService', () => {
  let service: ProductsService;
  let repo: {
    save: ReturnType<typeof vi.fn>;
    find: ReturnType<typeof vi.fn>;
    findOneBy: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    repo = {
      save: vi.fn(async (p) => p),
      find: vi.fn(async () => []),
      findOneBy: vi.fn(async () => null),
      remove: vi.fn(async (p) => p),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useValue: repo },
      ],
    }).compile();

    service = moduleRef.get(ProductsService);
  });

  describe('create', () => {
    it('writes the vendor through the relation, not vendor_id', async () => {
      await service.create({ name: 'Thermostat', price: 10 } as never, VENDOR);

      // a bare vendor_id writes NULL, so this is the assertion that matters
      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({ vendor: { id: VENDOR } }),
      );
    });

    it('ignores a vendor_id smuggled into the body', async () => {
      await service.create(
        { name: 'Thermostat', price: 10, vendor_id: OTHER_VENDOR } as never,
        VENDOR,
      );

      const saved = repo.save.mock.calls[0][0];
      expect(saved.vendor).toEqual({ id: VENDOR });
      expect(saved.vendor_id).toBe(OTHER_VENDOR); // still spread in
      expect(saved.vendor).not.toEqual({ id: OTHER_VENDOR }); // never used
    });
  });

  describe('findAll', () => {
    it('returns active products only', async () => {
      await service.findAll();
      expect(repo.find).toHaveBeenCalledWith({
        where: { status: ProductStatus.ACTIVE },
      });
    });
  });

  describe('findMine', () => {
    it('scopes to the caller', async () => {
      await service.findMine(VENDOR);
      expect(repo.find).toHaveBeenCalledWith({
        where: { vendor: { id: VENDOR } },
      });
    });
  });

  describe('findPublic', () => {
    it('returns an active product', async () => {
      repo.findOneBy.mockResolvedValue(
        Object.assign(owned(), { status: ProductStatus.ACTIVE }),
      );
      await expect(service.findPublic(PRODUCT_ID)).resolves.toBeTruthy();
    });

    it('404s on a draft so anonymous callers cannot probe uuids', async () => {
      repo.findOneBy.mockResolvedValue(
        Object.assign(owned(), { status: ProductStatus.DRAFT }),
      );
      await expect(service.findPublic(PRODUCT_ID)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('lets the owner update', async () => {
      repo.findOneBy.mockResolvedValue(owned());
      await expect(
        service.update(PRODUCT_ID, { name: 'New' } as never, VENDOR),
      ).resolves.toBeTruthy();
    });

    it('403s a non-owner', async () => {
      repo.findOneBy.mockResolvedValue(owned());
      await expect(
        service.update(PRODUCT_ID, { name: 'New' } as never, OTHER_VENDOR),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('404s a missing product', async () => {
      repo.findOneBy.mockResolvedValue(null);
      await expect(
        service.update(PRODUCT_ID, {} as never, VENDOR),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('remove', () => {
    it('lets the owner remove', async () => {
      repo.findOneBy.mockResolvedValue(owned());
      await expect(service.remove(PRODUCT_ID, VENDOR)).resolves.toBeTruthy();
      expect(repo.remove).toHaveBeenCalled();
    });

    it('403s a non-owner', async () => {
      repo.findOneBy.mockResolvedValue(owned());
      await expect(service.remove(PRODUCT_ID, OTHER_VENDOR)).rejects
        .toBeInstanceOf(ForbiddenException);
      expect(repo.remove).not.toHaveBeenCalled();
    });
  });
});
