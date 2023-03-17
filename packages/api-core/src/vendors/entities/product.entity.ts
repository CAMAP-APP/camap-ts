import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserOrderEntity } from '../../shop/entities/user-order.entity';
import { FileEntity } from '../../tools/models/file.entity';
import { CatalogEntity } from './catalog.entity';

@Index('Product_catalogId', ['catalogId'], {})
@Index('Product_imageId', ['imageId'], {})
@Entity('Product')
export class ProductEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column('varchar', { length: 128 })
  name: string;

  @Column('double')
  price: number;

  @Column('mediumtext', { nullable: true })
  desc: string | null;

  @Column('double')
  vat: number;

  @Column('varchar', { nullable: true, length: 32 })
  ref: string | null;

  @Column('double', { nullable: true })
  stock: number | null;

  @Column('tinyint', { width: 1 })
  active: boolean;

  @Column('double', { nullable: true })
  qt: number | null;

  @Column('double', { nullable: true })
  smallQt: number | null;

  @Column('tinyint', { nullable: true, unsigned: true })
  unitType: number | null;

  @Column('tinyint', { width: 1 })
  organic: boolean;

  @Column('tinyint', { width: 1 })
  variablePrice: boolean;

  @Column('tinyint', { width: 1 })
  multiWeight: boolean;

  @Column('tinyint', { width: 1 })
  bulk: boolean;

  @Column('tinyint', { width: 1 })
  wholesale: boolean;

  @Column('tinyint', { width: 1 })
  retail: boolean;

  /**
   * =========
   * RELATIONS
   * =========
   */
  /**
   * CatalogEntity id
   */
  @Column('int')
  catalogId: number;

  @ManyToOne(() => CatalogEntity, (catalog) => catalog.products, {
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'catalogId', referencedColumnName: 'id' }])
  catalog: Promise<CatalogEntity>;

  /** */
  @Column('int', { nullable: true })
  imageId: number | null;

  @ManyToOne(
    () => FileEntity,
    /* (file) => file.products, */ { onDelete: 'SET NULL', onUpdate: 'RESTRICT' },
  )
  @JoinColumn([{ name: 'imageId', referencedColumnName: 'id' }])
  image: Promise<FileEntity>;

  /** */
  @OneToMany(() => UserOrderEntity, (userOrder) => userOrder.product)
  userOrders: Promise<UserOrderEntity[]>;

  /**
   * get price including margins
   */
  async getPriceWithMargins(): Promise<number> {
    const catalog = await this.catalog;
    return this.price + (catalog.percentageValue / 100) * this.price;
  }
}
