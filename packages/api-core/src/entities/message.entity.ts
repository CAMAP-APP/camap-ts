import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { mediumtextToJSONArray } from '../common/utils';
import { GroupEntity } from '../groups/entities/group.entity';
import { UserEntity } from '../users/models/user.entity';

@Index('Message_amapId', ['amapId'], {})
@Index('Message_senderId', ['senderId'], {})
@Entity('Message')
export class MessageEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column('varchar', { nullable: true, length: 12 })
  recipientListId: string | null;

  @Column('varchar', { length: 128 })
  title: string;

  @Column('mediumtext')
  body: string;

  @Column('datetime')
  date: Date;

  @Column('mediumtext', { nullable: true })
  recipients: string | null;

  @Column('mediumtext', { name: 'slateContent' })
  slateContent: string;

  /**
   * =========
   * RELATIONS
   * =========
   */
  @Column('int', { nullable: true })
  amapId: number | null;

  @ManyToOne(() => GroupEntity, (group) => group.messages, {
    onDelete: 'SET NULL',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'amapId', referencedColumnName: 'id' }])
  amap: GroupEntity;

  /** */
  @Column('int', { nullable: true })
  senderId: number | null;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', onUpdate: 'RESTRICT' })
  @JoinColumn([{ name: 'senderId', referencedColumnName: 'id' }])
  sender: UserEntity;

  /** */
  @Column('mediumtext', { name: 'attachments', nullable: true })
  raw_attachments: string | null;

  get attachments(): ({ cid: string; content: string } | string)[] | null {
    if (this.raw_attachments === null || this.raw_attachments.trim() === '')
      return null;

    try {
      return mediumtextToJSONArray(this.raw_attachments);
    } catch (error) {
      throw new Error("can't parse Message:attachments : " + error);
    }
  }

  set attachments(value: ({ cid: string; content: string } | string)[] | null) {
    if (!value) {
      this.raw_attachments = null;
    } else {
      this.raw_attachments = JSON.stringify(value);
    }
  }
}
