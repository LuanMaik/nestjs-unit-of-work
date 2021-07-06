import { Injectable } from '@nestjs/common';
import { Order } from '../models/order.model';
import { UnitOfWorkService } from '../../core/services/unit-of-work.service';
import { Item } from '../models/item.model';

@Injectable()
export class OrderRepository {
  constructor(private readonly uow: UnitOfWorkService) {}

  async getAll(): Promise<Order[]> {
    return this.uow.getManager().find(Order, {
      relations: ['items'],
    });
  }

  async getById(idOrder: number): Promise<Order> {
    return this.uow.getManager().findOneOrFail(Order, idOrder, {
      relations: ['items'],
    });
  }

  async saveOrder(order: Order): Promise<Order> {
    return this.uow.getManager().save(order);
  }

  async saveOrderItem(item: Item): Promise<Item> {
    return this.uow.getManager().save(item);
  }
}
