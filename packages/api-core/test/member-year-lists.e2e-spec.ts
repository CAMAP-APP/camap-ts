import { Connection } from 'typeorm';
import { request, Server } from 'http';
import { AddressInfo } from 'net';
import { DatasetGenerators } from '../src/dev/dataset-generator';
import { CsaSubscriptionEntity } from '../src/groups/entities/csa-subscription.entity';
import { GroupEntity } from '../src/groups/entities/group.entity';
import { MembershipEntity } from '../src/groups/entities/membership.entity';
import { getMembershipPeriod } from '../src/groups/membership-period';
import { UserListsResolver } from '../src/groups/resolvers/userLists.resolver';
import { MemberYearListsService } from '../src/groups/services/member-year-lists.service';
import { UserListCountsService } from '../src/groups/services/user-list-counts.service';
import { BasketStatus } from '../src/shop/entities/basket.entity';
import { UserOrderEntity } from '../src/shop/entities/user-order.entity';
import { UserEntity } from '../src/users/models/user.entity';
import { UsersService } from '../src/users/users.service';
import { CatalogsService } from '../src/vendors/services/catalogs.service';
import { CatalogEntity } from '../src/vendors/entities/catalog.entity';
import { closeTestApp, initTestApp, TestContextHelper } from './utils';
import DataLoader = require('dataloader');

