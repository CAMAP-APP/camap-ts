import {
  BaseEntity,
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { VendorEntity } from '../../vendors/entities/vendor.entity';

@Index('File_cdate', ['cdate'], {})
@Entity('File')
export class FileEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column('tinytext')
  name: string;

  @Column('mediumblob')
  data: Buffer;

  @Column('datetime')
  cdate: Date;

  /**
   * =========
   * RELATIONS
   * =========
   */
  @OneToMany(() => VendorEntity, (vendor) => vendor.image)
  vendors: Promise<VendorEntity[]>;
}
