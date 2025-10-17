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
import { FileEntity } from '../../tools/models/file.entity';
import { CatalogEntity } from './catalog.entity';
import { UserEntity } from 'src/users/models/user.entity';

export enum VendorDisabledReason {
  IncompleteLegalInfos, //0 : incomplete legal infos
  NotCompliantWithPolicy, //1 : not compliant with policy (charte des producteurs)
  Banned, //2 : banned by network administrateurs
}

export enum BetaFlags { }

@Index('Vendor_imageId', ['imageId'], {})
@Entity('Vendor')
export class VendorEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;
  
  @Column('int', { nullable: true })
  userId: number | null;
  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', onUpdate: 'RESTRICT' })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'id' }])
  user: Promise<UserEntity>;

  @Column('varchar', { length: 128 })
  name: string;

  @Column('varchar', { nullable: true, length: 128 })
  email: string | null;

  @Column('varchar', { name: 'city', length: 25 })
  city: string;

  @Column('varchar', { name: 'address1', nullable: true, length: 64 })
  address1: string | null;

  @Column('varchar', { name: 'address2', nullable: true, length: 64 })
  address2: string | null;

  @Column('varchar', { name: 'zipCode', length: 32 })
  zipCode: string;

  @Column('varchar', { name: 'phone', nullable: true, length: 19 })
  phone: string | null;

  @Column('varchar', { name: 'linkText', nullable: true, length: 256 })
  linkText: string | null;

  @Column('mediumtext', { name: 'desc', nullable: true })
  desc: string | null;

  @Column('varchar', { name: 'linkUrl', nullable: true, length: 256 })
  linkUrl: string | null;

  @Column('varchar', { name: 'country', nullable: true, length: 64 })
  country: string | null;

  @Column('mediumtext', { name: 'longDesc', nullable: true })
  longDesc: string | null;

  @Column('int', { name: 'profession', nullable: true })
  profession: number | null;

  @Column('int', { name: 'production2', nullable: true })
  production2: number | null;

  @Column('int', { name: 'production3', nullable: true })
  production3: number | null;

  @Column('tinyint', { name: 'directory', width: 1 })
  directory: boolean;

  @Column('varchar', { name: 'peopleName', nullable: true, length: 128 })
  peopleName: string | null;

  @Column('datetime', { nullable: true })
  cdate: Date | null;

  @Column('double', { nullable: true })
  lng: number | null;

  @Column('double', { nullable: true })
  lat: number | null;

  /**
   * =========
   * RELATIONS
   * =========
   */
  /** */
  @OneToMany(() => CatalogEntity, (catalog) => catalog.vendor)
  catalogs: Promise<CatalogEntity[]>;

  @Column('int', { nullable: true })
  imageId: number | null;

  @ManyToOne(() => FileEntity, (file) => file.vendors, {
    onDelete: 'SET NULL',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'imageId', referencedColumnName: 'id' }])
  image: Promise<FileEntity>;


  /**
   * RAW
   */
  @Column('tinyint', { name: 'disabled', nullable: true, unsigned: true })
  raw_disabled: number | null;

  get disabled(): VendorDisabledReason | null {
    if (this.raw_disabled === null) return null;

    switch (this.raw_disabled) {
      case 0:
        return VendorDisabledReason.IncompleteLegalInfos;
      case 1:
        return VendorDisabledReason.NotCompliantWithPolicy;
      case 2:
        return VendorDisabledReason.Banned;
      default:
        throw new Error("can't parse VendorEntity:disabled");
    }
  }

  set disabled(value: VendorDisabledReason | null) {
    if (value === null) {
      this.raw_disabled = null;
      return;
    }

    switch (value) {
      case 0:
        this.raw_disabled = VendorDisabledReason.IncompleteLegalInfos;
        return;
      case 1:
        this.raw_disabled = VendorDisabledReason.NotCompliantWithPolicy;
        return;
      case 2:
        this.raw_disabled = VendorDisabledReason.Banned;
        return;
      default:
        throw new Error("can't serialize VendorEntity:disabled");
    }
  }
}
