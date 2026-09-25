import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js'; import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService,ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module.js';
import { ProductsModule } from './products/products.module.js';
import { ProductModule } from './product/product.module.js';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync(({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService:ConfigService)=>({
        type:'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database:   configService.get<string>('DB_NAME'),


        autoLoadEntities:true,

        synchronize:true,
      })
    })),
    UsersModule,
    ProductsModule,
    ProductModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
