import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { format, isBefore, startOfHour, subHours } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { fr } from 'date-fns/locale';
import { difference } from 'lodash';
import { Between, FindManyOptions, LessThan, MoreThan, Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { TZ_PARIS } from '../../common/constants';
import { GroupEntity } from '../../groups/entities/group.entity';
import { UserGroupsService } from '../../groups/services/user-groups.service';
import { MailsService } from '../../mails/mails.service';
import { OrdersService } from '../../payments/services/orders.service';
import { CatalogType } from '../../vendors/catalog.interface';
import { DistributionEntity } from '../entities/distribution.entity';
import { MultiDistribEntity } from '../entities/multi-distrib.entity';
import { DistributionsService } from './distributions.service';
import {
  DistributionsServiceError,
  DistributionsServiceFailReason,
} from './distributions.service.error';

@Injectable()
export class MultiDistribsService {
  constructor(
    @InjectRepository(MultiDistribEntity)
    private readonly multiDistribRepo: Repository<MultiDistribEntity>,
    @Inject(forwardRef(() => DistributionsService))
    private readonly distributionsService: DistributionsService,
    @Inject(forwardRef(() => UserGroupsService))
    private readonly userGroupsService: UserGroupsService,
    @Inject(forwardRef(() => OrdersService))
    private readonly ordersService: OrdersService,
    private readonly mailsService: MailsService,
  ) { }

  get finder() {
    return {
      one: (id: number, lock = false) =>
        this.multiDistribRepo.findOne(id, {
          ...(lock ? { lock: { mode: 'pessimistic_write' } } : {}),
        }),
      byGroupId: (groupId: number) =>
        this.multiDistribRepo.find({
          where: {
            groupId,
          },
        }),
      byGroupAndAfterDate: (groupId: number, date: Date) =>
        this.multiDistribRepo.find({
          where: { groupId, raw_distribStartDate: MoreThan(date) },
          order: { raw_distribStartDate: 'ASC' },
        }),
    };
  }

  async findMultiDistribsByIds(ids: number[]) {
    return this.multiDistribRepo.findByIds(ids);
  }

  async findMultiDistribsByDates(startDate: Date, endDate: Date) {
    return this.multiDistribRepo.find({
      where: {
        raw_distribStartDate: Between(
          utcToZonedTime(startDate, TZ_PARIS),
          utcToZonedTime(endDate, TZ_PARIS),
        ),
      },
    });
  }

  async getFromTimeRange(
    group: GroupEntity,
    from: Date,
    to: Date,
    getDistributions = false,
  ): Promise<MultiDistribEntity[]> {
    const start = new Date(from.setHours(0, 0, 0, 0));
    const end = new Date(to.setHours(23, 59, 59, 999));

    const findOptions: FindManyOptions = {
      where: {
        groupId: group.id,
        raw_distribStartDate: Between(start, end),
      },
      order: { raw_distribStartDate: 'ASC' },
    };

    if (getDistributions) findOptions.relations = ['distributions'];

    const multiDistribs = await this.multiDistribRepo.find(findOptions);

    return multiDistribs;
  }

  async getNextMultiDistribInGroup(groupId: number) {
    return this.multiDistribRepo.findOne({
      where: { groupId, raw_distribStartDate: MoreThan(new Date()) },
      order: { raw_distribStartDate: 'ASC' },
    });
  }

  async findDistributedByGroup(group: GroupEntity): Promise<MultiDistribEntity[]> {
    return this.multiDistribRepo.find({
      where: [
        {
          groupId: group.id,
          raw_distribStartDate: LessThan(new Date()),
        },
      ],
      order: { raw_distribStartDate: 'DESC' },
    });
  }

  /**
    Get a multiDistrib order end date
  * */
  async getOrdersEndDate(
    multiDistrib: MultiDistribEntity,
    {
      includingExceptions = false,
      loadedDistributions,
    }: {
      includingExceptions?: boolean;
      loadedDistributions?: DistributionEntity[];
    } = {},
  ) {
    if (includingExceptions) {
      // Find latest order end date
      let date = multiDistrib.raw_orderEndDate;
      const distributions = loadedDistributions
        ? loadedDistributions
        : await this.distributionsService.getDistributions(
          multiDistrib.id,
          CatalogType.TYPE_VARORDER,
        );
      distributions.forEach((d) => {
        if (d.raw_orderEndDate.getTime() > date.getTime()) date = d.raw_orderEndDate;
      });
      return date;
    }

    return multiDistrib.raw_orderEndDate;
  }

  /**
    Get a multiDistrib order start date
  * */
  async getOrdersStartDate(
    multiDistrib: MultiDistribEntity,
    {
      includingExceptions = false,
      loadedDistributions,
    }: {
      includingExceptions?: boolean;
      loadedDistributions?: DistributionEntity[];
    } = {},
  ) {
    if (includingExceptions) {
      // Find earliest order start date
      let date = multiDistrib.raw_orderStartDate;
      const distributions = loadedDistributions
        ? loadedDistributions
        : await this.distributionsService.getDistributions(
          multiDistrib.id,
          CatalogType.TYPE_VARORDER,
        );
      distributions.forEach((d) => {
        if (d.raw_orderStartDate.getTime() < date.getTime()) {
          date = d.raw_orderStartDate;
        }
      });
      return date;
    }

    return multiDistrib.raw_orderStartDate;
  }

  checkMultiDistrib(multiDistrib: MultiDistribEntity) {
    if (
      multiDistrib.distribStartDate.getTime() < multiDistrib.orderEndDate.getTime()
    ) {
      throw new DistributionsServiceError(
        DistributionsServiceFailReason.MULTI_DISTRIB_START_DATE_BEFORE_ORDER_END_DATE,
        {
          multiDistribId: multiDistrib.id,
        },
      );
    }

    if (
      multiDistrib.orderStartDate.getTime() > multiDistrib.orderEndDate.getTime()
    ) {
      throw new DistributionsServiceError(
        DistributionsServiceFailReason.MULTI_DISTRIB_ORDER_START_DATE_AFTER_ORDER_END_DATE,
        {
          multiDistribId: multiDistrib.id,
        },
      );
    }
  }

  /**
   *  HELPERS
   */
  private async getMultiDistribFromIdOrEntity(
    multiDistribIdOrEntity: number | MultiDistribEntity,
    lock = false,
  ) {
    return typeof multiDistribIdOrEntity === 'number'
      ? await this.finder.one(multiDistribIdOrEntity, lock)
      : multiDistribIdOrEntity;
  }
}
