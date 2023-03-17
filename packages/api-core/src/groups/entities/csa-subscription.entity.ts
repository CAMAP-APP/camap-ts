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
import { UserOrderEntity } from '../../shop/entities/user-order.entity';
import { UserEntity } from '../../users/models/user.entity';
import { CatalogEntity } from '../../vendors/entities/catalog.entity';

@Index('Subscription_catalogId', ['catalogId'], {})
@Index('Subscription_userId', ['userId'], {})
@Index('Subscription_userId2', ['userId2'], {})
@Entity('Subscription')
export class CsaSubscriptionEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column('datetime')
  startDate: Date;

  @Column('datetime')
  endDate: Date;

  // @Column('tinyint', { width: 1 })
  // isPaid: boolean;

  @Column('mediumtext', { nullable: true })
  absentDistribIds: string | null;

  @Column('mediumtext', { nullable: true })
  defaultOrders: string | null;

  /**
   * =========
   * RELATIONS
   * =========
   */
  /**
   * n-1 UserEntity
   */
  @Column('int', { name: 'userId' })
  userId: number;

  @ManyToOne(() => UserEntity, (user) => user.subscriptions, {
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'id' }])
  user: Promise<UserEntity>;

  /** */
  @Column('int', { nullable: true })
  userId2: number | null;

  @ManyToOne(() => UserEntity, (user) => user.subscriptions2, {
    onDelete: 'SET NULL',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'userId2', referencedColumnName: 'id' }])
  user2?: Promise<UserEntity>;

  /**
   * n-1 CatalogEntity
   */
  @Column('int')
  catalogId: number;

  @ManyToOne(() => CatalogEntity, (catalog) => catalog.subscriptions, {
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'catalogId', referencedColumnName: 'id' }])
  catalog: Promise<CatalogEntity>;

  /**
   * 1-n OperationEntity
   */
  @OneToMany(() => OperationEntity, (operation) => operation.subscription)
  operations: Promise<OperationEntity[]>;

  @OneToMany(() => UserOrderEntity, (userOrder) => userOrder.subscription)
  userOrders: UserOrderEntity[];
}
