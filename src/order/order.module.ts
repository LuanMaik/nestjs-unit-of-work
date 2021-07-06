import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './models/order.model';
import { Item } from './models/item.model';
import { OrderService } from './services/order.service';
import { OrderRepository } from './repositories/order.repository';
import { OrderController } from './controllers/order.controller';
import { CoreModule } from '../core/core.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Item]), CoreModule],
  controllers: [OrderController],
  providers: [OrderService, OrderRepository],
})
export class OrderModule {}
