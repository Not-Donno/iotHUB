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
import { decimalTransformer } from '../../common/decimal.transformer.js';

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

  // free-text grouping for the catalogue filter, folded to lowercase on write
  // so "Sensors" and "sensors" are one category. '' means uncategorised.
  @Column({ type: 'text', default: '' })
  category: string;

  // a URL to the image, not an upload: nothing is fetched server-side, so a
  // vendor-hosted (or CDN) URL is enough for the catalogue, OG tags and JSON-LD
  @Column({ type: 'text', default: '' })
  image_url: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  price: number;

  // NPR is the marketplace default; a vendor can still list in another currency
  @Column({ default: 'NPR' })
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