describe('Member lists for the membership year (e2e)', () => {
  let helper: TestContextHelper;
  let generators: DatasetGenerators;
  let service: MemberYearListsService;
  let resolver: UserListsResolver;
  let connection: Connection;
  let group: GroupEntity;
  let from: Date;
  let to: Date;
  let year: number;

  beforeAll(async () => {
    helper = await initTestApp();
    connection = helper.app.get(Connection);
    service = helper.app.get(MemberYearListsService);
    resolver = helper.app.get(UserListsResolver);
    generators = await helper.getGenerators();
  });

  afterAll(async () => {
    if (helper) await closeTestApp(helper);
  });

  beforeEach(async () => {
    group = await generators.genGroup({ hasMembership: true });
    group.membershipRenewalDate = '2000-09-01';
    await connection.getRepository(GroupEntity).save(group);
    const period = getMembershipPeriod(group);
    year = period.year;
    // test:e2e forces TZ=UTC. Appending Z preserves the Paris wall-clock values
    // when the fixture generators write these Dates to MySQL datetime columns.
    // With another process timezone, the driver would shift those fixture dates.
    from = new Date(period.from.replace(' ', 'T') + 'Z');
    to = new Date(period.to.replace(' ', 'T') + 'Z');
  });

  const member = async () => {
    const user = await generators.genUser({});
    await generators.genUserGroup({ userIdOrEntity: user, groupIdOrEntity: group });
    return user;
  };

  const order = async (
    user: UserEntity,
    date: Date,
    quantity = 1,
    orderGroup = group,
  ) => {
    const catalog = await generators.genCatalog({
      groupIdOrdEntity: orderGroup,
      startDate: new Date(from.getTime() - 86400000),
      endDate: new Date(to.getTime() + 86400000),
    });
    const multiDistrib = await generators.genMultiDistrib({
      groupIdOrEntity: orderGroup,
      placeIdOrEntity: orderGroup.placeId,
    });
    const distribution = await generators.genDistribution({
      catalogIdOrEntity: catalog,
      multiDistribIdOrEntity: multiDistrib,
      placeIdOrEntity: orderGroup.placeId,
      date,
    });
    const product = await generators.genProduct({ catalogIdOrEntity: catalog });
    const basket = await generators.genBasket({
      status: BasketStatus.CONFIRMED,
      multiDistribIdOrEntity: multiDistrib,
      userIdOrEntity: user,
    });
    // No subscription: these fixtures exercise activity from orders alone.
    return connection.getRepository(UserOrderEntity).save({
      quantity,
      productPrice: 5,
      feesRate: 0,
      paid: false,
      flags: 0,
      date: new Date(from.getTime() - 86400000),
      userId: user.id,
      productId: product.id,
      distributionId: distribution.id,
      basketId: basket.id,
      subscriptionId: null,
    });
  };

  const ids = async () =>
    (await service.getUsersToRenew(group)).map((user) => user.id);

  it.each<[string, 'from' | 'to', number, number, boolean]>([
    ['just before the period', 'from', -1000, 1, false],
    ['at the first instant of the period', 'from', 0, 1, true],
    ['just before the end of the period', 'to', -1000, 1, true],
    ['at the excluded end of the period', 'to', 0, 1, false],
    ['with zero quantity', 'from', 86400000, 0, false],
    ['with negative quantity', 'from', 86400000, -1, false],
  ])('handles an order %s', async (_name, boundary, offset, quantity, included) => {
    const buyer = await member();
    const date = new Date((boundary === 'from' ? from : to).getTime() + offset);
    await order(buyer, date, quantity);
    expect(await ids()).toEqual(included ? [buyer.id] : []);
    expect(await service.getUsersToRenew(group, true)).toBe(included ? 1 : 0);
  });

  it('includes both members of a shared order once, within this group only', async () => {
    const buyer = await member();
    const partner = await member();
    const foreignBuyer = await member();
    const outsider = await generators.genUser({});
    const shared = await order(buyer, from);
    await connection.getRepository(UserOrderEntity).update(shared.id, {
      userId2: partner.id,
    });
    const repeated = await order(buyer, from);
    await connection.getRepository(UserOrderEntity).update(repeated.id, {
      userId2: outsider.id,
    });
    await order(foreignBuyer, from, 1, await generators.genGroup({}));

    expect((await ids()).sort()).toEqual([buyer.id, partner.id].sort());
    expect(await service.getUsersToRenew(group, true)).toBe(2);
  });

  it('includes a subscription even when the member has no orders', async () => {
    const subscriber = await member();
    const catalog = await generators.genCatalog({ groupIdOrdEntity: group });
    await generators.genCsaSubscription({
      userIdOrEntity: subscriber,
      catalogIdOrEntity: catalog,
      startDate: from,
      endDate: to,
    });

    expect(
      await connection
        .getRepository(UserOrderEntity)
        .count({ userId: subscriber.id }),
    ).toBe(0);
    expect(await ids()).toEqual([subscriber.id]);
    expect(await service.getUsersToRenew(group, true)).toBe(1);
  });

  it('returns an empty list and zero count when nobody has activity', async () => {
    await member();
    expect(await ids()).toEqual([]);
    expect(await service.getUsersToRenew(group, true)).toBe(0);
  });

  it('renews only consumers without membership for this group and year', async () => {
    const buyer = await member();
    const formerSubscriber = await member();
    const sharedSubscriber = await member();
    const paid = await member();
    const producerOnly = await member();
    const oldSubscriber = await member();
    const foreignSubscriber = await member();
    const removedPartner = await generators.genUser({});
    const otherGroup = await generators.genGroup({});
    await order(buyer, from);
    await order(paid, from);
    const catalog = await generators.genCatalog({
      groupIdOrdEntity: group,
      startDate: from,
      endDate: new Date(from.getTime() + 86400000),
    });
    const subscription = await generators.genCsaSubscription({
      userIdOrEntity: formerSubscriber,
      catalogIdOrEntity: catalog,
      startDate: from,
      endDate: new Date(from.getTime() + 86400000),
    });
    await connection.getRepository(CsaSubscriptionEntity).update(subscription.id, {
      userId2: sharedSubscriber.id,
    });
    const shared = await generators.genCsaSubscription({
      userIdOrEntity: buyer,
      catalogIdOrEntity: catalog,
      startDate: from,
      endDate: to,
    });
    await connection.getRepository(CsaSubscriptionEntity).update(shared.id, {
      userId2: removedPartner.id,
    });
    await generators.genCsaSubscription({
      userIdOrEntity: oldSubscriber,
      catalogIdOrEntity: catalog,
      startDate: new Date(from.getTime() - 86400000),
      endDate: from,
    });
    const foreignCatalog = await generators.genCatalog({
      groupIdOrdEntity: otherGroup,
    });
    await generators.genCsaSubscription({
      userIdOrEntity: foreignSubscriber,
      catalogIdOrEntity: foreignCatalog,
      startDate: from,
      endDate: to,
    });
    await connection.getRepository(MembershipEntity).save([
      { userId: buyer.id, groupId: group.id, year: year - 1, amount: 10 },
      { userId: buyer.id, groupId: otherGroup.id, year, amount: 10 },
      { userId: paid.id, groupId: group.id, year, amount: 10 },
    ]);

    const result = await ids();
    expect(result.sort()).toEqual(
      [buyer.id, formerSubscriber.id, sharedSubscriber.id].sort(),
    );
    expect(result).not.toContain(producerOnly.id);
  });

  it('uses the same results for list counters and recipients', async () => {
    await order(await member(), from);
    const lists = await resolver.getUserLists(
      group.id,
      new DataLoader<number, GroupEntity>(async (keys) => keys.map(() => group)),
    );
    const type = 'noMembershipWithActivityInMembershipYear';
    const users = await resolver.getUserListInGroupByListType(type, group.id, null);
    expect(await service.getUsersToRenew(group, true)).toBe(users.length);
    expect(lists.find((list) => list.type === type)?.count).toBe(users.length);
  });

  it('hides membership reminders when membership management is disabled', async () => {
    group.hasMembership = false;
    await connection.getRepository(GroupEntity).save(group);
    await order(await member(), from);
    expect(await ids()).toEqual([]);
    expect(await service.getUsersToRenew(group, true)).toBe(0);
    const lists = await resolver.getUserLists(
      group.id,
      new DataLoader<number, GroupEntity>(async (keys) => keys.map(() => group)),
    );
    expect(
      lists.some((list) => list.type === 'noMembershipWithActivityInMembershipYear'),
    ).toBe(false);
  });

  it('returns list names without invoking the counter', async () => {
    const counts = helper.app.get(UserListCountsService);
    const spy = jest.spyOn(counts, 'createCounter');
    try {
      const lists = await resolver.getUserLists(
        group.id,
        new DataLoader<number, GroupEntity>(async (keys) => keys.map(() => group)),
        false,
      );
      expect(lists).toHaveLength(14);
      expect(lists.every((list) => list.count === undefined)).toBe(true);
      expect(spy).not.toHaveBeenCalled();
    } finally {
      spy.mockRestore();
    }
  });

  it.each(['Membership', 'Messages', 'GroupAdmin'])(
    'returns a measured count for a %s manager',
    async (right) => {
      const user = await generators.genUser({ rights: [] });
      await generators.genUserGroup({
        userIdOrEntity: user,
        groupIdOrEntity: group,
        rights: [{ right }],
      });
      await order(user, from);
      const { data } = await helper.createApolloClient(user).query<{
        getUserListCount: { type: string; count: number; durationMs: number };
      }>({
        query: `query($groupId: Int!) {
        getUserListCount(groupId: $groupId, listType: "noMembershipWithActivityInMembershipYear") {
          type count durationMs
        }
      }`,
        variables: { groupId: group.id },
      });
      expect(data?.getUserListCount.type).toBe(
        'noMembershipWithActivityInMembershipYear',
      );
      expect(data?.getUserListCount.count).toBe((await ids()).length);
      expect(data?.getUserListCount.durationMs).toBeGreaterThanOrEqual(0);
    },
  );

  it('denies counts to a member without management rights', async () => {
    const user = await member();
    const { data } = await helper.createApolloClient(user).query({
      query: `query($groupId: Int!) { getUserListCount(groupId: $groupId, listType: "all") { count } }`,
      variables: { groupId: group.id },
    });
    expect(data).toBeUndefined();
  });

  it('does not run the final renewal query after cancellation', async () => {
    await order(await member(), from);
    const controller = new AbortController();
    const spy = jest
      .spyOn(connection.logger, 'logQuery')
      .mockImplementation(() => controller.abort());
    try {
      await expect(
        service.getUsersToRenew(group, true, controller.signal),
      ).rejects.toThrow('cancelled');
      // Only the two activity queries can start; the membership count must not.
      expect(spy).toHaveBeenCalledTimes(2);
    } finally {
      spy.mockRestore();
    }
  });

  it('cancels the next counting step when the HTTP client disconnects', async () => {
    const deferred = <T>() => {
      let resolve!: (value: T) => void;
      const promise = new Promise<T>((done) => {
        resolve = done;
      });
      return { promise, resolve };
    };
    const started = deferred<void>();
    const cancelled = deferred<void>();
    const finished = deferred<void>();
    const catalogsResult = deferred<CatalogEntity[]>();
    const catalogs = helper.app.get(CatalogsService);
    const users = helper.app.get(UsersService);
    const counts = helper.app.get(UserListCountsService);
    const originalCounter = counts.createCounter.bind(counts);
    const counterSpy = jest
      .spyOn(counts, 'createCounter')
      .mockImplementation((g, signal) => {
        signal?.addEventListener('abort', () => cancelled.resolve());
        const counter = originalCounter(g, signal);
        return async (type) => {
          try {
            return await counter(type);
          } finally {
            finished.resolve();
          }
        };
      });
    const catalogsSpy = jest
      .spyOn(catalogs, 'getActiveCatalogsFromActiveVendorsInGroup')
      .mockImplementationOnce(() => {
        started.resolve();
        return catalogsResult.promise;
      });
    const usersSpy = jest.spyOn(users, 'getUsersWithoutOrdersInActiveCatalogs');
    const manager = await generators.genUser({ rights: [] });
    await generators.genUserGroup({
      userIdOrEntity: manager,
      groupIdOrEntity: group,
      rights: [{ right: 'Membership' }],
    });
    await helper.app.listen(0, '127.0.0.1');
    const { port } = (helper.app.getHttpServer() as Server).address() as AddressInfo;
    const client = request({
      host: '127.0.0.1',
      port,
      path: '/graphql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `Authentication=${helper.signUser(manager)};Refresh=blabla`,
      },
    });
    client.on('error', () => {});
    try {
      client.end(
        JSON.stringify({
          query: `{ getUserListCount(groupId: ${group.id}, listType: "hasNoOrders") { count } }`,
        }),
      );
      await started.promise;
      client.destroy();
      await cancelled.promise;
      catalogsResult.resolve([]);
      await finished.promise;
      expect(usersSpy).not.toHaveBeenCalled();
    } finally {
      client.destroy();
      catalogsResult.resolve([]);
      counterSpy.mockRestore();
      catalogsSpy.mockRestore();
      usersSpy.mockRestore();
    }
  });
});
