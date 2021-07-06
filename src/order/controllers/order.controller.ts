import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { OrderService } from '../services/order.service';
import { Order } from '../models/order.model';
import { CreateOrderRequestDto } from '../dto/create-order-request.dto';
import { UnitOfWorkService } from '../../core/services/unit-of-work.service';

@Controller('/v1/order')
export class OrderController {
  constructor(
    private readonly unitOfWork: UnitOfWorkService,
    private readonly orderService: OrderService,
  ) {}

  @Get()
  async all(): Promise<Order[]> {
    return this.orderService.getAll();
  }

  @Get()
  async getById(@Param('id') id: number): Promise<Order> {
    return this.orderService.getById(id);
  }

  @Post()
  async create(@Body() orderDto: CreateOrderRequestDto) {
    return this.unitOfWork.doTransactional(async (): Promise<Order> => {
      return this.orderService.createOrder(orderDto);
    });
  }
}
