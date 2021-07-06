import { Injectable, Scope } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection, EntityManager } from 'typeorm';

@Injectable({
  scope: Scope.REQUEST,
})
export class UnitOfWorkService {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
  ) {
    this.manager = this.connection.manager;
  }

  private manager: EntityManager;

  getManager() {
    return this.manager;
  }

  async doTransactional<T>(fn): Promise<T> {
    return await this.connection.transaction(async (manager) => {
      this.manager = manager;
      return fn(manager);
    });
  }
}
