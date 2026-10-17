import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UserRole } from '../users/entities/user.entity.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Public } from '../auth/decorators/public.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import type { SafeUser } from '../auth/auth.service.js';
import { ProductsService } from './products.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { FindProductsQueryDto } from './dto/find-products-query.dto.js';

@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @Public()
  @Get()
  findAll(@Query() query: FindProductsQueryDto) {
    return this.productService.findAll(query);
  }

  // above @Get(':id') on purpose, or ParseUUIDPipe eats the literal route
  @Public()
  @Get('categories')
  listCategories() {
    return this.productService.listCategories();
  }

  @Get('mine')
  @Roles(UserRole.VENDOR)
  findMine(@CurrentUser() user: SafeUser) {
    return this.productService.findMine(user.id);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.findPublic(id);
  }

  @Roles(UserRole.VENDOR)
  @Post()
  create(@Body() dto: CreateProductDto, @CurrentUser() user: SafeUser) {
    return this.productService.create(dto, user.id);
  }

  @Roles(UserRole.VENDOR)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: SafeUser,
  ) {
    return this.productService.update(id, dto, user.id);
  }

  @Roles(UserRole.VENDOR)
  @Delete(':id')
  @HttpCode(204)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: SafeUser,
  ) {
    return this.productService.remove(id, user.id);
  }
}
