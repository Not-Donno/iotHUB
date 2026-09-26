import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/products.entity.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';


@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly products: Repository<Product>,
  ) {}

  create(dto: CreateProductDto){
    return this.products.save({...dto,vendor:{id:dto.vendor_id}})
  }
  findAll(){
    return this.products.find()
  }
  async findOne(id:string){
  const product = await this.products.findOneBy({id})
  if(!product) throw new NotFoundException(`Product ${id} not found`)  
    return product;
  }
  async update(id:string, dto: UpdateProductDto){
    const product = await this.findOne(id);
    return this.products.save({...product,...dto})
  }
  async remove(id:string){
    const product = await this.findOne(id);
    return this.products.remove(product)
  }
}

