import { NotFoundException } from '@nestjs/common';
import { Args, Int, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { zonedTimeToUtc } from 'date-fns-tz';
import { TZ_PARIS } from '../../common/constants';
import { OrdersService } from '../../payments/services/orders.service';
import { DistributionEntity } from '../entities/distribution.entity';
import { MultiDistribEntity } from '../entities/multi-distrib.entity';
import { DistributionsService } from '../services/distributions.service';
import { MultiDistribsService } from '../services/multi-distribs.service';
import { Distribution } from '../types/distribution.type';
import { MultiDistrib } from '../types/multi-distrib.type';
import { UserOrder } from '../types/user-order.type';

@Resolver(() => Distribution)
export class DistributionsResolver {
  constructor(
    private readonly distributionsService: DistributionsService,
    private readonly multiDistribsService: MultiDistribsService,
    private readonly ordersService: OrdersService,
  ) {}

  /**
   * QUERIES
   */

  @Query(() => Distribution)
  async distribution(@Args({ name: 'id', type: () => Int }) id: number) {
    const distribution = await this.distributionsService.findOneDistribution(id);

    if (!distribution) {
      throw new NotFoundException();
    }

    return distribution;
  }

  /**
   * RESOLVE FIELDS
   */

  @ResolveField(() => Date)
  date(
    @Parent()
    parent: Distribution & Pick<DistributionEntity, 'raw_date'>,
  ) {
    return zonedTimeToUtc(parent.raw_date, TZ_PARIS);
  }

  @ResolveField(() => Date)
  end(@Parent() parent: Distribution & Pick<DistributionEntity, 'raw_end'>) {
    return zonedTimeToUtc(parent.raw_end, TZ_PARIS);
  }

  @ResolveField(() => Date)
  orderStartDate(
    @Parent()
    parent: Distribution & Pick<DistributionEntity, 'raw_orderStartDate'>,
  ) {
    return zonedTimeToUtc(parent.raw_orderStartDate, TZ_PARIS);
  }

  @ResolveField(() => Date)
  orderEndDate(
    @Parent() parent: Distribution & Pick<DistributionEntity, 'raw_orderEndDate'>,
  ) {
    return zonedTimeToUtc(parent.raw_orderEndDate, TZ_PARIS);
  }

  @ResolveField(() => [UserOrder])
  async userOrders(
    @Parent() parent: Distribution & { userOrders?: Promise<UserOrder[]> },
  ) {
    if (parent.userOrders) {
      return parent.userOrders;
    }
    return this.ordersService.findUserOrdersByDistributionIds([parent.id]);
  }

  @ResolveField(() => MultiDistrib)
  async multiDistrib(
    @Parent()
    parent: Distribution & {
      multiDistribId?: number;
      multiDistrib?: Promise<MultiDistribEntity>;
    },
  ) {
    if (parent.multiDistrib) {
      return parent.multiDistrib;
    }
    if (parent.multiDistribId) {
      return this.multiDistribsService.finder.one(parent.multiDistribId);
    }
    throw new NotFoundException();
  }
}
