import { ProductStatus } from '../entities/products.entity.js';

export class CreateProductDto {
  vendor_id: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  stock?: number;
  status?: ProductStatus;
}
