import { Column, Entity } from 'typeorm';

@Entity('Permalink')
export class PermalinkEntity {
  @Column('varchar', { primary: true, name: 'link', length: 128 })
  link: string;

  @Column('varchar', { name: 'entityType', length: 64 })
  entityType: string;

  @Column('int', { name: 'entityId' })
  entityId: number;
}
