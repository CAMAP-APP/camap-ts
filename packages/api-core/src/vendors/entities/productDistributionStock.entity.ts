import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProductEntity } from './product.entity';
import { DistributionEntity } from '../../shop/entities/distribution.entity';

@Index('ProductDistributionStock_productId', ['productId'], {})
@Index('ProductDistributionStock_startDistributionId', ['startDistributionId'], {})
@Index('ProductDistributionStock_endDistributionId', ['endDistributionId'], {})
@Entity('ProductDistributionStock')
export class ProductDistributionStockEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column('float', { unsigned: true, default: 0 })
  stockPerDistribution: number;

  @Column('tinyint', { unsigned: true, default: 1 })
  frequencyRatio: number;

  /**
   * =========
   * RELATIONS
   * =========
   */
  /**
   * ProductEntity id
   */
  @Column('int')
  productId: number;

  @ManyToOne(() => ProductEntity, (product) => product.distributionStocks, {
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'productId', referencedColumnName: 'id' }])
  product: Promise<ProductEntity>;

  /**
   * DistributionEntity start id
   */
  @Column('int')
  startDistributionId: number;

  @ManyToOne(() => DistributionEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'startDistributionId', referencedColumnName: 'id' }])
  startDistribution: Promise<DistributionEntity>;

  /**
   * DistributionEntity end id
   */
  @Column('int')
  endDistributionId: number;

  @ManyToOne(() => DistributionEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'endDistributionId', referencedColumnName: 'id' }])
  endDistribution: Promise<DistributionEntity>;
}
