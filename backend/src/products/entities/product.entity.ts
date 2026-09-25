import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';

export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vendor_id' })
  vendor: User;

  // same column as the relation above, readable without loading `vendor`
  @RelationId((product: Product) => product.vendor)
  vendor_id: string;

  @Column()
  name: string;

  @Column({ type: 'text', default: '' })
  description: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    // pg returns numeric as a string; keep price a number in JSON
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  price: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ default: 0 })
  stock: number;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.DRAFT,
  })
  status: ProductStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
