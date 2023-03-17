import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CsaSubscriptionEntity } from '../../groups/entities/csa-subscription.entity';
import { GroupEntity } from '../../groups/entities/group.entity';
import { MembershipEntity } from '../../groups/entities/membership.entity';
import { BasketEntity } from '../../shop/entities/basket.entity';
import { UserEntity } from '../../users/models/user.entity';
import { PaymentTypeId } from '../interfaces';
import { OperationType } from '../OperationType';

export interface PaymentOperationTypeData {
  type: PaymentTypeId; // payment type (PSP)
  remoteOpId?: string; // PSP operation ID
}
interface OrderOperationTypeData {
  basketId: number;
}
interface SubscriptionTotalOperationTypeData {
  subscriptionId: number;
}
interface MembershipOperationTypeData {
  year: number;
}

export type OperationData =
  | PaymentOperationTypeData
  | OrderOperationTypeData
  | SubscriptionTotalOperationTypeData
  | MembershipOperationTypeData;

@Index('Operation_groupId', ['groupId'], {})
@Index('Operation_userId', ['userId'], {})
@Index('Operation_relationId', ['relationId'], {})
@Index('Operation_basketId', ['basketId'], {})
@Index('Operation_subscriptionId', ['subscriptionId'], {})
@Entity('Operation')
export class OperationEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column('varchar', { length: 128 })
  name: string;

  @Column('double')
  amount: number;

  @Column('datetime')
  date: Date;

  @Column('tinyint', { unsigned: true })
  type: OperationType;

  @Column('tinyint', { width: 1 })
  pending: boolean;

  /**
   * =========
   * RELATIONS
   * =========
   */
  /**
   * n-1 GroupEntity
   */
  @Column('int')
  groupId: number;

  @ManyToOne(
    () => GroupEntity,
    /* (group) => group.operations, */ { onDelete: 'CASCADE', onUpdate: 'RESTRICT' },
  )
  @JoinColumn([{ name: 'groupId', referencedColumnName: 'id' }])
  group: GroupEntity;

  /**
   * n-1 UserEntity
   */
  @Column('int')
  userId: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', onUpdate: 'RESTRICT' })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'id' }])
  user: UserEntity;

  /**
   * n-1 OperationEntity
   */
  @Column('int', { name: 'relationId', nullable: true })
  relationId: number | null;

  @ManyToOne(
    () => OperationEntity,
    /* (operation) => operation.operations, */ {
      onDelete: 'SET NULL',
      onUpdate: 'RESTRICT',
    },
  )
  @JoinColumn([{ name: 'relationId', referencedColumnName: 'id' }])
  relation: OperationEntity;

  /**
   * n-1 BasketEntity
   */
  @Column('int', { nullable: true })
  basketId: number | null;

  @ManyToOne(() => BasketEntity, (basket) => basket.operations, {
    onDelete: 'SET NULL',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'basketId', referencedColumnName: 'id' }])
  basket: Promise<BasketEntity>;

  /**
   * n-1 SubscriptionEntity
   */
  @Column('int', { nullable: true })
  subscriptionId: number | null;

  @ManyToOne(
    () => CsaSubscriptionEntity,
    (subscription) => subscription.operations,
    {
      onDelete: 'SET NULL',
      onUpdate: 'RESTRICT',
    },
  )
  @JoinColumn([{ name: 'subscriptionId', referencedColumnName: 'id' }])
  subscription: CsaSubscriptionEntity;

  /**
   * 1-n MembershipEntity
   */
  @OneToMany(() => MembershipEntity, (membership) => membership.operation)
  memberships: MembershipEntity[];

  /**
   * ===
   * RAW
   * ===
   */
  @Column('varchar', { nullable: true, length: 256, name: 'data' })
  raw_data: string | null;

  get data(): OperationData | null {
    if (!this.raw_data) return null;
    try {
      switch (this.type) {
        case OperationType.Order:
          return JSON.parse(this.raw_data) as OrderOperationTypeData;
        case OperationType.SubscriptionTotal:
          return JSON.parse(this.raw_data) as SubscriptionTotalOperationTypeData;
        case OperationType.Payment:
          return JSON.parse(this.raw_data) as PaymentOperationTypeData;
        case OperationType.Membership:
          return JSON.parse(this.raw_data) as MembershipOperationTypeData;
      }
    } catch (error) {
      throw new Error("can't parse OperationEntity:data");
    }
  }

  set data(value: OperationData | null) {
    this.raw_data = value ? JSON.stringify(value) : null;
  }
}
