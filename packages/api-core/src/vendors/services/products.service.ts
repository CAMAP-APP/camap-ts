import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, In, Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { FilesService } from '../../files/file.service';
import { CatalogEntity } from '../entities/catalog.entity';
import { ProductEntity } from '../entities/product.entity';
import { CatalogsService } from './catalogs.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productsRepo: Repository<ProductEntity>,
    @Inject(forwardRef(() => CatalogsService))
    private readonly catalogsService: CatalogsService,
    private readonly filesService: FilesService,
  ) {}

  findOneById(id: number, lock = false) {
    return this.productsRepo.findOne(id, {
      ...(lock ? { lock: { mode: 'pessimistic_write' } } : {}),
    });
  }

  findOneByRefAndCatalogId(ref: string, catalogId: number) {
    return this.productsRepo.findOne({
      ref,
      catalogId,
    });
  }

  findByIds(ids: number[]) {
    return this.productsRepo.findByIds(ids);
  }

  findByCatalogId(catalogId: number) {
    return this.productsRepo.find({ where: { catalogId } });
  }

  async findByCatalogIds(catalogIds: number[]): Promise<ProductEntity[]> {
    if (!catalogIds.length) return [];
    return this.productsRepo.find({ where: { catalogId: In(catalogIds) } });
  }

  /**
   * Get products from the active catalogs of a group
   */
  async getFromActiveCatalogsInGroup(
    groupId: number,
    activeCatalogs?: CatalogEntity[],
  ) {
    let activeCatalogsIds: number[];
    if (!activeCatalogs) {
      activeCatalogsIds = (
        await this.catalogsService.getActiveCatalogsFromActiveVendorsInGroup(groupId)
      ).map((c) => c.id);
    } else {
      activeCatalogsIds = activeCatalogs.map((c) => c.id);
    }
    if (!activeCatalogsIds.length) return [];
    return this.productsRepo.find({
      where: { catalogId: In(activeCatalogsIds) },
    });
  }

  @Transactional()
  async update(productId: number, updatedProduct: DeepPartial<ProductEntity>) {
    return this.productsRepo.update(productId, updatedProduct);
  }

  async getImage(product: ProductEntity) {
    if (!product.imageId) {
      return `/img/taxo/grey/legumes.png`;
    }
    return this.filesService.getUrl(product.imageId);
  }
}
