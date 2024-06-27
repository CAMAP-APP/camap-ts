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
import { VolunteerRoleEntity } from '../../groups/entities/volunteer-role.entity';
import { DistributionEntity } from '../../shop/entities/distribution.entity';
import { UserEntity } from '../../users/models/user.entity';
import { CatalogType } from '../catalog.interface';
import { ProductEntity } from './product.entity';
import { VendorEntity } from './vendor.entity';
import { MultiDistribEntity } from '../../shop/entities/multi-distrib.entity';

export enum CatalogFlags {
  UsersCanOrder, // adhérents peuvent saisir eux meme la commande en ligne
  StockManagement, // gestion des commandes
  PercentageOnOrders, // calcul d'une commission supplémentaire
}

@Index('Catalog_vendorId', ['vendorId'], {})
@Index('Catalog_userId', ['userId'], {})
@Index('Catalog_groupId', ['groupId'], {})
@Index('Catalog_startDate_endDate', ['startDate', 'endDate'], {})
@Entity('Catalog')
export class CatalogEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { name: 'name', length: 64 })
  name: string;

  @Column('datetime')
  startDate: Date;

  @Column('datetime')
  endDate: Date;

  @Column('tinyint', { name: 'distributorNum' })
  distributorNum: number;

  @Column('int', { name: 'flags' })
  flags: number; // CatalogFlags enum

  @Column('varchar', { name: 'percentageName', nullable: true, length: 64 })
  percentageName: string | null;

  @Column('double', { name: 'percentageValue', nullable: true })
  percentageValue: number | null;

  @Column('int', { name: 'type' })
  type: CatalogType;

  @Column('mediumtext', { name: 'description', nullable: true })
  description: string | null;

  @Column('datetime', { nullable: true })
  absencesEndDate: Date | null;

  @Column('datetime', { nullable: true })
  absencesStartDate: Date | null;

  @Column('int')
  absentDistribsMaxNb: number;

  @Column('double')
  catalogMinOrdersTotal: number;

  @Column('double')
  distribMinOrdersTotal: number;

  // @Column('double', { nullable: true })
  // allowedOverspend: number | null;

  // @Column('tinyint', { nullable: true, width: 1 })
  // requiresOrdering: boolean | null;

  @Column('int', { nullable: true })
  orderEndHoursBeforeDistrib: number | null;

  @Column('int', { nullable: true })
  orderStartDaysBeforeDistrib: number | null;

  // @Column('tinyint', { width: 1 })
  // hasPayments: boolean;

  /**
   * =========
   * RELATIONS
   * =========
   */
  /** */
  @Column('int', { name: 'userId', nullable: true })
  userId: number | null;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', onUpdate: 'RESTRICT' })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'id' }])
  user: Promise<UserEntity>;

  /** */
  @Column('int', { name: 'groupId' })
  groupId: number;

  @ManyToOne(() => GroupEntity, (group) => group.catalogs, {
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'groupId', referencedColumnName: 'id' }])
  group: Promise<GroupEntity>;


  /** */
  @Column('int', { name: 'firstDistribId', nullable: true })
  firstDistribId: number | null;

  @ManyToOne(() => MultiDistribEntity, {
    onDelete: 'SET NULL',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'firstDistribId', referencedColumnName: 'id' }])
  firstDistrib: Promise<MultiDistribEntity>;

  /** */
  @Column('int', { name: 'vendorId' })
  vendorId: number;

  @ManyToOne(() => VendorEntity, (vendor) => vendor.catalogs, {
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'vendorId', referencedColumnName: 'id' }])
  vendor: Promise<VendorEntity>;

  /** */
  @OneToMany(() => DistributionEntity, (distribution) => distribution.catalog)
  distributions: Promise<DistributionEntity[]>;

  /** */
  @OneToMany(() => ProductEntity, (product) => product.catalog)
  products: Promise<ProductEntity[]>;

  /** */
  @OneToMany(() => VolunteerRoleEntity, (volunteerRole) => volunteerRole.catalog)
  volunteerRoles: VolunteerRoleEntity[];

  /** */
  @OneToMany(() => CsaSubscriptionEntity, (subscription) => subscription.catalog)
  subscriptions: Promise<CsaSubscriptionEntity[]>;
}
