import { Body, Controller, Get, Post } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import type { SafeUser } from '../auth/auth.service.js';
import { UserRole } from '../users/entities/user.entity.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { OrdersService } from './orders.service.js';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('mine')
  @Roles(UserRole.CUSTOMER)
  findMine(@CurrentUser() user: SafeUser) {
    return this.ordersService.findMine(user.id);
  }

  @Post()
  @Roles(UserRole.CUSTOMER)
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: SafeUser) {
    return this.ordersService.create(dto, user.id);
  }
}
