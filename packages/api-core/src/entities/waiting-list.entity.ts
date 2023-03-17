import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { GroupEntity } from '../groups/entities/group.entity';
import { UserEntity } from '../users/models/user.entity';

@Index('WaitingList_amapId', ['amapId'], {})
@Entity('WaitingList')
export class WaitingListEntity {
  @Column('int', { primary: true, name: 'amapId' })
  amapId: number;

  @Column('int', { primary: true, name: 'userId' })
  userId: number;

  @Column('datetime', { name: 'date' })
  raw_date: Date;

  get date() {
    return zonedTimeToUtc(this.raw_date, 'Europe/Paris');
  }

  set date(dateUtc: Date) {
    this.raw_date = utcToZonedTime(dateUtc, 'Europe/Paris');
  }

  @Column('mediumtext', { name: 'message' })
  message: string;

  @ManyToOne(() => GroupEntity, (group) => group.waitingLists, {
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'amapId', referencedColumnName: 'id' }])
  amap: GroupEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', onUpdate: 'RESTRICT' })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'id' }])
  user: UserEntity;
}
