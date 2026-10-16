import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { decimalTransformer } from '../../common/decimal.transformer.js';
import { OrderItem } from './order-item.entity.js';

// no status column yet: nothing in the system can change one, and a column
// that only ever says one thing is a lie waiting to happen. Add when payment
// or fulfilment lands.
@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  // same column as the relation above, readable without loading `customer`
  @RelationId((order: Order) => order.customer)
  customer_id: string;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  total: number;

  @Column()
  currency: string;

  @CreateDateColumn()
  created_at: Date;
}
