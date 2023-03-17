import {
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { CsaSubscriptionEntity } from '../../groups/entities/csa-subscription.entity';
import { CsaSubscriptionsService } from '../../groups/services/csa-subscriptions.service';
import { UserGroupsService } from '../../groups/services/user-groups.service';
import { VolunteersService } from '../../groups/services/volunteers.service';
import { CatalogsService } from '../../vendors/services/catalogs.service';
import { DistributionsService } from '../services/distributions.service';
import { AttendanceClassicContract } from '../types/attendance-classic-contract.type';
import { AttendanceVariableContract } from '../types/attendance-variable-contract.type';

@UseGuards(GqlAuthGuard)
@Resolver()
export class AttendanceListResolver {
  constructor(
    private readonly catalogsService: CatalogsService,
    private readonly subscriptionsService: CsaSubscriptionsService,
    private readonly distributionsService: DistributionsService,
    private readonly userGroupsService: UserGroupsService,
    private readonly volunteersService: VolunteersService,
  ) {}

  @Query(() => AttendanceClassicContract)
  async attendanceClassicContract(
    @CurrentUser() user,
    @Args({ name: 'catalogId', type: () => Int }) catalogId: number,
    @Args({ name: 'startDate', nullable: true }) startDate?: Date,
    @Args({ name: 'endDate', nullable: true }) endDate?: Date,
  ) {
    const catalog = await this.catalogsService.findOneById(catalogId);
    if (!catalog) throw new NotFoundException();

    if (catalog.type !== 0) {
      throw new NotFoundException();
    }

    const canManageAllCatalogs = await this.userGroupsService.canManageAllCatalogs(
      user,
      catalog.groupId,
    );
    if (!canManageAllCatalogs) {
      const canManageCatalog = await this.userGroupsService.canManageCatalog(
        user,
        catalog,
      );
      if (!canManageCatalog) {
        const catalogDistributions = await catalog.distributions;
        const catalogMultiDistribIds = [
          ...new Set(
            catalogDistributions.map((distribution) => distribution.multiDistribId),
          ),
        ];
        const isVolunteer =
          await this.volunteersService.userIsVolunteerOfMultiDistribs(
            catalogMultiDistribIds,
            user.id,
          );
        if (!isVolunteer) {
          throw new UnauthorizedException();
        }
      }
    }

    const subscriptions = await this.subscriptionsService.findByCatalogIdInRange(
      catalogId,
      {
        from: startDate || catalog.startDate,
        to: endDate || catalog.endDate,
      },
    );

    const distributions = await this.distributionsService.searchDistribs({
      catalogId,
      dateRange: {
        from: startDate || catalog.startDate,
        to: endDate || catalog.endDate,
      },
    });

    return { catalog, subscriptions, distributions };
  }

  @Query(() => AttendanceVariableContract)
  async attendanceVariableContract(
    @CurrentUser() user,
    @Args({ name: 'catalogId', type: () => Int }) catalogId: number,
    @Args({ name: 'distributionId', type: () => Int }) distributionId: number,
  ) {
    const catalog = await this.catalogsService.findOneById(catalogId);
    if (!catalog) throw new NotFoundException();

    if (catalog.type !== 1) {
      throw new NotFoundException();
    }

    const distribution = await this.distributionsService.findOneDistribution(
      distributionId,
    );
    if (!distribution) throw new NotFoundException();
    if (catalog.id !== distribution.catalogId) {
      throw new InternalServerErrorException();
    }

    const userOrders = await distribution.userOrders;
    const subscriptions = await Promise.all(
      userOrders
        .reduce((acc, userOrder) => {
          const already = acc.some(
            (sub) => sub.subscriptionId === userOrder.subscriptionId,
          );

          if (already) {
            return acc;
          }
          return [
            ...acc,
            {
              subscriptionId: userOrder.subscriptionId,
              subscription: userOrder.subscription,
            },
          ];
        }, [] as Array<{ subscriptionId: number; subscription: Promise<CsaSubscriptionEntity> }>)
        .map((subWrapper) => subWrapper.subscription),
    );

    return {
      catalog,
      distribution,
      subscriptions: subscriptions.filter((subscription) => Boolean(subscription)),
    };
  }
}
