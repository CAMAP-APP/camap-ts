import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { addYears } from 'date-fns';
import { DeepPartial, LessThan, MoreThan, Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { hasFlag, setFlag } from '../../common/haxeCompat';
import { CsaSubscriptionEntity } from '../../groups/entities/csa-subscription.entity';
import { CsaSubscriptionsService } from '../../groups/services/csa-subscriptions.service';
import { DistributionEntity } from '../../shop/entities/distribution.entity';
import { CatalogEntity } from '../entities/catalog.entity';
import { VendorEntity } from '../entities/vendor.entity';

enum CatalogFlags {
  UsersCanOrder = 0, // Adhérents peuvent saisir eux meme la commande en ligne
  StockManagement = 1, // Gestion des commandes
  PercentageOnOrders = 2, // Calcul d'une commission supplémentaire
}

@Injectable()
export class CatalogsService {
  constructor(
    @InjectRepository(CatalogEntity)
    private readonly catalogsRepo: Repository<CatalogEntity>,
    @Inject(forwardRef(() => CsaSubscriptionsService))
    private readonly subscriptionsService: CsaSubscriptionsService,
  ) {}

  findOneById(id: number) {
    return this.catalogsRepo.findOne(id);
  }

  async findByIds(ids: number[]) {
    return this.catalogsRepo.findByIds(ids);
  }

  async findByContact(userId: number) {
    return this.catalogsRepo.find({ userId });
  }

  async findByVendor(vendorId: number) {
    return this.catalogsRepo.find({ vendorId });
  }

  async findActiveByForVendorInGroup(
    vendorId: number,
    groupId: number,
  ): Promise<CatalogEntity | null> {
    const now = new Date();
    return this.catalogsRepo.findOne({
      where: {
        vendorId,
        groupId,
        endDate: MoreThan(now),
        startDate: LessThan(now),
      },
    });
  }

  async getActiveCatalogsInGroup(groupId: number) {
    return this.catalogsRepo
      .createQueryBuilder('c')
      .select('c.*')
      .where(
        `c.groupId = ${groupId}
        AND c.endDate > NOW()
        AND c.startDate < NOW()`,
      )
      .getRawMany();
  }

  async getActiveCatalogsFromActiveVendorsInGroup(groupId: number) {
    return this.catalogsRepo
      .createQueryBuilder('c')
      .select('c.*')
      .addFrom(VendorEntity, 'v')
      .where(
        `c.groupId = ${groupId}
        AND c.vendorId = v.id
        AND c.endDate > NOW()
        AND c.startDate < NOW()
        AND v.disabled IS null`, //
      )
      .orderBy('c.vendorId')
      .getRawMany();
  }

  async findCatalogIdsOfNonDisabledVendorInMultiDistrib(
    multiDistribId: number,
  ): Promise<{ id: CatalogEntity['id'] }[]> {
    return this.catalogsRepo
      .createQueryBuilder('c')
      .select('c.id, c.name')
      .addFrom(DistributionEntity, 'd')
      .addFrom(VendorEntity, 'v')
      .where(
        `c.id = d.catalogId
        AND c.vendorId = v.id
        AND d.multiDistribId = ${multiDistribId}
        AND v.disabled is null`,
      )
      .getRawMany<{ id: CatalogEntity['id'] }>();
  }

  /**
   * The products can be displayed in a shop ?
   */
  isVisibleInShop(catalog: CatalogEntity): boolean {
    // Yes if the contract is active and the 'UsersCanOrder' flag is checked
    const now = new Date().getTime();
    let { endDate } = catalog;
    let { startDate } = catalog;

    if (!startDate.getTime) startDate = new Date(0);
    if (!endDate.getTime) endDate = new Date(0);

    return (
      hasFlag(CatalogFlags.UsersCanOrder, catalog.flags) &&
      now < endDate.getTime() &&
      now > startDate.getTime()
    );
  }

  hasPercentageOnOrders(
    catalog: Pick<CatalogEntity, 'flags' | 'percentageValue'>,
  ): boolean {
    return (
      hasFlag(CatalogFlags.PercentageOnOrders, catalog.flags) &&
      !!catalog.percentageValue
    );
  }

  hasStockManagement(catalog: Pick<CatalogEntity, 'flags'>): boolean {
    return hasFlag(CatalogFlags.StockManagement, catalog.flags);
  }

  enableStockManagement(catalog: Pick<CatalogEntity, 'id' | 'flags'>) {
    return this.catalogsRepo.update(catalog.id, {
      flags: setFlag(CatalogFlags.StockManagement, catalog.flags),
    });
  }

  /**
   * Computes a 'percentage' fee or a 'margin' fee
   * depending on the group settings
   */
  async computeFees(catalog: CatalogEntity, basePrice: number) {
    if (!this.hasPercentageOnOrders(catalog)) return 0.0;

    /* const group = await this.groupsService.findOne(catalog.groupId);
    if (this.groupsService.hasComputeMargin(group)) {
      // Commercial margin
      return basePrice / ((100 - catalog.percentageValue) / 100) - basePrice;
    } else { */
    // Add a percentage
    return (catalog.percentageValue / 100) * basePrice;
    // }
  }

  /**
   * Returns active subscriptions with users that are still members of the group
   * */
  async getActiveSubscriptions(
    groupId?: number,
    activeContracts?: CatalogEntity[],
  ): Promise<CsaSubscriptionEntity[]> {
    let activeContractsId: number[];
    if (!activeContracts) {
      activeContractsId = (
        await this.getActiveCatalogsFromActiveVendorsInGroup(groupId)
      ).map((c) => c.id);
    } else {
      activeContractsId = activeContracts.map((c) => c.id);
    }

    return this.subscriptionsService.getActives(groupId, activeContractsId);
  }

  @Transactional()
  async update(ids: number[], partialCatalog: DeepPartial<CatalogEntity>) {
    return this.catalogsRepo.update(ids, partialCatalog);
  }

  @Transactional()
  async create(
    partialCatalog: Pick<CatalogEntity, 'name' | 'type' | 'groupId' | 'vendorId'> &
      DeepPartial<CatalogEntity>,
  ) {
    const now = new Date();
    const catalog = await this.catalogsRepo.save({
      flags: 0,
      distributorNum: 0,
      orderEndHoursBeforeDistrib: 24,
      startDate: now,
      endDate: addYears(now, 1),
      ...partialCatalog,
    });

    setFlag(catalog.flags, CatalogFlags.UsersCanOrder);

    return catalog;
  }
}
