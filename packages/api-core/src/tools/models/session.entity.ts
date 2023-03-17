import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { UserEntity } from '../../users/models/user.entity';

@Index('Session_uid', ['uid'], {})
@Index('Session_lastTime', ['lastTime'], {})
@Index('Session_ip', ['ip'], {})
@Entity('Session')
export class SessionEntity {
  @Column('varchar', { primary: true, name: 'sid', length: 32 })
  sid: string;

  @Column('int', { name: 'uid', nullable: true })
  uid: number | null;

  @ManyToOne(
    () => UserEntity,
    // user => user.sessions,
    { onDelete: 'SET NULL', onUpdate: 'RESTRICT' },
  )
  @JoinColumn([{ name: 'uid', referencedColumnName: 'id' }])
  user: Promise<UserEntity>;

  @Column('datetime', { name: 'lastTime' })
  lastTime: Date;

  @Column('datetime', { name: 'createTime' })
  createTime: Date;

  @Column('mediumblob', { name: 'sdata' })
  sdata: Buffer;

  @Column('varchar', { name: 'lang', length: 2 })
  lang: string;

  @Column('mediumblob', { name: 'messages' })
  messages: Buffer;

  @Column('varchar', { name: 'ip', length: 15 })
  ip: string;
}
