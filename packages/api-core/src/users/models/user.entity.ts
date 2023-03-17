import { Exclude } from 'class-transformer';
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { hasFlag } from '../../common/haxeCompat';
import { CsaSubscriptionEntity } from '../../groups/entities/csa-subscription.entity';
import { GroupEntity } from '../../groups/entities/group.entity';

export enum RightSite {
  SuperAdmin,
}

@Index('User_email', ['email'], { unique: true })
@Index('User_email2', ['email2'], {})
@Entity('User')
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column('varchar', { length: 2 })
  lang: string;

  @Column('tinytext')
  @Exclude()
  pass: string; // Legacy. Hashed with MD5

  @Column('tinytext')
  @Exclude()
  pass2: string; // Hashed with Bcrypt

  @Column('int')
  rights: number; // haxe flags with RightSite

  @Column('varchar', { length: 32 })
  firstName: string;

  @Column('varchar', { length: 32 })
  lastName: string;

  @Column('varchar', { length: 64 })
  email: string;

  @Column('varchar', { nullable: true, length: 19 })
  phone: string | null;

  @Column('varchar', { nullable: true, length: 32 })
  firstName2: string | null;

  @Column('varchar', { nullable: true, length: 32 })
  lastName2: string | null;

  @Column('varchar', { nullable: true, length: 64 })
  email2: string | null;

  @Column('varchar', { nullable: true, length: 19 })
  phone2: string | null;

  @Column('varchar', { nullable: true, length: 64 })
  address1: string | null;

  @Column('varchar', { nullable: true, length: 64 })
  address2: string | null;

  @Column('varchar', { nullable: true, length: 32 })
  zipCode: string | null;

  @Column('varchar', { nullable: true, length: 25 })
  city: string | null;

  @Column('datetime', { nullable: true })
  ldate: Date | null;

  @Column('datetime')
  cdate: Date;

  @Column('int')
  flags: number;

  @Column('varchar', { nullable: true, length: 2 })
  nationality: string | null;

  @Column('int', { nullable: true })
  tosVersion: number | null;

  @Column('varchar', { nullable: true, length: 2 })
  countryOfResidence: string | null;

  @Column('date', { nullable: true })
  birthDate: Date | null;

  @Column('varchar', { nullable: true, length: 128 })
  @Exclude()
  apiKey: string | null;

  @Column('varchar', { nullable: true })
  @Exclude()
  currentRefreshToken: string;

  /**
   * =========
   * RELATIONS
   * =========
   */
  /** */
  @OneToMany(() => CsaSubscriptionEntity, (subscription) => subscription.user)
  subscriptions: CsaSubscriptionEntity[];

  /** */
  @OneToMany(() => CsaSubscriptionEntity, (subscription) => subscription.user2)
  subscriptions2: CsaSubscriptionEntity[];

  /** */
  @OneToMany(() => GroupEntity, (group) => group.legalRepr)
  groups2: GroupEntity[];

  /**
   * =====
   * UTILS
   * =====
   */
  isSuperAdmin() {
    return hasFlag(RightSite.SuperAdmin, this.rights);
  }
}
