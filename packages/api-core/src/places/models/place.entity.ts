import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GroupEntity } from '../../groups/entities/group.entity';
import { DistributionCycleEntity } from '../../shop/entities/distribution-cycle.entity';
import { DistributionEntity } from '../../shop/entities/distribution.entity';
import { MultiDistribEntity } from '../../shop/entities/multi-distrib.entity';

@Index('Place_groupId', ['groupId'], {})
@Index('Place_lat_lng', ['lat', 'lng'], {})
@Entity('Place')
export class PlaceEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { name: 'name', length: 64 })
  name: string;

  @Column('varchar', { name: 'address1', nullable: true, length: 64 })
  address1: string | null;

  @Column('varchar', { name: 'address2', nullable: true, length: 64 })
  address2: string | null;

  @Column('varchar', { name: 'city', length: 64 })
  city: string;

  @Column('varchar', { name: 'zipCode', length: 32 })
  zipCode: string;

  @Column('int', { name: 'groupId' })
  groupId: number;

  @Column('double', { name: 'lat', nullable: true })
  lat: number | null;

  @Column('double', { name: 'lng', nullable: true })
  lng: number | null;

  @Column('varchar', { name: 'country', nullable: true, length: 64 })
  country: string | null;

  @OneToMany(() => DistributionEntity, (distribution) => distribution.place)
  distributions: Promise<DistributionEntity[]>;

  @OneToMany(
    () => DistributionCycleEntity,
    (distributionCycle) => distributionCycle.place,
  )
  distributionCycles: Promise<DistributionCycleEntity[]>;

  @OneToMany(() => GroupEntity, (group) => group.place)
  groups: Promise<GroupEntity[]>;

  @OneToMany(() => MultiDistribEntity, (multiDistrib) => multiDistrib.place)
  multiDistribs: Promise<MultiDistribEntity[]>;

  @ManyToOne(() => GroupEntity, (group) => group.places, {
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'groupId', referencedColumnName: 'id' }])
  group: Promise<GroupEntity>;
}
