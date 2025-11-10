import {
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { isAfter } from 'date-fns';
import { GroupEntity } from 'src/groups/entities/group.entity';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Loader } from '../../common/decorators/dataloder.decorator';
import { IsAdmin } from '../../common/decorators/is-admin.decorator';
import { BlackListGuard } from '../../common/guards/black-list.guard';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { compressImage } from '../../common/image';
import { FilesService } from '../../files/file.service';
import { File } from '../../files/models/file.type';
import { UserGroupsService } from '../../groups/services/user-groups.service';
import { DistributionEntity } from '../../shop/entities/distribution.entity';
import { DistributionsService } from '../../shop/services/distributions.service';
import { EntityFileService } from '../../tools/entityFile.service';
import { EntityFileEntity } from '../../tools/models/entity-file.entity';
import { VendorPortraitsLoader } from '../../tools/tools.loader';
import { UserEntity } from '../../users/models/user.entity';
import { VendorDisabledReason, VendorEntity } from '../entities/vendor.entity';
import { CatalogsService } from '../services/catalogs.service';
import { VendorService } from '../services/vendor.service';
import { Catalog } from '../types/catalog.type';
import { InitVendorPage } from '../types/initVendorPage.type';
import { Vendor } from '../types/vendor.type';
import { VendorImage } from '../types/vendorImages.type';
import { VendorProfession } from '../types/vendorProfession.type';
import DataLoader = require('dataloader');

@Resolver(() => Vendor)
export class VendorsResolver {
  constructor(
    private readonly filesService: FilesService,
    private readonly catalogsService: CatalogsService,
    private readonly vendorsService: VendorService,
    private readonly entityFilesService: EntityFileService,
    private readonly distributionsService: DistributionsService,
    private readonly userGroupsService: UserGroupsService,
  ) { }

  /** QUERIES */
  @UseGuards(GqlAuthGuard)
  @Query(() => Vendor)
  async vendor(
    @Args({ name: 'id', type: () => Int }) vendorId: number,
    @CurrentUser() user: UserEntity,
    @IsAdmin() isAdmin: boolean,
  ) {
    const vendor = await this.vendorsService.findOne(vendorId);
    if (!vendor) {
      throw new NotFoundException();
    }
    // if (!isAdmin && vendor.userId && vendor.userId !== user.id) {
    //   throw new UnauthorizedException();
    // }
    return vendor;
  }

  // This query will return a vendor if the currentUser's email is the same of the one of the vendor in argument.
  @UseGuards(GqlAuthGuard)
  @Query(() => Vendor)
  async getVendorWithEmailCheck(
    @Args({ name: 'vendorId', type: () => Int }) vendorId: number,
    @CurrentUser() currentUser: UserEntity,
  ) {
    const vendor = await this.vendorsService.findOne(vendorId);
    if (!vendor) throw new NotFoundException();
    if (
      currentUser.email.toLowerCase() !== vendor.email.toLowerCase() &&
      currentUser.email2.toLowerCase() !== vendor.email.toLowerCase()
    ) {
      throw new UnauthorizedException();
    }
    return vendor;
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [Vendor])
  async getActiveVendorsFromGroup(
    @Args({ name: 'groupId', type: () => Int }) groupId: number,
  ) {
    const activeCatalogs =
      await this.catalogsService.getActiveCatalogsFromActiveVendorsInGroup(groupId);
    return this.vendorsService.getFromCatalogs(activeCatalogs.map((c) => c.id));
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [Vendor])
  async getClaimableVendors(
    @CurrentUser() currentUser: UserEntity,
  ) {
    return (await Promise.all([
      this.vendorsService.getByEmail(currentUser.email),
      this.vendorsService.getByEmail(currentUser.email2),
    ])).flat().filter(v => v.userId == null);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [Vendor])
  async getVendorsByUserId(
    @Args({ name: 'userId', type: () => Int }) userId: number,
    @CurrentUser() currentUser: UserEntity,
  ) {
    // Only allow users to query their own vendors
    if (currentUser.id !== userId) {
      throw new UnauthorizedException();
    }
    return this.vendorsService.find({ where: { userId } });
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => Vendor)
  async getDefaultVendorByUserId(
    @Args({ name: 'userId', type: () => Int }) userId: number,
    @CurrentUser() currentUser: UserEntity,
  ) {
    // Only allow users to query their own vendors
    if (currentUser.id !== userId) {
      throw new UnauthorizedException();
    }
    return (await this.vendorsService.find({ where: { userId }, take: 1 })).shift();
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => Boolean)
  async hasVendorsByUserId(
    @Args({ name: 'userId', type: () => Int }) userId: number,
    @CurrentUser() currentUser: UserEntity,
  ) {
    // Only allow users to query their own vendors
    if (currentUser.id !== userId) {
      throw new UnauthorizedException();
    }
    const count = await this.vendorsService.find({ where: { userId }, take: 1 });
    return count.length > 0;
  }

