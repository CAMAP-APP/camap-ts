import { ForbiddenException, NotFoundException, UseGuards } from '@nestjs/common';
import {
  Args,
  Int,
  Parent,
  Query,
  ResolveField,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Loader } from '../../common/decorators/dataloder.decorator';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { FilesService } from '../../files/file.service';
import { File } from '../../files/models/file.type';
import { CsaSubscriptionEntity } from '../../groups/entities/csa-subscription.entity';
import { GroupEntity } from '../../groups/entities/group.entity';
import { CsaSubscriptionsService } from '../../groups/services/csa-subscriptions.service';
import { GroupsService } from '../../groups/services/groups.service';
import { UserGroupsService } from '../../groups/services/user-groups.service';
import { Group } from '../../groups/types/group.type';
import { MultiDistribsService } from '../../shop/services/multi-distribs.service';
import { EntityFileService } from '../../tools/entityFile.service';
import { EntityFileEntity } from '../../tools/models/entity-file.entity';
import { EntityFile } from '../../tools/models/entity-file.type';
import { UserEntity } from '../../users/models/user.entity';
import { User } from '../../users/types/user.type';
import { UsersService } from '../../users/users.service';
import { ProductEntity } from '../entities/product.entity';
import { VendorsLoader } from '../loaders/vendors.loader';
import { CatalogsService } from '../services/catalogs.service';
import { ProductsService } from '../services/products.service';
import { Catalog } from '../types/catalog.type';
import { Product } from '../types/product.type';
import { Vendor } from '../types/vendor.type';
import DataLoader = require('dataloader');

@UseGuards(GqlAuthGuard)
@Resolver(() => Catalog)
export class CatalogsResolver {
  constructor(
    private readonly catalogsService: CatalogsService,
    private readonly multiDistribsService: MultiDistribsService,
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
    private readonly groupsService: GroupsService,
    private readonly subscriptionsService: CsaSubscriptionsService,
    private readonly userGroupsService: UserGroupsService,
    private readonly entityFilesService: EntityFileService,
    private readonly filesService: FilesService,
  ) {}

  @Query(() => Catalog)
  async catalog(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() currentUser: UserEntity,
  ) {
    const catalog = await this.catalogsService.findOneById(id);
    const canManageCatalog =
      !catalog ||
      (await this.userGroupsService.canManageCatalog(currentUser, catalog));
    if (!canManageCatalog) {
      throw new ForbiddenException(
        'You do not have the authorization to manage this catalog',
      );
    }
    if (!catalog) throw new NotFoundException();

    return catalog;
  }

  @Query(() => [Catalog])
  async getOrderableCatalogsFromMultiDistrib(
    @Args('multiDistribId', { type: () => Int }) multiDistribId: number,
  ) {
    const multiDistrib = await this.multiDistribsService.finder.one(multiDistribId);
    if (!multiDistrib) throw new NotFoundException();
    const distributions = await multiDistrib.distributions;

    // Check if the vendor is banned
    const allCatalogs = await Promise.all(distributions.map((d) => d.catalog));
    const vendors = await Promise.all(allCatalogs.map((c) => c.vendor));
    const distributionsIds = distributions.map((d) => d.id);

    return allCatalogs.filter((_, index) => {
      const vendor = vendors[index];
      if (vendor.disabled === null) return true;
      return false;
    });
  }

  @Query(() => [Catalog], { name: 'getActiveCatalogs' })
  async getActiveCatalogs(
    @Args({ name: 'groupId', type: () => Int }) groupId: number,
  ) {
    return this.catalogsService.getActiveCatalogsFromActiveVendorsInGroup(groupId);
  }

  @ResolveField(() => Vendor)
  async vendor(
    @Parent() parent: Catalog,
    @Loader(VendorsLoader)
    vendorsLoader: DataLoader<number, Vendor>,
  ) {
    return vendorsLoader.load(parent.vendorId);
  }

  @ResolveField(() => User, { nullable: true })
  async user(
    @Parent() parent: Catalog & { user?: Promise<UserEntity>; userId?: number },
  ) {
    if (parent.user) {
      return parent.user;
    }
    if (parent.userId) {
      return this.usersService.findOne(parent.userId);
    }
    return null;
  }

  @ResolveField(() => [Product])
  async products(
    @Parent() parent: Catalog & { products?: Promise<ProductEntity[]> },
  ) {
    if (parent.products) {
      return parent.products;
    }
    return this.productsService.findByCatalogId(parent.id);
  }

  @ResolveField(() => Group)
  group(@Parent() parent: Catalog & { group?: Promise<GroupEntity> }) {
    if (parent.group) {
      return parent.group;
    }
    return this.groupsService.findOne(parent.groupId);
  }

  @ResolveField(() => [Subscription])
  subscriptions(
    @Parent() parent: Catalog & { subscriptions?: Promise<CsaSubscriptionEntity[]> },
  ) {
    if (parent.subscriptions) {
      return parent.subscriptions;
    }
    return this.subscriptionsService.findByCatalogId(parent.id);
  }

  @ResolveField(() => Int)
  async subscriptionsCount(@Parent() parent: Catalog) {
    const subscriptions = await this.subscriptionsService.findByCatalogId(parent.id);
    return subscriptions.length;
  }

  @ResolveField(() => [EntityFile])
  async documents(
    @Parent() parent: Catalog,
    @CurrentUser() currentUser: UserEntity,
  ): Promise<EntityFile[]> {
    const entityFiles = await this.entityFilesService.getAllByEntity(
      parent.id,
      'catalog',
      'document',
    );
    if (!entityFiles || entityFiles.length === 0) {
      return [];
    }

    let filteredFiles: EntityFileEntity[];

    // If no user, return only public documents
    if (!currentUser) {
      filteredFiles = entityFiles.filter((file) => file.data === 'public');
    } else {
      // Get the group to check membership
      const group = await this.groupsService.findOne(parent.groupId);
      if (!group) {
        return [];
      }

      // Check if user is subscribed to this catalog (CSA mode)
      // This matches the logic in Catalog.hx getVisibleDocuments()
      const subscriptions = await this.subscriptionsService.findByCatalogId(
        parent.id,
      );
      const isSubscribedToCatalog = subscriptions.some(
        (sub) => sub.userId === currentUser.id || sub.userId2 === currentUser.id,
      );

      // If subscribed to catalog, return all documents
      if (isSubscribedToCatalog) {
        filteredFiles = entityFiles;
      } else {
        // Check if user is a member of the group
        const isGroupMember = await this.userGroupsService.isGroupMember(
          currentUser,
          group,
        );

        // If member of group (but not subscribed), return documents where data != 'subscribers'
        if (isGroupMember) {
          filteredFiles = entityFiles.filter((file) => file.data !== 'subscribers');
        } else {
          // Otherwise, return only public documents
          filteredFiles = entityFiles.filter((file) => file.data === 'public');
        }
      }
    }

    return filteredFiles.map((ef) => ({
      id: ef.id,
      entityType: ef.entityType,
      documentType: ef.documentType,
      entityId: ef.entityId,
      fileId: ef.fileId,
      data: ef.data,
    }));
  }
}
