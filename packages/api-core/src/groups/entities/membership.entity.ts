import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { GroupEntity } from './group.entity';
import { UserEntity } from '../../users/models/user.entity';
import { MultiDistribEntity } from '../../shop/entities/multi-distrib.entity';
import { OperationEntity } from '../../payments/entities/operation.entity';

@Index('Membership_operationId', ['operationId'], {})
@Index('Membership_distributionId', ['distributionId'], {})
@Index('Membership_groupId', ['groupId'], {})
@Entity('Membership')
export class MembershipEntity {
  @Column('int', { primary: true })
  year: number;

  @Column('date', { nullable: true })
  date: Date | null;

  @Column('double')
  amount: number;

  /**
   * =========
   * RELATIONS
   * =========
   */
  /**
   * 1-1 OperationEntity
   */
  @Column('int', { nullable: true })
  operationId: number | null;

  @ManyToOne(() => OperationEntity, (operation) => operation.memberships, {
    onDelete: 'SET NULL',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'operationId', referencedColumnName: 'id' }])
  operation: Promise<OperationEntity>;

  /**
   * n-1 MultiDistribEntity
   */
  @Column('int', { nullable: true })
  distributionId: number | null;

  @ManyToOne(() => MultiDistribEntity, (multiDistrib) => multiDistrib.memberships, {
    onDelete: 'SET NULL',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'distributionId', referencedColumnName: 'id' }])
  distribution: Promise<MultiDistribEntity>;

  /**
   * n-1 GroupEntity
   */
  @Column('int', { primary: true })
  groupId: number;

  @ManyToOne(() => GroupEntity, (group) => group.memberships, { onDelete: 'CASCADE', onUpdate: 'RESTRICT' })
  @JoinColumn([{ name: 'groupId', referencedColumnName: 'id' }])
  group: Promise<GroupEntity>;

  /**
   *  n-1 UserEntity
   */
  @Column('int', { primary: true })
  userId: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', onUpdate: 'RESTRICT' })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'id' }])
  user: Promise<UserEntity>;
}