  @UseGuards(BlackListGuard)
  @Query(() => InitVendorPage)
  async initVendorPage(
    @Args({ name: 'vendorId', type: () => Int }) vendorId: number,
  ) {
    const vendor = await this.vendorsService.findOne(vendorId);
    if (!vendor) throw new NotFoundException();

    let catalogs = await this.catalogsService.findByVendor(vendorId, true);
    // Filter ended catalogs
    const distribs = await this.distributionsService.findNextDistributionsOfCatalogs(
      catalogs.map((c) => c.id)
    );

    const nextDistributionsByGroupId = new Map<number, {
      distributions: DistributionEntity[]
      group: GroupEntity
    }>();
    await Promise.all(distribs.map(async (distribution) => {
      const catalog = await distribution.catalog;
      const group = await catalog.group;

      // console.log(distribution, catalog, group);

      const dists = nextDistributionsByGroupId.get(group.id);
      if (!dists) {
        nextDistributionsByGroupId.set(group.id, { distributions: [distribution], group });
      } else {
        dists.distributions.push(distribution);
      }
    }));


    const nextDistributions = Array.from(nextDistributionsByGroupId.entries())
    .map(([, { distributions, group }]) => ({
      group,
      distributions: distributions
        .slice(0,4)
        .sort((d1, d2) => d1.date.getTime() - d2.date.getTime())
    }));

    return {
      vendor,
      nextDistributions
    };
  }

  @Query(() => [Vendor])
  async getVendorsFromCompanyNumber(
    @Args({ name: 'companyNumber' }) companyNumber: string,
  ) {
    return this.vendorsService.getFromCompanyNumber(companyNumber);
  }

  @Query(() => [VendorProfession])
  async getVendorProfessions() {
    return this.vendorsService.getVendorProfessions();
  }

  /**
   * MUTATIONS
   */
  @UseGuards(GqlAuthGuard)
  @Transactional()
  @Mutation(() => Int)
  async claimVendor(
    @Args({ name: 'vendorId', type: () => Int }) vendorId: number,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return this.vendorsService.claim(currentUser.id, vendorId);
  }

  @UseGuards(GqlAuthGuard)
  @Transactional()
  @Mutation(() => Boolean)
  async consolidateVendors(
    @Args({ name: 'vendorId', type: () => Int }) vendorId: number,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return this.vendorsService.consolidateVendors(vendorId, currentUser.id);
  }

