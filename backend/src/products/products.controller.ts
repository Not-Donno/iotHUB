import { Controller } from "@nestjs/common";
import { ProductsService } from "./products.service.js";



@Controller('products')
export class ProductsController{
  constructor(private readonly productService: ProductsService) 
}
