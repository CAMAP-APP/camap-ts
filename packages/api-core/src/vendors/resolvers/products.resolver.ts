import { ForbiddenException, NotFoundException, UseGuards } from '@nestjs/common';
import {
  Args,
  Float,
  Int,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Loader } from '../../common/decorators/dataloder.decorator';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { compressImage } from '../../common/image';
import { FilesService } from '../../files/file.service';
import { UserGroupsService } from '../../groups/services/user-groups.service';
import { UserEntity } from '../../users/models/user.entity';
import { CatalogEntity } from '../entities/catalog.entity';
import { ProductEntity } from '../entities/product.entity';
import { VendorEntity } from '../entities/vendor.entity';
import { CatalogsLoader } from '../loaders/catalogs.loader';
import { VendorsLoader } from '../loaders/vendors.loader';
import { CatalogsService } from '../services/catalogs.service';
import { ProductsService } from '../services/products.service';
import { Product } from '../types/product.type';
import DataLoader = require('dataloader');

@UseGuards(GqlAuthGuard)
@Resolver(() => Product)
export class ProductsResolver {
  constructor(
    private readonly productsService: ProductsService,
    private readonly filesService: FilesService,
    private readonly catalogsService: CatalogsService,
    private readonly userGroupsService: UserGroupsService,
    private readonly catalogService: CatalogsService,
  ) {}

  /**
   * MUTATIONS
   */
  @Transactional()
  @Mutation(() => Product)
  async setProductImage(
    @Args({ name: 'productId', type: () => Int })
    productId: number,
    @Args({ name: 'base64EncodedImage' })
    base64EncodedImage: string,
    @Args({ name: 'mimeType' })
    mimeType: string,
    @Args({ name: 'fileName' })
    fileName: string,
    @Args({ name: 'maxWidth', type: () => Int })
    maxWidth: number,
    @CurrentUser() currentUser: UserEntity,
  ) {
    const product = await this.productsService.findOneById(productId, true);
    if (!product) throw new NotFoundException();

    await this.userIsAllowedToManageCatalog(
      currentUser,
      product.catalogId,
      productId,
    );

    const imageData = base64EncodedImage.substr(`data:${mimeType};base64,`.length);
    const compressedImage = await compressImage(
      Buffer.from(imageData, 'base64'),
      mimeType,
      maxWidth,
    );

    const newImage = await this.filesService.createFromBytes(
      compressedImage,
      fileName,
    );

    if (product.imageId) {
      await this.filesService.delete(product.imageId);
    }

    await this.productsService.update(product.id, {
      imageId: newImage.id,
    });
      
    return { ...product, imageId: newImage.id };
  }

  /**
   * RESOLVE FIELDS
   */

  /**
   * Returns product image URL
   */
  @ResolveField(() => String)
  async image(@Parent() parent: ProductEntity): Promise<string> {
    return this.productsService.getImage(parent);
  }

  /**
   * Get price including margins
   */
  @ResolveField(() => Float)
  async price(
    @Parent() parent: ProductEntity,
    @Loader(CatalogsLoader)
    catalogsLoader: DataLoader<CatalogEntity['id'], CatalogEntity>,
  ): Promise<number> {
    const catalog = await catalogsLoader.load(parent.catalogId);
    const catalogFees = await this.catalogsService.computeFees(
      catalog,
      parent.price,
    );
    return parent.price + catalogFees;
  }

  @ResolveField(() => Int)
  async vendorId(
    @Parent() parent: Product,
    @Loader(CatalogsLoader)
    catalogsLoader: DataLoader<CatalogEntity['id'], CatalogEntity>,
  ): Promise<number> {
    const catalog = await catalogsLoader.load(parent.catalogId);
    return catalog.vendorId;
  }

  @ResolveField(() => String)
  async vendorName(
    @Parent() parent: Product,
    @Loader(CatalogsLoader)
    catalogsLoader: DataLoader<CatalogEntity['id'], CatalogEntity>,
    @Loader(VendorsLoader)
    vendorsLoader: DataLoader<VendorEntity['id'], VendorEntity>,
  ): Promise<string> {
    const catalog = await catalogsLoader.load(parent.catalogId);
    const vendor = await vendorsLoader.load(catalog.vendorId);
    return vendor.name;
  }

  @ResolveField(() => String)
  async stock(
    @Parent() parent: Product,
    @Loader(CatalogsLoader)
    catalogsLoader: DataLoader<CatalogEntity['id'], CatalogEntity>,
  ): Promise<number | null> {
    const catalog = await catalogsLoader.load(parent.catalogId);
    return this.catalogsService.hasStockManagement(catalog) ? parent.stock : null;
  }

  @ResolveField(() => String)
  async catalogName(
    @Parent() parent: ProductEntity,
    @Loader(CatalogsLoader)
    catalogsLoader: DataLoader<CatalogEntity['id'], CatalogEntity>,
  ): Promise<string> {
    const catalog = await catalogsLoader.load(parent.catalogId);
    return catalog.name;
  }

  /**
   * Default values
   */

  @ResolveField(() => Float)
  async qt(@Parent() parent: ProductEntity): Promise<number | null> {
    if (parent.qt) return parent.qt;
    return 1;
  }

  @ResolveField(() => Float)
  async unitType(@Parent() parent: ProductEntity): Promise<number | null> {
    if (parent.unitType) return parent.unitType;
    return 0;
  }

  /**
   * HELPERS
   */
  private async userIsAllowedToManageCatalog(
    currentUser: UserEntity,
    catalogId: number,
    productId: number,
  ) {
    const catalog = await this.catalogService.findOneById(catalogId);
    if (!catalog)
      throw new NotFoundException(
        `Catalog ${catalogId} does not exist for product ${productId}`,
      );
    const hasRight = await this.userGroupsService.canManageCatalog(
      currentUser,
      catalog,
    );
    if (!hasRight)
      throw new ForbiddenException(
        `Current user cannot access catalog ${catalogId}.`,
      );
  }
}
