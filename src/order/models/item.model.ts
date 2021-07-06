import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from './order.model';

@Entity('order_item')
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  quantity: number;

  @Column({ name: 'id_order' })
  idOrder: number;

  @ManyToOne(() => Order, (order) => order.items)
  @JoinColumn({ name: 'id_order' })
  order: Order;
}
