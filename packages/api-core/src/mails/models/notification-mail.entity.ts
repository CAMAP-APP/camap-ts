import { GroupEntity } from 'src/groups/entities/group.entity';
import { UserEntity } from 'src/users/models/user.entity';
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

/*
 * NotificationMail groups notification in a single email
 * a notification can be stashed in the hourly or daily digest
 */

enum DigestType {
  HOURLY = 1,
  DAILY = 2,

  COORDINATOR_HOURLY = 11,
  COORDINATOR_DAILY = 12,
}

@Entity('NotificationMail')
export class NotificationMailEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @CreateDateColumn()
  cdate: Date;

  @Column('mediumtext', { nullable: true })
  htmlBody: string | null;

  @Column('mediumtext', { nullable: true })
  textBody: string | null;

  @Column('int')
  digest: DigestType;

 /** Used as unique key for notification in the same digest
  *  format
  *     SUBSCRIPTION(id)
  *     DISTRIBUTION(id)
  *     ...
  */
  @Column('varchar', { length: 256 })
  subject: string;
  
  /** */
  @Column('int', { name: 'groupId' })
  groupId: number;
  @JoinColumn([{ name: 'groupId', referencedColumnName: 'id' }])
  group: Promise<GroupEntity>;

  @Column('int', { name: 'recipientId' })
  @JoinColumn([{ name: 'recipientId', referencedColumnName: 'id' }])
  recipient: Promise<UserEntity>;

  @Column('mediumtext', { name: 'attachments', nullable: true })
  raw_attachments: string | null;

  get attachments(): Array<{
    filename: string;
    contentType: string;
    content: string;
    encoding: string;
    cid?: string;
  }> | null {
    if (!this.raw_attachments || this.raw_attachments.trim() === '') return [];

    try {
      return JSON.parse(this.raw_attachments);
    } catch (error) {
      throw new Error("can't parse NotificationMailEntity:attachments");
    }
  }

  set attachments(
    value: Array<{ filename: string; contentType: string; content: string; encoding: string; cid?: string }> | null,
  ) {
    if (!value) {
      this.raw_attachments = null;
    } else {
      this.raw_attachments = JSON.stringify(value);
    }
  }
}
