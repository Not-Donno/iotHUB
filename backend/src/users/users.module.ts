import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';
import { User } from './entities/user.entity.js'; // <-- Add .js here

@Module({
  imports: [TypeOrmModule.forFeature([User])], // <-- This connects the table
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}

