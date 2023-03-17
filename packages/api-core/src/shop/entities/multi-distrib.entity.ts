import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TZ_PARIS } from '../../common/constants';
import { GroupEntity } from '../../groups/entities/group.entity';
import { MembershipEntity } from '../../groups/entities/membership.entity';
import { VolunteerEntity } from '../../groups/entities/volunteer.entity';
import { PlaceEntity } from '../../places/models/place.entity';
import { BasketEntity } from './basket.entity';
import { DistributionCycleEntity } from './distribution-cycle.entity';
import { DistributionEntity } from './distribution.entity';

export enum MultiDistribValidatedStatus {
  NOT_VALIDATED = 'NOT_VALIDATED',
  VALIDATED = 'VALIDATED',
}

@Index('MultiDistrib_groupId', ['groupId'], {})
@Index('MultiDistrib_placeId', ['placeId'], {})
@Index('MultiDistrib_distributionCycleId', ['distributionCycleId'], {})
@Index('MultiDistrib_distribStartDate', ['raw_distribStartDate'], {})
@Entity('MultiDistrib')
export class MultiDistribEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column('simple-array', { nullable: true })
  volunteerRolesIds: number[] | null;

  @Column('double')
  counterBeforeDistrib: number;

  @Column('tinyint', { nullable: true, width: 1 })
  validated: boolean | null;

  @Column({
    type: 'enum',
    enum: MultiDistribValidatedStatus,
    default: MultiDistribValidatedStatus.NOT_VALIDATED,
  })
  validatedStatus: MultiDistribValidatedStatus;

  @Column('datetime', { nullable: true })
  validatedDate: Date | null;

  /**
   * =========
   * RELATIONS
   * =========
   */
  /** */
  @Column('int', { nullable: true })
  distributionCycleId: number | null;

  @ManyToOne(
    () => DistributionCycleEntity,
    (distributionCycle) => distributionCycle.multiDistribs,
    {
      onDelete: 'SET NULL',
      onUpdate: 'RESTRICT',
    },
  )
  @JoinColumn([{ name: 'distributionCycleId', referencedColumnName: 'id' }])
  distributionCycle: DistributionCycleEntity;

  /** */
  @Column('int')
  groupId: number;

  @ManyToOne(() => GroupEntity, (group) => group.multiDistribs, {
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'groupId', referencedColumnName: 'id' }])
  group: Promise<GroupEntity>;

  /** */
  @Column('int')
  placeId: number;

  @ManyToOne(() => PlaceEntity, (place) => place.multiDistribs, {
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'placeId', referencedColumnName: 'id' }])
  place: Promise<PlaceEntity>;

  /** */
  @OneToMany(() => VolunteerEntity, (volunteer) => volunteer.multiDistrib)
  volunteers: Promise<VolunteerEntity[]>;

  /** */
  @OneToMany(() => BasketEntity, (basket) => basket.multiDistrib)
  baskets: Promise<BasketEntity[]>;

  /** */
  @OneToMany(() => DistributionEntity, (distribution) => distribution.multiDistrib)
  distributions: Promise<DistributionEntity[]>;

  /** */
  @OneToMany(() => MembershipEntity, (membership) => membership.distribution)
  memberships: MembershipEntity[];

  /**
   * ===
   * RAW
   * ===
   */
  /** */
  @Column('datetime', { name: 'distribStartDate' })
  raw_distribStartDate: Date;

  get distribStartDate(): Date {
    return zonedTimeToUtc(this.raw_distribStartDate, TZ_PARIS);
  }

  set distribStartDate(dateUtc: Date) {
    this.raw_distribStartDate = utcToZonedTime(dateUtc, TZ_PARIS);
  }

  /** */
  @Column('datetime', { name: 'distribEndDate' })
  raw_distribEndDate: Date;

  get distribEndDate(): Date {
    return zonedTimeToUtc(this.raw_distribEndDate, TZ_PARIS);
  }

  set distribEndDate(dateUtc: Date) {
    this.raw_distribEndDate = utcToZonedTime(dateUtc, TZ_PARIS);
  }

  /** */
  @Column('datetime', { name: 'orderStartDate' })
  raw_orderStartDate: Date;

  get orderStartDate() {
    return zonedTimeToUtc(this.raw_orderStartDate, TZ_PARIS);
  }

  set orderStartDate(dateUtc: Date) {
    this.raw_orderStartDate = utcToZonedTime(dateUtc, TZ_PARIS);
  }

  /** */
  @Column('datetime', { name: 'orderEndDate' })
  raw_orderEndDate: Date;

  get orderEndDate() {
    return zonedTimeToUtc(this.raw_orderEndDate, TZ_PARIS);
  }

  set orderEndDate(dateUtc: Date) {
    this.raw_orderEndDate = utcToZonedTime(dateUtc, TZ_PARIS);
  }

}
