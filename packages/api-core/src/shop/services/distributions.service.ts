import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { endOfDay, startOfDay } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { Between, In, MoreThanOrEqual, Repository } from 'typeorm';
import { TZ_PARIS } from '../../common/constants';
import { CacheService } from '../../tools/cache.service';
import { CatalogType } from '../../vendors/catalog.interface';
import { CatalogsService } from '../../vendors/services/catalogs.service';
import { DistributionEntity } from '../entities/distribution.entity';
import { MultiDistribsService } from './multi-distribs.service';

@Injectable()
export class DistributionsService {
  constructor(
    @InjectRepository(DistributionEntity)
    private readonly distributionRepo: Repository<DistributionEntity>,
    @Inject(forwardRef(() => MultiDistribsService))
    private readonly multiDistribsService: MultiDistribsService,
    private readonly cacheService: CacheService,
    @Inject(forwardRef(() => CatalogsService))
    private readonly catalogsService: CatalogsService,
  ) {}

  async findOneDistribution(id: number, lock = false) {
    return this.distributionRepo.findOne(id, {
      ...(lock ? { lock: { mode: 'pessimistic_write' } } : {}),
    });
  }

  async findAllDistributionsOfMultiDistrib(multiDistribId: number) {
    return this.distributionRepo.find({ multiDistribId });
  }

  async findAllDistributionsByMultiDistribs(multiDistribIds: number[]) {
    return this.distributionRepo.find({ multiDistribId: In(multiDistribIds) });
  }

  findByCatalogIdsAndEndDate(catalogIds: number[], date: Date) {
    return this.distributionRepo.find({
      catalogId: In(catalogIds),
      raw_end: Between(startOfDay(date), endOfDay(date)),
    });
  }

  findByEndDate(date: Date) {
    return this.distributionRepo.find({
      raw_end: Between(startOfDay(date), endOfDay(date)),
    });
  }

  async findNextDistributionsOfCatalogs(catalogIds: number[]) {
    const now = utcToZonedTime(new Date(), TZ_PARIS);

    return this.distributionRepo.find({
      where: {
        catalogId: In(catalogIds),
        raw_date: MoreThanOrEqual(now),
      },
    });
  }

  searchDistribs({
    catalogId,
    dateRange,
  }: {
    catalogId?: number;
    dateRange?: { from: Date; to: Date };
  }) {
    return this.distributionRepo.find({
      where: {
        catalogId,
        ...(dateRange
          ? {
              raw_date: Between(dateRange.from, dateRange.to),
            }
          : {}),
      },
    });
  }

  async getNextDistributionsId(groupId: number): Promise<number[]> {
    const now = new Date();

    const multiDistributions =
      await this.multiDistribsService.finder.byGroupAndAfterDate(groupId, now);

    if (!multiDistributions.length) return [];

    const nextMultiDistrib = multiDistributions[0];
    const nextDistributions = await this.distributionRepo.find({
      multiDistribId: nextMultiDistrib.id,
    });

    return nextDistributions.map((d) => d.id);
  }

  /**
    Get distributions for constant orders or variable orders.
  * */
  async getDistributions(
    multiDistribId: number,
    type?: CatalogType,
  ): Promise<DistributionEntity[]> {
    const distributions = await this.findAllDistributionsOfMultiDistrib(
      multiDistribId,
    );
    if (!type) {
      return distributions;
    }
    const out = [];
    const catalogs = await Promise.all(distributions.map((d) => d.catalog));
    catalogs.forEach((c, index) => {
      if (c.type === type) out.push(distributions[index]);
    });
    return out;
  }

  async findPlaceIdWhereMostDistributionsTakePlace(
    placesIds: number[],
  ): Promise<number | null> {
    const result = await this.distributionRepo
      .createQueryBuilder('d')
      .select('d.placeId, count(d.placeId) as top')
      .where(`d.placeId IN (${placesIds.length > 0 ? placesIds : null})`)
      .groupBy('d.placeId')
      .orderBy('top', 'DESC')
      .getRawMany<{ placeId: number; top: number }>();
    return result.length ? result.shift().placeId : null;
  }
}
