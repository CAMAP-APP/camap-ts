import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
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
  registerEnumType,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { ordersAreOpen } from 'camap-common';
import { zonedTimeToUtc } from 'date-fns-tz';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { TZ_PARIS } from '../../common/constants';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Loader } from '../../common/decorators/dataloder.decorator';
import { MaybeCurrentUser } from '../../common/decorators/maybe-current-user.decorator';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { MaybeAuthGuard } from '../../common/guards/maybe-auth.guard';
import { VolunteerRoleEntity } from '../../groups/entities/volunteer-role.entity';
import { VolunteersOfMultiDistribLoader } from '../../groups/loaders/volunteers.loader';
import { GroupsService } from '../../groups/services/groups.service';
import { UserGroupsService } from '../../groups/services/user-groups.service';
import { VolunteersService } from '../../groups/services/volunteers.service';
import { RegOption } from '../../groups/types/interfaces';
import { VolunteerRole } from '../../groups/types/volunteer-role.type';
import { Volunteer } from '../../groups/types/volunteer.type';
import { UserEntity } from '../../users/models/user.entity';
import { MultiDistribEntity } from '../entities/multi-distrib.entity';
import { MultiDistribsLoader } from '../loaders/multiDistribs.loader';
import { MultiDistribOpenStatus } from '../multi-distrib-status';
import { MultiDistribsService } from '../services/multi-distribs.service';
import { Basket } from '../types/basket.type';
import { MultiDistrib } from '../types/multi-distrib.type';
import DataLoader = require('dataloader');

registerEnumType(MultiDistribOpenStatus, { name: 'MultiDistribOpenStatus' });

@UseGuards(MaybeAuthGuard)
@Resolver(() => MultiDistrib)
export class MultiDistribsResolver {
  constructor(
    private readonly multiDistribsService: MultiDistribsService,
    private readonly groupService: GroupsService,
    private readonly userGroupsService: UserGroupsService,
    private readonly volunteersService: VolunteersService,
    private readonly groupsService: GroupsService,
  ) { }

  /**
   * QUERIES
   */

  @UseGuards(GqlAuthGuard)
  @Query(() => MultiDistrib)
  async multiDistribution(
    @Args({ name: 'id', type: () => Int }) id: number,
    @Loader(MultiDistribsLoader)
    multiDistribsLoader: DataLoader<number, MultiDistribEntity>,
  ) {
    const multiDistrib: MultiDistribEntity = await multiDistribsLoader.load(id);
    if (!multiDistrib) {
      throw new NotFoundException();
    }
    return multiDistrib;
  }



  @UseGuards(GqlAuthGuard)
  @Query(() => [MultiDistrib])
  async multiDistribs(
    @Args({ name: 'groupId', type: () => Int }) groupId: number,
    @Args({ name: 'fromDate' }) fromDate: Date,
    @Args({ name: 'toDate' }) toDate: Date,
    @CurrentUser() currentUser: UserEntity,
    @Args({ name: 'nextMultiDistribIfEmpty', nullable: true })
    nextMultiDistribIfEmpty?: boolean, // If true, and if there is no multiDistrib in this range, return the next multiDistrib
  ): Promise<MultiDistrib[]> {
    await this.checkCanManageAllCatalogs(groupId, currentUser);

    const group = await this.groupsService.findOne(groupId);

    if (!group) throw new NotFoundException();

    const multiDistribs = await this.multiDistribsService.getFromTimeRange(
      group,
      fromDate,
      toDate,
    );

    if (!nextMultiDistribIfEmpty || multiDistribs.length > 0) return multiDistribs;

    const nextMultiDistrib =
      await this.multiDistribsService.getNextMultiDistribInGroup(groupId);
    return nextMultiDistrib ? [nextMultiDistrib] : [];
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [MultiDistrib])
  async distributedMultiDistribs(
    @Args({ name: 'groupId', type: () => Int }) groupId: number,
    @CurrentUser() currentUser: UserEntity,
  ) {
    await this.checkCanManageAllCatalogs(groupId, currentUser);

    const group = await this.groupsService.findOne(groupId);

    if (!group) throw new NotFoundException();

    return this.multiDistribsService.findDistributedByGroup(group);
  }

  /**
   * FIELDS
   */
  @ResolveField(() => Date)
  distribStartDate(
    @Parent()
    parent: MultiDistrib & Pick<MultiDistribEntity, 'raw_distribStartDate'>,
  ) {
    return this.parseDate(parent.raw_distribStartDate);
  }

  @ResolveField(() => Date)
  distribEndDate(
    @Parent() parent: MultiDistrib & Pick<MultiDistribEntity, 'raw_distribEndDate'>,
  ) {
    return this.parseDate(parent.raw_distribEndDate);
  }

  @ResolveField(() => Date)
  orderStartDate(
    @Parent() parent: MultiDistrib & Pick<MultiDistribEntity, 'raw_orderStartDate'>,
  ) {
    return this.parseDate(parent.raw_orderStartDate);
  }

  @ResolveField(() => Date)
  orderEndDate(
    @Parent() parent: MultiDistrib & Pick<MultiDistribEntity, 'raw_orderEndDate'>,
  ) {
    return this.parseDate(parent.raw_orderEndDate);
  }


  @ResolveField(() => [Volunteer])
  async volunteers(
    @Parent() parent: MultiDistrib,
    @Loader(VolunteersOfMultiDistribLoader)
    volunteersOfMultiDistribLoader: DataLoader<number, Basket[]>,
  ) {
    return volunteersOfMultiDistribLoader.load(parent.id);
  }

  @ResolveField(() => [VolunteerRole])
  async volunteerRoles(
    @Parent()
    parent: MultiDistribEntity,
  ) {
    const roleIds = parent.volunteerRolesIds;
    if (!roleIds || !roleIds.length) return [];

    var volunteerRoles = await this.volunteersService.findRolesFromIds(roleIds);

    volunteerRoles.sort((a, b) => {
      const prefixCatalogId = (role: VolunteerRoleEntity) =>
        `${role.catalogId ? role.catalogId : ''}${role.name.toLowerCase()}`;
      return prefixCatalogId(a) > prefixCatalogId(b) ? 1 : -1;
    });

    return volunteerRoles;
  }


  /**
   * HELPERS
   */
  private async checkAndGetMultiDistribAndGroup(
    multiDistribId: number,
    currentUser?: UserEntity,
  ) {
    const multiDistrib: MultiDistribEntity =
      await this.multiDistribsService.finder.one(multiDistribId);
    if (!multiDistrib) {
      throw new NotFoundException();
    }
    const group = await this.groupService.findOne(multiDistrib.groupId);
    if (!group) {
      throw new NotFoundException();
    }

    if (!currentUser && group.regOption !== RegOption.Open) {
      if (!currentUser) {
        throw new ForbiddenException(
          `Une erreur a eu lieu. Vous devez vous déconnecter puis vous reconnecter.`,
        );
      }
      if (group.regOption !== RegOption.Open)
        throw new ForbiddenException(
          `The group ${group.id} is not open ${group.regOption}`,
        );
    }

    return { multiDistrib, group };
  }

  private async checkCanManageAllCatalogs(groupId: number, currentUser: UserEntity) {
    if (!(await this.userGroupsService.canManageAllCatalogs(currentUser, groupId))) {
      throw new ForbiddenException(
        'You do not have the authorization to manage all catalogs of this group',
      );
    }
  }

  private parseDate(date: Date | null) {
    if (!date) return null;
    return zonedTimeToUtc(date, TZ_PARIS);
  }
}
