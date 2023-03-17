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
import { PlaceEntity } from '../../places/models/place.entity';
import { CatalogEntity } from '../../vendors/entities/catalog.entity';
import { MultiDistribEntity } from './multi-distrib.entity';
import { UserOrderEntity } from './user-order.entity';

@Index('Distribution_catalogId', ['catalogId'], {})
@Index('Distribution_placeId', ['placeId'], {})
@Index('Distribution_multiDistribId', ['multiDistribId'], {})
@Index(
  'Distribution_date_orderStartDate_orderEndDate',
  ['raw_date', 'raw_orderStartDate', 'raw_orderEndDate'],
  {},
)
@Entity('Distribution')
export class DistributionEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  /**
   * =========
   * RELATIONS
   * =========
   */
  /** */
  @Column('int')
  catalogId: number;

  @ManyToOne(() => CatalogEntity, { onDelete: 'CASCADE', onUpdate: 'RESTRICT' })
  @JoinColumn([{ name: 'catalogId', referencedColumnName: 'id' }])
  catalog: Promise<CatalogEntity>;

  /** */
  @Column('int')
  multiDistribId: number;

  @ManyToOne(
    () => MultiDistribEntity,
    (multiDistrib) => multiDistrib.distributions,
    {
      onDelete: 'CASCADE',
      onUpdate: 'RESTRICT',
    },
  )
  @JoinColumn([{ name: 'multiDistribId', referencedColumnName: 'id' }])
  multiDistrib: Promise<MultiDistribEntity>;

  /** */
  @Column('int')
  placeId: number;

  @ManyToOne(() => PlaceEntity, { onDelete: 'CASCADE', onUpdate: 'RESTRICT' })
  @JoinColumn([{ name: 'placeId', referencedColumnName: 'id' }])
  place: Promise<PlaceEntity>;

  @OneToMany(() => UserOrderEntity, (userOrder) => userOrder.distribution)
  userOrders: Promise<UserOrderEntity[]>;

  /**
   * ===
   * RAW
   * ===
   */
  /** */
  @Column('datetime', { name: 'date', nullable: true })
  raw_date: Date | null;

  get date() {
    if (!this.raw_date) return null;
    return zonedTimeToUtc(this.raw_date, TZ_PARIS);
  }

  set date(dateUtc: Date | null) {
    if (!dateUtc) this.raw_date = null;
    else this.raw_date = utcToZonedTime(dateUtc, TZ_PARIS);
  }

  /** */
  @Column('datetime', { name: 'end', nullable: true })
  raw_end: Date | null;

  get end() {
    if (!this.raw_end) return null;
    return zonedTimeToUtc(this.raw_end, TZ_PARIS);
  }

  set end(dateUtc: Date | null) {
    if (!dateUtc) this.raw_end = null;
    else this.raw_end = utcToZonedTime(dateUtc, TZ_PARIS);
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

  /**
   * Return a string like $placeId-$date.
   *
   * It's an ID representing all the distributions happening on that day at that place.
   */
  getKey(): string {
    return `${this.date.toString().substr(0, 10)}|${this.placeId.toString()}`;
  }
}
