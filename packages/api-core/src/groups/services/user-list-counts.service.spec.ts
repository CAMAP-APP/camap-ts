import { Test } from '@nestjs/testing';
import { DistributionsService } from '../../shop/services/distributions.service';
import { UsersService } from '../../users/users.service';
import { CatalogsService } from '../../vendors/services/catalogs.service';
import { VendorService } from '../../vendors/services/vendor.service';
import { GroupEntity } from '../entities/group.entity';
import { MemberYearListsService } from './member-year-lists.service';
import { MembershipsService } from './memberships.service';
import { UserGroupsService } from './user-groups.service';
import { UserListCountsService } from './user-list-counts.service';
import { WaitingListsService } from './waitingLists.service';

describe('UserListCountsService', () => {
  let service: UserListCountsService;
  const group = Object.assign(new GroupEntity(), { id: 42, hasMembership: true });
  const userGroups = {
    getNumberOfMembers: jest.fn(),
    findAllAdminsOfGroup: jest.fn(),
    getNumberOfNewUsers: jest.fn(),
  };
  const users = {
    getUsersWithoutOrdersInActiveCatalogs: jest.fn(),
    getUsersWithOrdersInActiveCatalogs: jest.fn(),
    getUsersWithCommandInDistribution: jest.fn(),
  };
  const catalogs = {
    getActiveCatalogsFromActiveVendorsInGroup: jest.fn(),
    getActiveSubscriptions: jest.fn(),
  };
  const memberships = { getUsersWithMembership: jest.fn() };
  const memberYearLists = { getUsersToRenew: jest.fn() };
  const waitingLists = { getNumberOfWaitingUsersInGroup: jest.fn() };
  const distributions = { getNextDistributionsId: jest.fn() };
  const vendors = { findByIds: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    userGroups.getNumberOfMembers.mockResolvedValue(10);
    userGroups.findAllAdminsOfGroup.mockResolvedValue(2);
    userGroups.getNumberOfNewUsers.mockResolvedValue(1);
    users.getUsersWithoutOrdersInActiveCatalogs.mockResolvedValue([{}, {}, {}]);
    users.getUsersWithOrdersInActiveCatalogs.mockResolvedValue(7);
    users.getUsersWithCommandInDistribution.mockResolvedValue(4);
    catalogs.getActiveCatalogsFromActiveVendorsInGroup.mockResolvedValue([
      { vendorId: 1, userId: 3 },
      { vendorId: 2, userId: 3 },
      { vendorId: 3, userId: null },
    ]);
    catalogs.getActiveSubscriptions.mockResolvedValue([
      { userId: 1, userId2: 2 },
      { userId: 2, userId2: null },
    ]);
    vendors.findByIds.mockResolvedValue([
      { userId: 1 },
      { userId: 1 },
      { userId: null },
    ]);
    memberships.getUsersWithMembership.mockResolvedValue(8);
    memberYearLists.getUsersToRenew.mockResolvedValue(1);
    waitingLists.getNumberOfWaitingUsersInGroup.mockResolvedValue(0);
    distributions.getNextDistributionsId.mockResolvedValue([100]);
    const module = await Test.createTestingModule({
      providers: [
        UserListCountsService,
        { provide: UserGroupsService, useValue: userGroups },
        { provide: UsersService, useValue: users },
        { provide: CatalogsService, useValue: catalogs },
        { provide: MembershipsService, useValue: memberships },
        { provide: MemberYearListsService, useValue: memberYearLists },
        { provide: WaitingListsService, useValue: waitingLists },
        { provide: DistributionsService, useValue: distributions },
        { provide: VendorService, useValue: vendors },
      ],
    }).compile();
    service = module.get(UserListCountsService);
  });

  it('returns names immediately without computing a count', () => {
    const lists = service.getLists(group);
    expect(lists).toHaveLength(14);
    expect(lists.every((list) => list.count === undefined)).toBe(true);
    for (const dependency of [
      userGroups,
      users,
      catalogs,
      memberships,
      memberYearLists,
      waitingLists,
      distributions,
      vendors,
    ]) {
      for (const method of Object.values(dependency))
        expect(method).not.toHaveBeenCalled();
    }
  });

  it('keeps existing counts and shares dependencies within a request', async () => {
    const counter = service.createCounter(group);
    const lists = [];
    for (const list of service.getLists(group)) lists.push(await counter(list.type));
    expect(Object.fromEntries(lists.map((list) => [list.type, list.count]))).toEqual(
      {
        all: 10,
        admins: 2,
        catalogsContacts: 1,
        hasNoOrders: 3,
        hasOrders: 7,
        newUsers: 1,
        noMembership: 2,
        noMembershipWithActivityInMembershipYear: 1,
        membership: 8,
        waitingList: 0,
        withCommandInNextDistribution: 4,
        noCommandInNextDistribution: 6,
        withRunningContract: 2,
        vendors: 1,
      },
    );
    expect(
      lists.every(
        (list) => Number.isFinite(list.durationMs) && list.durationMs >= 0,
      ),
    ).toBe(true);
    expect(userGroups.getNumberOfMembers).toHaveBeenCalledTimes(1);
    expect(memberships.getUsersWithMembership).toHaveBeenCalledTimes(1);
    expect(catalogs.getActiveCatalogsFromActiveVendorsInGroup).toHaveBeenCalledTimes(
      1,
    );
    expect(distributions.getNextDistributionsId).toHaveBeenCalledTimes(1);
    expect(users.getUsersWithCommandInDistribution).toHaveBeenCalledTimes(1);
    await service.createCounter(group)('all');
    expect(userGroups.getNumberOfMembers).toHaveBeenCalledTimes(2);
  });

  it('excludes disabled membership and dynamic lists', async () => {
    const disabledGroup = Object.assign(new GroupEntity(), {
      id: 43,
      hasMembership: false,
    });
    expect(service.getLists(disabledGroup)).toHaveLength(11);
    await expect(
      service.createCounter(disabledGroup)('noMembership'),
    ).rejects.toThrow('Unsupported');
    await expect(
      service.createCounter(group)('contractSubscribers'),
    ).rejects.toThrow('Unsupported');
    await expect(service.createCounter(group)('freeList')).rejects.toThrow(
      'Unsupported',
    );
    expect(memberYearLists.getUsersToRenew).not.toHaveBeenCalled();
  });

  it('does not start work when already cancelled', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(
      service.createCounter(group, controller.signal)('all'),
    ).rejects.toThrow('cancelled');
    expect(userGroups.getNumberOfMembers).not.toHaveBeenCalled();
  });

  it('stops before the next dependency when cancelled during a query', async () => {
    const controller = new AbortController();
    catalogs.getActiveCatalogsFromActiveVendorsInGroup.mockImplementation(
      async () => {
        controller.abort();
        return [];
      },
    );
    await expect(
      service.createCounter(group, controller.signal)('hasNoOrders'),
    ).rejects.toThrow('cancelled');
    expect(users.getUsersWithoutOrdersInActiveCatalogs).not.toHaveBeenCalled();
  });
});
