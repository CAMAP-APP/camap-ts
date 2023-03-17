import { ForbiddenException, NotFoundException, UseGuards } from '@nestjs/common';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { formatSmartQt } from 'camap-common';
import { Loader } from '../../common/decorators/dataloder.decorator';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { UserGroupsService } from '../../groups/services/user-groups.service';
import { UserEntity } from '../../users/models/user.entity';
import { CatalogEntity } from '../../vendors/entities/catalog.entity';
import { ProductEntity } from '../../vendors/entities/product.entity';
import { ProductsLoader } from '../../vendors/loaders/products.loader';
import { CatalogsService } from '../../vendors/services/catalogs.service';
import { Product } from '../../vendors/types/product.type';
import { MultiDistribValidatedStatus } from '../entities/multi-distrib.entity';
import { MultiDistribsService } from '../services/multi-distribs.service';
import { UserOrder } from '../types/user-order.type';
import DataLoader = require('dataloader');

@UseGuards(GqlAuthGuard)
@Resolver(() => UserOrder)
export class OrdersResolver {
  constructor(
    private readonly userGroupsService: UserGroupsService,
    private readonly catalogsService: CatalogsService,
    private readonly multiDistribsService: MultiDistribsService,
  ) {}

  /**
   * FIELDS
   */
  @ResolveField(() => Product)
  async product(
    @Parent()
    parent: UserOrder,
    @Loader(ProductsLoader)
    productsLoader: DataLoader<ProductEntity['id'], Product>,
  ) {
    return productsLoader.load(parent.productId);
  }

  @ResolveField(() => String)
  async smartQt(
    @Parent()
    userOrder: UserOrder,
    @Loader(ProductsLoader)
    productsLoader: DataLoader<ProductEntity['id'], Product>,
  ) {
    let product = await this.product(userOrder, productsLoader);

    return formatSmartQt(product, userOrder);
  }

  /**
   * HELPERS
   */
  private async checkRights(
    currentUser: UserEntity,
    multiDistribId: number,
    catalogId?: number,
  ): Promise<CatalogEntity | undefined> {
    let catalog: CatalogEntity;
    if (!!catalogId) {
      catalog = await this.catalogsService.findOneById(catalogId);
      if (!catalog)
        throw new NotFoundException(`Catalog ${catalogId} does not exist`);

      const canManageCatalog = await this.userGroupsService.canManageCatalog(
        currentUser,
        catalog,
      );
      if (!canManageCatalog) {
        throw new ForbiddenException(
          'You do not have the authorization to manage this catalog',
        );
      }
    }
    const multiDistrib = await this.multiDistribsService.finder.one(multiDistribId);
    if (!multiDistrib)
      throw new NotFoundException(`MultiDistrib ${multiDistribId} does not exist`);
    if (
      !catalogId &&
      !this.userGroupsService.canManageAllCatalogs(currentUser, multiDistrib.groupId)
    ) {
      throw new ForbiddenException('Forbidden access');
    }
    if (multiDistrib.validatedStatus !== MultiDistribValidatedStatus.NOT_VALIDATED) {
      throw new ForbiddenException('This delivery has already been validated');
    }

    return catalog;
  }
}