  @UseGuards(GqlAuthGuard)
  @Transactional()
  @Mutation(() => Vendor)
  async updateVendor(
    @CurrentUser() currentUser: UserEntity,
    @Args({ name: 'vendorId', type: () => Int })
    vendorId: number,
    @Args({ name: 'name', type: () => String })
    name: string,
    @Args({ name: 'email', type: () => String })
    email: string,
    @Args({ name: 'city', type: () => String })
    city: string,
    @Args({ name: 'zipCode', type: () => String })
    zipCode: string,
    @Args({ name: 'address1', type: () => String, nullable: true })
    address1?: string,
    @Args({ name: 'address2', type: () => String, nullable: true })
    address2?: string,
    @Args({ name: 'phone', type: () => String, nullable: true })
    phone?: string,
    @Args({ name: 'linkText', type: () => String, nullable: true })
    linkText?: string,
    @Args({ name: 'desc', type: () => String, nullable: true })
    desc?: string,
    @Args({ name: 'linkUrl', type: () => String, nullable: true })
    linkUrl?: string,
    @Args({ name: 'country', type: () => String, nullable: true })
    country?: string,
    @Args({ name: 'longDesc', type: () => String, nullable: true })
    longDesc?: string,
    @Args({ name: 'profession', type: () => Int, nullable: true })
    profession?: number,
    @Args({ name: 'production2', type: () => Int, nullable: true })
    production2?: number,
    @Args({ name: 'production3', type: () => Int, nullable: true })
    production3?: number,
    @Args({ name: 'peopleName', type: () => String, nullable: true })
    peopleName?: string,
  ) {
    const vendor = await this.vendorsService.findOne(vendorId, true);
    if (!vendor) throw new NotFoundException();

    // Check if user can manage this vendor (either owns it or can manage its catalogs)
    if (vendor.userId !== currentUser.id && !(await this.userIsAllowedToManageCatalogOfVendor(currentUser, vendor))) {
      throw new ForbiddenException(`Current user cannot update vendor ${vendorId}.`);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Validate description length
    if (desc && desc.length > 1000) {
      throw new Error('Description must be less than 1000 characters');
    }

    // Format link URL
    let formattedLinkUrl = linkUrl;
    if (linkUrl && !linkUrl.startsWith('http://') && !linkUrl.startsWith('https://')) {
      formattedLinkUrl = 'http://' + linkUrl;
    }

    return this.vendorsService.update({
      id: vendor.id,
      name,
      email,
      city,
      address1,
      address2,
      zipCode,
      phone,
      linkText,
      desc,
      linkUrl: formattedLinkUrl,
      country,
      longDesc,
      profession,
      production2,
      production3,
      peopleName,
    });
  }

  @UseGuards(GqlAuthGuard)
  @Transactional()
  @Mutation(() => Vendor)
  async setVendorImage(
    @Args({ name: 'vendorId', type: () => Int })
    vendorId: number,
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
    const vendor = await this.vendorsService.findOne(vendorId, true);
    if (!vendor) throw new NotFoundException();

    if (!(await this.userIsAllowedToManageCatalogOfVendor(currentUser, vendor))) {
      throw new ForbiddenException(`Current user cannot update vendor ${vendorId}.`);
    }

    const imageData = base64EncodedImage.substring(
      `data:${mimeType};base64,`.length,
    );
    const compressedImage = await compressImage(
      Buffer.from(imageData, 'base64'),
      mimeType,
      maxWidth,
    );

    const newImage = await this.filesService.createFromBytes(
      compressedImage,
      fileName,
    );

    if (vendor.imageId) {
      await this.filesService.delete(vendor.imageId);
    }

    return this.vendorsService.update({
      id: vendor.id,
      imageId: newImage.id,
    });
  }

  @UseGuards(GqlAuthGuard)
  @Transactional()
  @Mutation(() => VendorImage)
  async createVendorImage(
    @Args({ name: 'vendorId', type: () => Int })
    vendorId: number,
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
    const vendor = await this.vendorsService.findOne(vendorId, true);
    if (!vendor) throw new NotFoundException();

    if (!(await this.userIsAllowedToManageCatalogOfVendor(currentUser, vendor))) {
      throw new ForbiddenException(`Current user cannot update vendor ${vendorId}.`);
    }

    const imageData = base64EncodedImage.substring(
      `data:${mimeType};base64,`.length,
    );
    const compressedImage = await compressImage(
      Buffer.from(imageData, 'base64'),
      mimeType,
      maxWidth,
    );

    const newImage = await this.filesService.createFromBytes(
      compressedImage,
      fileName,
    );

    const ef = await this.entityFilesService.updateOrCreate({
      entityType: 'vendor',
      entityId: vendorId,
      documentType: "media",
      data: "public",
      file: newImage
    });

    return {
      id: ef.id,
      name: newImage.name,
      url: this.filesService.getUrl(newImage.id)
    };
  }

  /**
   * RESOLVE FIELDS
   */
  @ResolveField(() => String, { nullable: true })
  image(@Parent() parent: Vendor): string {
    if (!parent.imageId) return null;
    return this.filesService.getUrl(parent.imageId);
  }

  @ResolveField(() => File, { nullable: true })
  async imageFile(@Parent() parent: Vendor): Promise<File | null> {
    if (!parent.imageId) return null;
    return this.filesService.findOneAndConvertToFile(parent.imageId);
  }

  @ResolveField(() => String)
  async portrait(
    @Parent() parent: Vendor,
    @Loader(VendorPortraitsLoader)
    vendorPortraitsLoader: DataLoader<
      Vendor,
      Pick<EntityFileEntity, 'fileId' | 'entityId'>
    >,
  ): Promise<string> {
    const portrait = await vendorPortraitsLoader.load(parent);
    if (!portrait) return '';
    return this.filesService.getUrl(portrait.fileId);
  }

  @ResolveField(() => [VendorImage])
  async media(@Parent() parent: Vendor): Promise<VendorImage[]> {
    return (await this.entityFilesService.findVendorImages(parent.id))
      .map(ef => ({
        id: ef.id,
        name: ef.file.name,
        url: this.filesService.getUrl(ef.file.id)
      }));
  }

  @ResolveField(() => Int, { nullable: true })
  async profession(@Parent() parent: VendorEntity): Promise<number | null> {
    return parent.profession
  }

  @ResolveField(() => VendorDisabledReason)
  disabled(@Parent() parent: VendorEntity) {
    return parent.raw_disabled;
  }

  @ResolveField(() => [Catalog])
  async activeCatalogs(@Parent() parent: VendorEntity) {
    return this.catalogsService.findByVendor(parent.id, true);
  }

  @ResolveField(() => [Catalog])
  async allCatalogs(@Parent() parent: VendorEntity) {
    return this.catalogsService.findByVendor(parent.id, false);
  }

  @ResolveField(() => [EntityFileEntity])
  async documents(@Parent() parent: VendorEntity): Promise<EntityFileEntity[]> {
    const entityFiles = await this.entityFilesService.getAllByEntity(
      parent.id,
      'vendor',
      'document'
    );
    if (!entityFiles || entityFiles.length === 0) {
      return [];
    }
    return entityFiles;
  }

  /**
   * HELPERS
   */
  private async userIsAllowedToManageCatalogOfVendor(
    currentUser: UserEntity,
    vendor: VendorEntity,
  ) {
    if(vendor.userId !== null)
      return vendor.userId === currentUser.id;

    if(currentUser.rights === 1) return true;

    // Check if the user can manage one of the vendor's catalogs
    const catalogs = await this.catalogsService.findByVendor(vendor.id);
    const hasRights = await Promise.all(
      catalogs.map((c) => this.userGroupsService.canManageCatalog(currentUser, c)),
    );

    if (!hasRights.includes(true)) return false;

    return true;
  }
}
