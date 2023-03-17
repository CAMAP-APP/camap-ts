import { ForbiddenException, UseGuards } from '@nestjs/common';
import {
  Args,
  Int,
  Parent,
  Query,
  registerEnumType,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { zonedTimeToUtc } from 'date-fns-tz';
import { TZ_PARIS } from '../../common/constants';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { MaybeAuthGuard } from '../../common/guards/maybe-auth.guard';
import { UserGroupsService } from '../../groups/services/user-groups.service';
import { UserEntity } from '../../users/models/user.entity';
import {
  DistributionCycleEntity,
  DistributionCycleType,
} from '../entities/distribution-cycle.entity';
import { DistributionCyclesService } from '../services/distribution-cycles.service';
import { DistributionCycle } from '../types/distribution-cycle.type';

registerEnumType(DistributionCycleType, { name: 'DistributionCycleType' });

@UseGuards(MaybeAuthGuard)
@Resolver(() => DistributionCycle)
export class DistributionCyclesResolver {
  constructor(
    private readonly distributionCyclesService: DistributionCyclesService,
    private readonly userGroupsService: UserGroupsService,
  ) {}

  /**
   * QUERIES
   */

  @Query(() => [DistributionCycle])
  async distributionCycles(
    @Args({ name: 'groupId', type: () => Int }) groupId: number,
    @CurrentUser() currentUser: UserEntity,
  ) {
    await this.checkCanManageAllCatalogs(groupId, currentUser);

    return this.distributionCyclesService.findCurrentCyclesByGroupId(groupId);
  }

  /**
   * RESOLVE FIELDS
   */

  @ResolveField(() => Date)
  startDate(
    @Parent()
    parent: DistributionCycle & Pick<DistributionCycleEntity, 'raw_startDate'>,
  ) {
    return zonedTimeToUtc(parent.raw_startDate, TZ_PARIS);
  }

  @ResolveField(() => Date)
  endDate(
    @Parent()
    parent: DistributionCycle & Pick<DistributionCycleEntity, 'raw_endDate'>,
  ) {
    return zonedTimeToUtc(parent.raw_endDate, TZ_PARIS);
  }

  @ResolveField(() => Date)
  startHour(
    @Parent()
    parent: DistributionCycle & Pick<DistributionCycleEntity, 'raw_startHour'>,
  ) {
    return zonedTimeToUtc(parent.raw_startHour, TZ_PARIS);
  }

  @ResolveField(() => Date)
  endHour(
    @Parent()
    parent: DistributionCycle & Pick<DistributionCycleEntity, 'raw_endHour'>,
  ) {
    return zonedTimeToUtc(parent.raw_endHour, TZ_PARIS);
  }

  @ResolveField(() => Date)
  openingHour(
    @Parent()
    parent: DistributionCycle & Pick<DistributionCycleEntity, 'raw_openingHour'>,
  ) {
    return zonedTimeToUtc(parent.raw_openingHour, TZ_PARIS);
  }

  @ResolveField(() => Date)
  closingHour(
    @Parent()
    parent: DistributionCycle & Pick<DistributionCycleEntity, 'raw_closingHour'>,
  ) {
    return zonedTimeToUtc(parent.raw_closingHour, TZ_PARIS);
  }

  /**
   * HELPERS
   */
  private async checkCanManageAllCatalogs(groupId: number, currentUser: UserEntity) {
    const canManageAllCatalogs = await this.userGroupsService.canManageAllCatalogs(
      currentUser,
      groupId,
    );
    if (!canManageAllCatalogs) {
      throw new ForbiddenException(
        'You do not have the authorization to access distributions',
      );
    }
  }
}
