
# NestJs - Unit Of Work

This repository shows how to implement unit of work pattern in NestJs Framework to realize transactional work with TypeORM.


```
@Post()
  async create(@Body() orderDto: CreateOrderRequestDto) {
    return this.unitOfWork.doTransactional(async (): Promise<Order> => { 
      return this.orderService.createOrder(orderDto); <-- running in a transactional operation
    });
  }
```


## Running this example

The `database.sql` file has the database structure necessery to run this example.

The configuration of database connection is set in `src/app.module.ts`.

Installing the dependencies:
```bash
  npm install
```
Running the application:

```bash
  npm run start:dev
```



## The problem in NestJs with TypeORM

NestJs it's an amazing frameworks to NodeJs, with a powerful Dependency Injection Service, BUT when we need to work with TypeORM Repositories in transaction operation, the beautiful of repository injection fade away.

See below some issues about it:

- [ISSUE: Better transaction management](https://github.com/nestjs/typeorm/issues/584)
- [ISSUE: Transaction management in service layer](https://github.com/nestjs/nest/issues/2609)
- [ISSUE: support Distributed Transaction Service , like spring JTA](https://github.com/nestjs/nest/issues/1220)
- [ISSUE: Transactions in NestJs](https://github.com/nestjs/typeorm/issues/57)
- [ISSUE: Transactions support](https://github.com/nestjs/typeorm/issues/108)


## Other approaches

There are other repositories/libs that try to resolve the same problem:

- [ypeorm-transactional-cls-hooked](https://github.com/odavid/typeorm-transactional-cls-hooked)
- [nest_transact](https://github.com/alphamikle/nest_transact)


## How this works

My implementation uses a service class called UnitOfWorkService to share the same connection between the custom repositories.

```typescript
@Injectable({
  scope: Scope.REQUEST, // <-- VERY IMPORTANT to create one instance per request
})
export class UnitOfWorkService {
  constructor(
    @InjectConnection()
    private readonly connection: Connection, // <-- get the database connection
  ) {
    this.manager = this.connection.manager; // <-- set the default manager
  }

  private manager: EntityManager;

  getManager() {
    return this.manager;
  }

  async doTransactional<T>(fn): Promise<T> {
    return await this.connection.transaction(async (manager) => {
      this.manager = manager; // <-- set the entity manager to share
      return fn(manager); // <-- executes the transactional work
    });
  }
}
```

## How to create a custom repository
My approach **doesn't** work with TypeORM repositories, you need to implement your own repository or generate it from TypeORM EntityManager shared.


```typescript
import { Injectable } from '@nestjs/common';
import { Order } from '../models/order.model';
import { UnitOfWorkService } from '../../core/services/unit-of-work.service';
import { Item } from '../models/item.model';

@Injectable()
export class OrderRepository {
  constructor(private readonly uow: UnitOfWorkService) {} // <-- receive the UnitOfWorkService with the manager

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
```

## Creating a service
The entity service must only receive the custom repository by injection:

```typescript
import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../repositories/order.repository';
import { CreateOrderRequestDto } from '../dto/create-order-request.dto';
import { Order } from '../models/order.model';
import { Item } from '../models/item.model';

@Injectable()
export class OrderService {
  constructor(private readonly orderRepository: OrderRepository) {} // <-- the custo repo created before

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
```



## Create a transactional operation in controller
The controller needs only receive the UnitOfWorkService by injection:

```typescript
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
    return this.orderService.getAll(); // <-- use the service with the default (non-transactional) manager
  }

  @Get()
  async getById(@Param('id') id: number): Promise<Order> {
    return this.orderService.getById(id); // <-- use the service with the default (non-transactional) manager
  }

  @Post()
  async create(@Body() orderDto: CreateOrderRequestDto) {
    return this.unitOfWork.doTransactional(async (): Promise<Order> => { // <-- start a transaction operation
      return this.orderService.createOrder(orderDto);
    });
  }
}
```


## Contributing

Contributions are always welcome!

I will be glad to know if this approach help you or if you know a better way to resolve the same problem.

