import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MessageEntity } from '../../entities/message.entity';
import { WaitingListEntity } from '../../entities/waiting-list.entity';
import { PaymentTypeId } from '../../payments/interfaces';
import { PlaceEntity } from '../../places/models/place.entity';
import { DistributionCycleEntity } from '../../shop/entities/distribution-cycle.entity';
import { MultiDistribEntity } from '../../shop/entities/multi-distrib.entity';
import { FileEntity } from '../../tools/models/file.entity';
import { UserEntity } from '../../users/models/user.entity';
import { CatalogEntity } from '../../vendors/entities/catalog.entity';
import { GroupPreviewCatalogs } from '../types/group-preview-catalogs.type';
import { GroupPreviewMembers } from '../types/group-preview-members.type';
import { GroupPreview } from '../types/group-preview.type';
import { MembershipEntity } from './membership.entity';
import { UserGroupEntity } from './user-group.entity';
import { VolunteerRoleEntity } from './volunteer-role.entity';

export enum GroupDisabledReason {
  BLOCKED_BY_ADMIN = 'BLOCKED_BY_ADMIN',
  MOVED = 'MOVED',
}

@Index('Group_userId', ['userId'], {})
@Index('Group_imageId', ['imageId'], {})
@Index('Group_placeId', ['placeId'], {})
@Index('Group_legalReprId', ['legalReprId'], {})
@Entity('Group')
export class GroupEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column('varchar', { length: 64 })
  name: string;

  @Column('mediumtext', { nullable: true })
  txtDistrib: string | null;

  @Column('mediumtext', { nullable: true })
  txtIntro: string | null;

  @Column('int')
  flags: number;

  @Column('date', { nullable: true })
  membershipRenewalDate: string | null;

  @Column('tinyint', { nullable: true })
  membershipFee: number | null;

  @Column('mediumtext', { nullable: true })
  txtHome: string | null;

  @Column('simple-json', { nullable: true })
  vatRates: { label: string; value: number }[] | null;

  @Column('datetime')
  cdate: Date;

  @Column('tinyint', { unsigned: true })
  regOption: number;

  @Column('varchar', { length: 3 })
  currencyCode: string;

  @Column('varchar', { length: 12 })
  currency: string;

  @Column('varchar', { nullable: true, length: 64 })
  extUrl: string | null;

  @Column('varchar', { name: 'IBAN', nullable: true, length: 40 })
  iban: string | null;

  @Column('varchar', { nullable: true, length: 64 })
  checkOrder: string | null;

  @Column('tinyint', { nullable: true, unsigned: true })
  groupType: number | null;

  @Column('tinyint', {
    nullable: true,
    width: 1,
  })
  allowMoneyPotWithNegativeBalance: boolean | null;

  @Column('tinyint')
  volunteersMailDaysBeforeDutyPeriod: number;

  @Column('int')
  daysBeforeDutyPeriodsOpen: number;

  @Column('mediumtext')
  volunteersMailContent: string;

  @Column('tinyint')
  vacantVolunteerRolesMailDaysBeforeDutyPeriod: number;

  @Column('mediumtext')
  alertMailContent: string;

  @Column('int')
  betaFlags: number;

  @Column('tinyint', { width: 1 })
  hasMembership: boolean;

  /**
   * =========
   * RELATIONS
   * =========
   */
  /**
   * OneToOne
   */

  /**
   * ManyToOne
   */
  @Column('int', { nullable: true })
  userId: number | null;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', onUpdate: 'RESTRICT' })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'id' }])
  user: Promise<UserEntity>;

  /** */
  @Column('int', { nullable: true })
  imageId: number | null;

  @ManyToOne(
    () => FileEntity,
    /* (file) => file.groups, */ { onDelete: 'SET NULL', onUpdate: 'RESTRICT' },
  )
  @JoinColumn([{ name: 'imageId', referencedColumnName: 'id' }])
  image: FileEntity;

  /** */
  @Column('int', { name: 'placeId', nullable: true })
  placeId: number | null;

  @ManyToOne(() => PlaceEntity, (place) => place.groups, {
    onDelete: 'SET NULL',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'placeId', referencedColumnName: 'id' }])
  place: Promise<PlaceEntity>;

  /** */
  @Column('int', { nullable: true })
  legalReprId: number | null;

  @ManyToOne(() => UserEntity, (user) => user.groups2, {
    onDelete: 'SET NULL',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'legalReprId', referencedColumnName: 'id' }])
  legalRepr: UserEntity;

  /**
   * OneToMany
   */
  @OneToMany(() => CatalogEntity, (catalog) => catalog.group)
  catalogs: Promise<CatalogEntity[]>;

  @OneToMany(
    () => DistributionCycleEntity,
    (distributionCycle) => distributionCycle.group,
  )
  distributionCycles: DistributionCycleEntity[];

  @OneToMany(() => MembershipEntity, (membership) => membership.group)
  memberships: MembershipEntity[];

  @OneToMany(() => MessageEntity, (message) => message.amap)
  messages: MessageEntity[];

  @OneToMany(() => MultiDistribEntity, (multiDistrib) => multiDistrib.group)
  multiDistribs: Promise<MultiDistribEntity[]>;

  @OneToMany(() => PlaceEntity, (place) => place.group)
  places: Promise<PlaceEntity[]>;

  @OneToMany(() => UserGroupEntity, (userGroup) => userGroup.group)
  userGroups: Promise<UserGroupEntity[]>;

  @OneToMany(() => VolunteerRoleEntity, (volunteerRole) => volunteerRole.group)
  volunteerRoles: Promise<VolunteerRoleEntity[]>;

  @OneToMany(() => WaitingListEntity, (waitingList) => waitingList.amap)
  waitingLists: WaitingListEntity[];

  @Column('simple-json', { nullable: true })
  allowedPaymentsType: PaymentTypeId[] | null;

  @Column({ type: 'enum', enum: GroupDisabledReason, nullable: true })
  disabled: GroupDisabledReason | null;

  /**
   * =======
   * HELPERS
   * =======
   */
  getPreview(): Pick<
    GroupPreview,
    | 'id'
    | 'name'
    | 'allowedPaymentsType'
    | 'currencyCode'
    | 'flags'
    | 'betaFlags'
    | 'iban'
    | 'disabled'
    | 'extUrl'
  > {
    return {
      id: this.id,
      name: this.name,
      allowedPaymentsType: this.allowedPaymentsType,
      currencyCode: this.currencyCode,
      flags: this.flags,
      betaFlags: this.betaFlags,
      iban: this.iban,
      disabled: this.disabled,
      extUrl: this.extUrl,
    };
  }

  getPreviewMembers(): GroupPreviewMembers {
    return {
      id: this.id,
      name: this.name,
      hasMembership: !!this.hasMembership,
      membershipFee: this.membershipFee,
    };
  }

  getPreviewCatalogs(): GroupPreviewCatalogs {
    return {
      id: this.id,
      name: this.name,
      flags: this.flags,
    };
  }
}
