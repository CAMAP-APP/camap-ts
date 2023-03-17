import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CatalogEntity } from '../../vendors/entities/catalog.entity';
import { GroupEntity } from './group.entity';
import { VolunteerEntity } from './volunteer.entity';

@Index('VolunteerRole_groupId', ['groupId'], {})
@Index('VolunteerRole_catalogId', ['catalogId'], {})
@Entity('VolunteerRole')
export class VolunteerRoleEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { name: 'name', length: 64 })
  name: string;

  @Column('int', { name: 'groupId' })
  groupId: number;

  @Column('int', { name: 'catalogId', nullable: true })
  catalogId: number | null;

  @OneToMany(() => VolunteerEntity, (volunteer) => volunteer.volunteerRole)
  volunteers: VolunteerEntity[];

  @ManyToOne(() => CatalogEntity, (catalog) => catalog.volunteerRoles, {
    onDelete: 'SET NULL',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'catalogId', referencedColumnName: 'id' }])
  catalog: CatalogEntity;

  @ManyToOne(() => GroupEntity, (group) => group.volunteerRoles, {
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'groupId', referencedColumnName: 'id' }])
  group: Promise<GroupEntity>;
}
