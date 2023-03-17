import { NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { UserLists, UserListsType } from 'camap-common';
import { add } from 'date-fns';
import { Loader } from '../../common/decorators/dataloder.decorator';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { DistributionEntity } from '../../shop/entities/distribution.entity';
import { DistributionsService } from '../../shop/services/distributions.service';
import { MultiDistribsService } from '../../shop/services/multi-distribs.service';
import { User } from '../../users/types/user.type';
import { UsersService } from '../../users/users.service';
import { CatalogsService } from '../../vendors/services/catalogs.service';
import { GroupEntity } from '../entities/group.entity';
import { GroupsLoader } from '../loaders/groups.loader';
import { GroupsService } from '../services/groups.service';
import { MembershipsService } from '../services/memberships.service';
import { UserGroupsService } from '../services/user-groups.service';
import { WaitingListsService } from '../services/waitingLists.service';
import { UserList } from '../types/user-list.type';
import DataLoader = require('dataloader');

@UseGuards(GqlAuthGuard)
@Resolver(() => UserList)
export class UserListsResolver {
  constructor(
    private readonly groupsService: GroupsService,
    private readonly usersService: UsersService,
    private readonly userGroupsService: UserGroupsService,
    private readonly catalogsService: CatalogsService,
    private readonly waitingListsService: WaitingListsService,
    private readonly membershipsService: MembershipsService,
    private readonly multiDistribsService: MultiDistribsService,
    private readonly distributionsService: DistributionsService,
  ) {}

  @Query(() => [UserList])
  async getUserLists(
    @Args({ name: 'groupId', type: () => Int }) groupId: number,
    @Loader(GroupsLoader) groupLoader: DataLoader<number, GroupEntity>,
  ): Promise<UserList[]> {
    const group = await groupLoader.load(groupId);
    if (!group) throw new NotFoundException();

    const numberOfMembers = await this.userGroupsService.getNumberOfMembers(groupId);
    const numberOfAdmins = await this.userGroupsService.findAllAdminsOfGroup(
      group,
      true,
    );
    let numberOfUsersWithMembership: number;
    if (group.hasMembership)
      numberOfUsersWithMembership =
        await this.membershipsService.getUsersWithMembership(group, true);
    const activeCatalogs =
      await this.catalogsService.getActiveCatalogsFromActiveVendorsInGroup(groupId);
    const numberOfNewUsers = await this.userGroupsService.getNumberOfNewUsers(
      groupId,
    );
    const usersWithNoContracts =
      await this.usersService.getUsersWithoutOrdersInActiveCatalogs(
        groupId,
        activeCatalogs,
      );
    const numberOfUsersWithContracts =
      await this.usersService.getUsersWithOrdersInActiveCatalogs(groupId, true);
    const numberOfWaitingList =
      await this.waitingListsService.getNumberOfWaitingUsersInGroup(groupId);
    const nextDistributionsId =
      await this.distributionsService.getNextDistributionsId(groupId);
    const numberOfUsersWithCommandInNextDistribution =
      await this.usersService.getUsersWithCommandInDistribution(
        nextDistributionsId,
        groupId,
        true,
      );
    let numberOfActiveSubscriptions: number;
    const activeSubscriptions = await this.catalogsService.getActiveSubscriptions(
      groupId,
      activeCatalogs,
    );
    const activeSubscriptionsUserIds = activeSubscriptions.reduce((acc, s) => {
      acc.add(s.userId);
      if (s.userId2) acc.add(s.userId2);
      return acc;
    }, new Set<number>());
    numberOfActiveSubscriptions = activeSubscriptionsUserIds.size;

    const userListOfLists = UserLists.getLists();
    const userLists: UserList[] = [];
    userListOfLists.forEach((l) => {
      switch (l.type) {
        case 'all':
          userLists.push({ type: l.type, count: numberOfMembers });
          break;
        case 'admins':
          userLists.push({ type: l.type, count: numberOfAdmins });
          break;
        case 'hasNoOrders':
          userLists.push({ type: l.type, count: usersWithNoContracts.length });
          break;
        case 'hasOrders':
          userLists.push({ type: l.type, count: numberOfUsersWithContracts });
          break;
        case 'noMembership':
          if (group.hasMembership) {
            userLists.push({
              type: l.type,
              count: Math.max(0, numberOfMembers - numberOfUsersWithMembership),
            });
          }
          break;
        case 'membership':
          if (group.hasMembership) {
            userLists.push({ type: l.type, count: numberOfUsersWithMembership });
          }
          break;
        case 'newUsers':
          userLists.push({ type: l.type, count: numberOfNewUsers });
          break;
        case 'waitingList':
          userLists.push({ type: l.type, count: numberOfWaitingList });
          break;
        case 'withCommandInNextDistribution': {
          userLists.push({
            type: l.type,
            count: numberOfUsersWithCommandInNextDistribution,
          });
          break;
        }
        case 'noCommandInNextDistribution': {
          userLists.push({
            type: l.type,
            count: Math.max(
              0,
              numberOfMembers - numberOfUsersWithCommandInNextDistribution,
            ),
          });
          break;
        }
        case 'withRunningContract': {
          userLists.push({ type: l.type, count: numberOfActiveSubscriptions });
          break;
        }
        case 'catalogsContacts': {
          userLists.push({
            type: l.type,
            count: new Set(
              activeCatalogs.map((c) => c.userId).filter((id) => id !== null),
            ).size,
          });
          break;
        }
        default:
          break;
      }
    });

    return userLists;
  }

  @Query(() => [UserList])
  async getContractsUserLists(
    @Args({ name: 'groupId', type: () => Int }) groupId: number,
  ): Promise<UserList[]> {
    const userListOfLists = UserLists.getLists();
    if (userListOfLists.find((ml) => ml.type === 'contractSubscribers') === null)
      return [];

    const activeCatalogs =
      await this.catalogsService.getActiveCatalogsFromActiveVendorsInGroup(groupId);
    const userLists: UserList[] = [];
    const counts = await Promise.all(
      activeCatalogs.map((c) =>
        this.userGroupsService.getUsersInCatalog(groupId, c.id, true),
      ),
    );
    activeCatalogs.forEach((c, index) => {
      userLists.push({
        type: 'contractSubscribers',
        data: JSON.stringify(c),
        count: counts[index],
      });
    });

    return userLists;
  }

  @Query(() => [UserList])
  async getDistributionsUserLists(
    @Args({ name: 'groupId', type: () => Int }) groupId: number,
  ): Promise<UserList[]> {
    const userListOfLists = UserLists.getLists();
    const group = await this.groupsService.findOne(groupId);
    if (!group) throw new NotFoundException();
    if (
      userListOfLists.find((ml) => ml.type === 'withProductToGetOnDistribution') ===
      null
    )
      return [];

    const userLists: UserList[] = [];
    const now = new Date();
    const to = add(now, { weeks: 2 });
    const multiDistribs = await this.multiDistribsService.getFromTimeRange(
      group,
      now,
      to,
      true,
    );
    const multiDistribsDistributions: DistributionEntity[][] = await Promise.all(
      multiDistribs.map((multiDistrib) => {
        return this.distributionsService.findAllDistributionsOfMultiDistrib(
          multiDistrib.id,
        );
      }),
    );
    const distributions: DistributionEntity[] = multiDistribsDistributions.flat();
    const catalogsByDistribution = await Promise.all(
      distributions.map((d) => this.catalogsService.findOneById(d.catalogId)),
    );
    const counts = await Promise.all(
      distributions.map((d) =>
        this.userGroupsService.getUsersInDistribution(d.id, true),
      ),
    );
    distributions.forEach((d, index) => {
      const catalog = catalogsByDistribution[index];
      userLists.push({
        type: 'withProductToGetOnDistribution',
        data: JSON.stringify({ ...d, catalogName: catalog.name }),
        count: counts[index],
      });
    });

    return userLists;
  }

  @Query(() => [User], { name: 'getUserListInGroupByListType' })
  async getUserListInGroupByListType(
    @Args({ name: 'listType', type: () => String }) listType: UserListsType,
    @Args({ name: 'groupId', type: () => Int }) groupId: number,
    @Args({ name: 'data', nullable: true }) data: string,
  ) {
    const group = await this.groupsService.findOne(groupId);
    if (!group) throw new NotFoundException();

    switch (listType) {
      case 'all':
        return await this.userGroupsService.findAllUsersOfGroupId(groupId, [], true);

      case 'admins':
        return this.userGroupsService.findAllAdminsOfGroup(group);

      case 'hasNoOrders':
        return this.usersService.getUsersWithoutOrdersInActiveCatalogs(groupId);

      case 'hasOrders':
        return this.usersService.getUsersWithOrdersInActiveCatalogs(groupId);

      case 'noMembership':
        return group.hasMembership
          ? this.membershipsService.getUsersWithNoMembership(group)
          : [];

      case 'membership':
        return group.hasMembership
          ? this.membershipsService.getUsersWithMembership(group)
          : [];

      case 'contractSubscribers': {
        const catalogId = parseInt(data, 10);
        if (!catalogId) break;
        return this.userGroupsService.getUsersInCatalog(groupId, catalogId);
      }

      case 'newUsers':
        return this.userGroupsService.getNewUsers(groupId);

      case 'waitingList':
        return (await this.waitingListsService.getWaitingListsOfGroup(groupId)).map(
          (wl) => wl.user,
        );

      case 'withCommandInNextDistribution': {
        const nextDistributionsId =
          await this.distributionsService.getNextDistributionsId(groupId);
        return this.usersService.getUsersWithCommandInDistribution(
          nextDistributionsId,
          groupId,
        );
      }

      case 'noCommandInNextDistribution': {
        const allUsers = await this.userGroupsService.findAllUsersOfGroupId(groupId);
        const nextDistributionsId =
          await this.distributionsService.getNextDistributionsId(groupId);
        const usersWithCommandInDistribution =
          await this.usersService.getUsersWithCommandInDistribution(
            nextDistributionsId,
            groupId,
          );
        return allUsers.filter(
          (u) =>
            usersWithCommandInDistribution.findIndex((u2) => u2.id === u.id) === -1,
        );
      }

      case 'withRunningContract': {
        const activeSubscriptions =
          await this.catalogsService.getActiveSubscriptions(groupId);
        const activeSubscriptionsUserIds = activeSubscriptions.reduce((acc, s) => {
          acc.add(s.userId);
          if (s.userId2) acc.add(s.userId2);
          return acc;
        }, new Set<number>());

        return this.userGroupsService.findByIds(
          Array.from(activeSubscriptionsUserIds),
        );
      }

      case 'withProductToGetOnDistribution': {
        const distributionId = parseInt(data, 10);
        if (!distributionId) break;
        return this.userGroupsService.getUsersInDistribution(distributionId);
      }

      case 'catalogsContacts': {
        const activeCatalogs =
          await this.catalogsService.getActiveCatalogsFromActiveVendorsInGroup(
            groupId,
          );
        return this.usersService.findByIds(activeCatalogs.map((c) => c.userId));
      }

      default:
        break;
    }
    return [];
  }
}
