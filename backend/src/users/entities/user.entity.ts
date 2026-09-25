import {Entity,PrimaryGeneratedColumn,Column,CreateDateColumn} from 'typeorm' 

export enum UserRole {
  CUSTOMER= 'customer',
  VENDOR= 'vendor',
  ADMIN='admin',
}

@Entity('users')
export class User{
  @PrimaryGeneratedColumn('uuid')
  id:string;

  @Column()
  email:string;

  @Column()
  password_hash:string;


  @Column({
  
  type:'enum',
  enum:UserRole,
  default: UserRole.CUSTOMER,
  })
  role:UserRole;

  @Column({default:true})
  is_active:boolean;
  @CreateDateColumn()
  created_at:Date
}
