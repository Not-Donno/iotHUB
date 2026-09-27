import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductStatus } from './entities/products.entity.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly products: Repository<Product>,
  ) {}

  create(dto: CreateProductDto, vendorId: string) {
    // write through the relation: TypeORM ignores @RelationId on save, so a
    // bare vendor_id lands the row with a null FK (GOTCHAS #1)
    return this.products.save({ ...dto, vendor: { id: vendorId } });
  }

  /** the public catalogue: active only */
  findAll() {
    return this.products.find({ where: { status: ProductStatus.ACTIVE } });
  }

  /** every status, scoped to the caller */
  findMine(vendorId: string) {
    return this.products.find({ where: { vendor: { id: vendorId } } });
  }

  async findOne(id: string) {
    const product = await this.products.findOneBy({ id });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  /** 404 rather than 403 on a non-active product, so an anonymous caller
   *  can't probe which uuids exist */
  async findPublic(id: string) {
    const product = await this.findOne(id);
    if (product.status !== ProductStatus.ACTIVE) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    return product;
  }

  async update(id: string, dto: UpdateProductDto, vendorId: string) {
    const product = await this.owned(id, vendorId);
    return this.products.save({ ...product, ...dto });
  }

  async remove(id: string, vendorId: string) {
    const product = await this.owned(id, vendorId);
    return this.products.remove(product);
  }

  // in the service, not the controller, so every caller of update/remove gets
  // the check and not just the ones that came in over HTTP
  private async owned(id: string, vendorId: string) {
    const product = await this.findOne(id);
    if (product.vendor_id !== vendorId) {
      throw new ForbiddenException('You can only modify your own products');
    }
    return product;
  }
}
