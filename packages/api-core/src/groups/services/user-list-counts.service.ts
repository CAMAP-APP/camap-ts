import { BadRequestException, Injectable } from '@nestjs/common';
import { UserLists, UserListsType } from 'camap-common';
import { throwIfAborted } from '../../common/throw-if-aborted';
import { DistributionsService } from '../../shop/services/distributions.service';
import { UsersService } from '../../users/users.service';
import { CatalogsService } from '../../vendors/services/catalogs.service';
import { VendorService } from '../../vendors/services/vendor.service';
import { GroupEntity } from '../entities/group.entity';
import { UserList } from '../types/user-list.type';
import { MemberYearListsService } from './member-year-lists.service';
import { MembershipsService } from './memberships.service';
import { UserGroupsService } from './user-groups.service';
import { WaitingListsService } from './waitingLists.service';

@Injectable()
export class UserListCountsService {
  constructor(
    private readonly users: UsersService,
    private readonly userGroups: UserGroupsService,
    private readonly catalogs: CatalogsService,
    private readonly waitingLists: WaitingListsService,
    private readonly memberships: MembershipsService,
    private readonly distributions: DistributionsService,
    private readonly vendors: VendorService,
    private readonly memberYearLists: MemberYearListsService,
  ) {}

  getLists(group: GroupEntity): UserList[] {
    return UserLists.getLists()
      .filter((list) => !UserLists.isDynamic(list.type))
      .filter(
        (list) =>
          group.hasMembership ||
          ![
            'noMembership',
            'membership',
            'noMembershipWithActivityInMembershipYear',
          ].includes(list.type),
      )
      .map(({ type }) => ({ type }));
  }

  // Dependencies are lazy and shared only within this request, never between groups.
  createCounter(group: GroupEntity, signal?: AbortSignal) {
    const checkCancelled = () => throwIfAborted(signal);
    const once = <T>(calculate: () => Promise<T>) => {
      let result: Promise<T> | undefined;
      return async (): Promise<T> => {
        checkCancelled();
        if (!result) result = calculate();
        const value = await result;
        checkCancelled();
        return value;
      };
    };
    const members = once(() => this.userGroups.getNumberOfMembers(group.id));
    const memberships = once(() =>
      this.memberships.getUsersWithMembership(group, true),
    );
    const catalogs = once(() =>
      this.catalogs.getActiveCatalogsFromActiveVendorsInGroup(group.id),
    );
    const nextDistributions = once(() =>
      this.distributions.getNextDistributionsId(group.id, signal),
    );
    const nextOrders = once(async () =>
      this.users.getUsersWithCommandInDistribution(
        await nextDistributions(),
        group.id,
        true,
        signal,
      ),
    );

    const calculate = async (type: UserListsType): Promise<number> => {
      switch (type) {
        case 'all':
          return members();
        case 'admins':
          return this.userGroups.findAllAdminsOfGroup(group, true, signal);
        case 'hasNoOrders':
          return (
            await this.users.getUsersWithoutOrdersInActiveCatalogs(
              group.id,
              await catalogs(),
              signal,
            )
          ).length;
        case 'hasOrders':
          return this.users.getUsersWithOrdersInActiveCatalogs(
            group.id,
            true,
            await catalogs(),
            signal,
          );
        case 'noMembershipWithActivityInMembershipYear':
          return this.memberYearLists.getUsersToRenew(group, true, signal);
        case 'noMembership':
          return Math.max(0, (await members()) - (await memberships()));
        case 'membership':
          return memberships();
        case 'newUsers':
          return this.userGroups.getNumberOfNewUsers(group.id, signal);
        case 'waitingList':
          return this.waitingLists.getNumberOfWaitingUsersInGroup(group.id);
        case 'withCommandInNextDistribution':
          return nextOrders();
        case 'noCommandInNextDistribution':
          return Math.max(0, (await members()) - (await nextOrders()));
        case 'withRunningContract': {
          const subscriptions = await this.catalogs.getActiveSubscriptions(
            group.id,
            await catalogs(),
          );
          return new Set(
            subscriptions.flatMap((s) =>
              s.userId2 ? [s.userId, s.userId2] : [s.userId],
            ),
          ).size;
        }
        case 'catalogsContacts':
          return new Set(
            (await catalogs()).map((c) => c.userId).filter((id) => id !== null),
          ).size;
        case 'vendors': {
          const vendors = await this.vendors.findByIds(
            (await catalogs()).map((c) => c.vendorId),
          );
          return new Set(vendors.map((v) => v.userId).filter(Boolean)).size;
        }
        default:
          throw new BadRequestException('Unsupported user list');
      }
    };

    return async (type: UserListsType): Promise<UserList> => {
      checkCancelled();
      if (!this.getLists(group).some((list) => list.type === type)) {
        throw new BadRequestException('Unsupported user list');
      }
      const count = await calculate(type);
      checkCancelled();
      return { type, count };
    };
  }
}
