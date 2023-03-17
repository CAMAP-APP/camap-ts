import { BaseEntity, Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { UserEntity } from '../../users/models/user.entity';
import { GroupEntity } from './group.entity';

@Index('UserGroup_groupId', ['groupId'], {})
@Entity('UserGroup')
export class UserGroupEntity extends BaseEntity {
  @Column('int', { primary: true })
  groupId: number;

  @Column('int', { primary: true })
  userId: number;

  @Column('simple-json', { nullable: true })
  rights: Array<{ right: string; params: string[] | null }>;

  @Column('double')
  balance: number;

  @ManyToOne(() => GroupEntity, { onDelete: 'CASCADE', onUpdate: 'RESTRICT' })
  @JoinColumn([{ name: 'groupId', referencedColumnName: 'id' }])
  group: Promise<GroupEntity>;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', onUpdate: 'RESTRICT' })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'id' }])
  user: UserEntity;
}
