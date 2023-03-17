import { Column, Entity } from 'typeorm';

@Entity('Cache')
export class CacheEntity {
  @Column('varchar', { primary: true, name: 'name', length: 128 })
  name: string;

  @Column('mediumtext', { name: 'value' })
  value: string;

  @Column('datetime', { name: 'expire' })
  expire: Date;

  @Column('datetime', { name: 'cdate', nullable: true })
  cdate: Date | null;
}
