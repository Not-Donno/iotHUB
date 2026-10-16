import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/products.entity.js';
import { ProductsModule } from './products.module.js';

// Compiles the real module with only the repository mocked. If `ProductsService`
// (or anything else the controller needs) is dropped from `providers`, Nest
// fails to resolve ProductsController here — instead of the omission shipping
// silently and every route quietly disappearing (Phase 1's blocking bug).
describe('ProductsModule', () => {
  it('resolves its controller and providers', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ProductsModule],
    })
      .overrideProvider(getRepositoryToken(Product))
      .useValue({})
      .compile();
    expect(moduleRef).toBeDefined();
  });
});
