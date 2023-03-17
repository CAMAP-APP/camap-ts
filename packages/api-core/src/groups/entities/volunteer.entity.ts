import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { MultiDistribEntity } from '../../shop/entities/multi-distrib.entity';
import { UserEntity } from '../../users/models/user.entity';
import { VolunteerRoleEntity } from './volunteer-role.entity';

@Index('Volunteer_volunteerRoleId', ['volunteerRoleId'], {})
@Index('Volunteer_multiDistribId', ['multiDistribId'], {})
@Entity('Volunteer')
export class VolunteerEntity {
  @Column('int', { primary: true, name: 'userId' })
  userId: number;

  @Column('int', { primary: true, name: 'multiDistribId' })
  multiDistribId: number;

  @Column('int', { primary: true, name: 'volunteerRoleId' })
  volunteerRoleId: number;

  @ManyToOne(() => MultiDistribEntity, (multiDistrib) => multiDistrib.volunteers, {
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'multiDistribId', referencedColumnName: 'id' }])
  multiDistrib: Promise<MultiDistribEntity>;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', onUpdate: 'RESTRICT' })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'id' }])
  user: Promise<UserEntity>;

  @ManyToOne(
    () => VolunteerRoleEntity,
    (volunteerRole) => volunteerRole.volunteers,
    {
      onDelete: 'CASCADE',
      onUpdate: 'RESTRICT',
    },
  )
  @JoinColumn([{ name: 'volunteerRoleId', referencedColumnName: 'id' }])
  volunteerRole: Promise<VolunteerRoleEntity>;
}
