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
import { PlaceEntity } from '../../places/models/place.entity';
import { MultiDistribEntity } from './multi-distrib.entity';

export enum DistributionCycleType {
  Weekly,
  Monthly,
  BiWeekly,
  TriWeekly,
}

@Index('DistributionCycle_placeId', ['placeId'], {})
@Index('DistributionCycle_groupId', ['groupId'], {})
@Entity('DistributionCycle')
export class DistributionCycleEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('tinyint', { name: 'cycleType', unsigned: true })
  cycleType: DistributionCycleType;

  @Column('int', { name: 'groupId' })
  groupId: number;

  @Column('int', { name: 'placeId' })
  placeId: number;

  @Column('tinyint', { name: 'daysBeforeOrderStart', nullable: true })
  daysBeforeOrderStart: number | null;

  @Column('tinyint', { name: 'daysBeforeOrderEnd', nullable: true })
  daysBeforeOrderEnd: number | null;

  @ManyToOne(() => GroupEntity, (group) => group.distributionCycles, {
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'groupId', referencedColumnName: 'id' }])
  group: GroupEntity;

  @ManyToOne(() => PlaceEntity, (place) => place.distributionCycles, {
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'placeId', referencedColumnName: 'id' }])
  place: PlaceEntity;

  @OneToMany(
    () => MultiDistribEntity,
    (multiDistrib) => multiDistrib.distributionCycle,
  )
  multiDistribs: MultiDistribEntity[];

  /**
   * ===
   * RAW
   * ===
   */
  @Column('datetime', { name: 'startDate' })
  raw_startDate: Date;

  get startDate() {
    return zonedTimeToUtc(this.raw_startDate, TZ_PARIS);
  }

  set startDate(dateUtc: Date) {
    this.raw_startDate = utcToZonedTime(dateUtc, TZ_PARIS);
  }

  @Column('datetime', { name: 'endDate' })
  raw_endDate: Date;

  get endDate() {
    return zonedTimeToUtc(this.raw_endDate, TZ_PARIS);
  }

  set endDate(dateUtc: Date) {
    this.raw_endDate = utcToZonedTime(dateUtc, TZ_PARIS);
  }

  @Column('datetime', { name: 'startHour' })
  raw_startHour: Date;

  get startHour() {
    return zonedTimeToUtc(this.raw_startHour, TZ_PARIS);
  }

  set startHour(dateUtc: Date) {
    this.raw_startHour = utcToZonedTime(dateUtc, TZ_PARIS);
  }

  @Column('datetime', { name: 'endHour' })
  raw_endHour: Date;

  get endHour() {
    return zonedTimeToUtc(this.raw_endHour, TZ_PARIS);
  }

  set endHour(dateUtc: Date) {
    this.raw_endHour = utcToZonedTime(dateUtc, TZ_PARIS);
  }

  @Column('datetime', { name: 'openingHour' })
  raw_openingHour: Date;

  get openingHour() {
    return zonedTimeToUtc(this.raw_openingHour, TZ_PARIS);
  }

  set openingHour(dateUtc: Date) {
    this.raw_openingHour = utcToZonedTime(dateUtc, TZ_PARIS);
  }

  @Column('datetime', { name: 'closingHour' })
  raw_closingHour: Date;

  get closingHour() {
    return zonedTimeToUtc(this.raw_closingHour, TZ_PARIS);
  }

  set closingHour(dateUtc: Date) {
    this.raw_closingHour = utcToZonedTime(dateUtc, TZ_PARIS);
  }
}
