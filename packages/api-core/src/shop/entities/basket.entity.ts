import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OperationEntity } from '../../payments/entities/operation.entity';
import { UserEntity } from '../../users/models/user.entity';
import { MultiDistribEntity } from './multi-distrib.entity';
import { UserOrderEntity } from './user-order.entity';

export enum BasketStatus {
  OPEN = 'OPEN',
  PAYMENT_PROCESSING = 'PAYMENT_PROCESSING',
  CONFIRMED = 'CONFIRMED',
  VALIDATED = 'VALIDATED',
  // CANCELED = 'CANCELED',
}

@Index('Basket_userId', ['userId'], {})
@Index('Basket_multiDistribId', ['multiDistribId'], {})
@Entity('Basket')
export class BasketEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('datetime', { name: 'cdate' })
  cdate: Date;

  @Column('int', { name: 'num' })
  num: number;

  @Column('double')
  total: number;

  @Column({ type: 'enum', enum: BasketStatus })
  status: BasketStatus;

  @Column('mediumtext')
  data: string;

  /**
   * =========
   * RELATIONS
   * =========
   */
  @Column('int', { name: 'multiDistribId' })
  multiDistribId: number;

  @ManyToOne(() => MultiDistribEntity, (multiDistrib) => multiDistrib.baskets, {
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'multiDistribId', referencedColumnName: 'id' }])
  multiDistrib: Promise<MultiDistribEntity>;

  @Column('int', { name: 'userId', nullable: true })
  userId: number | null;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', onUpdate: 'RESTRICT' })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'id' }])
  user: Promise<UserEntity | undefined>;

  @OneToMany(() => UserOrderEntity, (userOrder) => userOrder.basket)
  userOrders: Promise<UserOrderEntity[]>;

  @OneToMany(() => OperationEntity, (operation) => operation.basket)
  operations: Promise<OperationEntity[]>;
}
