import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../repositories/order.repository';
import { CreateOrderRequestDto } from '../dto/create-order-request.dto';
import { Order } from '../models/order.model';
import { Item } from '../models/item.model';

@Injectable()
export class OrderService {
  constructor(private readonly orderRepository: OrderRepository) {}

  async getAll(): Promise<Order[]> {
    return this.orderRepository.getAll();
  }

  async getById(id: number): Promise<Order> {
    return this.orderRepository.getById(id);
  }

  async createOrder(orderDto: CreateOrderRequestDto): Promise<Order> {
    const order = new Order();
    order.date = orderDto.date;
    order.description = orderDto.description;

    await this.orderRepository.saveOrder(order);

    for (const itemDto of orderDto.items) {
      const item = new Item();
      item.name = itemDto.name;
      item.quantity = itemDto.quantity;
      item.order = order;
      await this.orderRepository.saveOrderItem(item);
    }

    return order;
  }
}
