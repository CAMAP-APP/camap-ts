import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CsaSubscriptionEntity } from '../../groups/entities/csa-subscription.entity';
import { UserEntity } from '../../users/models/user.entity';
import { ProductEntity } from '../../vendors/entities/product.entity';
import { BasketEntity } from './basket.entity';
import { DistributionEntity } from './distribution.entity';

@Index('UserOrder_productId', ['productId'], {})
@Index('UserOrder_userId2', ['userId2'], {})
@Index('UserOrder_userId', ['userId'], {})
@Index('UserOrder_distributionId', ['distributionId'], {})
@Index('UserOrder_basketId', ['basketId'], {})
@Index('UserOrder_subscriptionId', ['subscriptionId'], {})
@Entity('UserOrder')
export class UserOrderEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column('double')
  quantity: number;

  @Column('tinyint', { width: 1 })
  paid: boolean;

  @Column('datetime')
  date: Date;

  @Column('double')
  feesRate: number;

  @Column('double')
  productPrice: number;

  @Column('int')
  flags: number;

  /**
   * =========
   * RELATIONS
   * =========
   */
  /** */
  @Column('int', { name: 'basketId' })
  basketId: number;

  @ManyToOne(() => BasketEntity, (basket) => basket.userOrders, {
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'basketId', referencedColumnName: 'id' }])
  basket: Promise<BasketEntity | undefined>;

  /** */
  @Column('int')
  distributionId: number;

  @ManyToOne(() => DistributionEntity, (distribution) => distribution.userOrders, {
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'distributionId', referencedColumnName: 'id' }])
  distribution: Promise<DistributionEntity>;

  /** */
  @Column('int')
  productId: number;

  @ManyToOne(() => ProductEntity, (product) => product.userOrders, {
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'productId', referencedColumnName: 'id' }])
  product: Promise<ProductEntity>;

  /** */
  @Column('int')
  userId: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', onUpdate: 'RESTRICT' })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'id' }])
  user: Promise<UserEntity>;

  /** */
  @Column('int', { nullable: true })
  userId2: number | null;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', onUpdate: 'RESTRICT' })
  @JoinColumn([{ name: 'userId2', referencedColumnName: 'id' }])
  user2: Promise<UserEntity>;

  /** */
  @Column('int', { nullable: true })
  subscriptionId: number | null;

  @ManyToOne(
    () => CsaSubscriptionEntity,
    (subscription) => subscription.userOrders,
    {
      onDelete: 'SET NULL',
      onUpdate: 'RESTRICT',
    },
  )
  @JoinColumn([{ name: 'subscriptionId', referencedColumnName: 'id' }])
  subscription: Promise<CsaSubscriptionEntity>;
}
