import { Column, Entity } from 'typeorm';

@Entity('Variable')
export class VariableEntity {
  @Column('varchar', { primary: true, length: 64 })
  name: string;

  @Column('mediumtext')
  value: string;
}
