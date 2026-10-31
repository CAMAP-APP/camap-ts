import { Connection } from 'typeorm';
import { DatasetGenerators } from '../src/dev/dataset-generator';
import { CsaSubscriptionEntity } from '../src/groups/entities/csa-subscription.entity';
import { GroupEntity } from '../src/groups/entities/group.entity';
import { MembershipEntity } from '../src/groups/entities/membership.entity';
import { getMembershipPeriod } from '../src/groups/membership-period';
import { UserListsResolver } from '../src/groups/resolvers/userLists.resolver';
import { MemberYearListsService } from '../src/groups/services/member-year-lists.service';
import { UserOrderEntity } from '../src/shop/entities/user-order.entity';
import { UserEntity } from '../src/users/models/user.entity';
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
      startDate: from,
      endDate: to,
    });
    const distribution = await generators.genDistribution({
      catalogIdOrEntity: catalog,
      date,
    });
    return generators.genUserOrder({
      quantity,
      productPrice: 5,
      userIdOrEntity: user,
      distributionIdOrEntity: distribution,
    });
  };

  const ids = async () =>
    (await service.getUsersToRenew(group)).map((user) => user.id);

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
    expect(lists.find((list) => list.type === type)?.count).toBe(users.length);
  });

  it('hides membership reminders when membership management is disabled', async () => {
    group.hasMembership = false;
    await connection.getRepository(GroupEntity).save(group);
    await order(await member(), from);
    expect(await ids()).toEqual([]);
    const lists = await resolver.getUserLists(
      group.id,
      new DataLoader<number, GroupEntity>(async (keys) => keys.map(() => group)),
    );
    expect(
      lists.some((list) => list.type === 'noMembershipWithActivityInMembershipYear'),
    ).toBe(false);
  });
});
