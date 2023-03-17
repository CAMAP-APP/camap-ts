import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('BufferedJsonMail_sdate_cdate', ['sdate', 'cdate'], {})
@Entity('BufferedJsonMail')
export class BufferedJsonMailEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column('varchar', { length: 256 })
  title: string;

  @Column('mediumtext', { nullable: true })
  htmlBody: string | null;

  @Column('mediumtext', { nullable: true })
  textBody: string | null;

  @Column('varchar', { length: 32 })
  mailerType: string;

  @Column('int')
  tries: number;

  @Column('datetime')
  cdate: Date;

  @Column('datetime', { nullable: true })
  sdate: Date | null;

  @Column('mediumtext', { nullable: true })
  rawStatus: string | null;

  /**
   * ===
   * RAW
   * ===
   */
  @Column('mediumtext', { name: 'headers', nullable: true })
  raw_headers: string | null;

  get headers(): { [key: string]: string } | null {
    if (!this.raw_headers || this.raw_headers.trim() === '') return null;
    try {
      return JSON.parse(this.raw_headers);
    } catch (error) {
      throw new Error("can't parse BufferedJsonMailEntity:headers");
    }
  }

  set headers(value: { [key: string]: string } | null) {
    if (!value) {
      this.raw_headers = null;
    } else {
      this.raw_headers = JSON.stringify(value);
    }
  }

  @Column('mediumtext', { name: 'sender', nullable: true })
  raw_sender: string | null;

  get sender(): { name: string; email: string; userId?: number } | null {
    if (!this.raw_sender || this.raw_sender.trim() === '') return null;
    try {
      return JSON.parse(this.raw_sender);
    } catch (error) {
      throw new Error("can't parse BufferedJsonMailEntity:sender");
    }
  }

  set sender(value: { name: string; email: string; userId?: number } | null) {
    if (!value) {
      this.raw_sender = null;
    } else {
      this.raw_sender = JSON.stringify(value);
    }
  }

  @Column('mediumtext', { name: 'recipients', nullable: true })
  raw_recipients: string | null;

  get recipients(): Array<{ name?: string; email: string; userId?: number }> | null {
    if (!this.raw_recipients || this.raw_recipients.trim() === '') return null;
    try {
      return JSON.parse(this.raw_recipients);
    } catch (error) {
      throw new Error("can't parse BufferedJsonMailEntity:recipients");
    }
  }

  set recipients(value: Array<{ name?: string; email: string; userId?: number }> | null) {
    if (!value) {
      this.raw_recipients = null;
    } else {
      this.raw_recipients = JSON.stringify(value);
    }
  }

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
      throw new Error("can't parse BufferedJsonMailEntity:attachments");
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
