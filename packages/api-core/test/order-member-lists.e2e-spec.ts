import { addYears, subYears } from 'date-fns';
import { Connection } from 'typeorm';
import { DatasetGenerators } from '../src/dev/dataset-generator';
import { UserGroupsService } from '../src/groups/services/user-groups.service';
import { UserOrderEntity } from '../src/shop/entities/user-order.entity';
import { UserEntity } from '../src/users/models/user.entity';
import { UsersService } from '../src/users/users.service';
import { CatalogEntity } from '../src/vendors/entities/catalog.entity';
import { VendorDisabledReason } from '../src/vendors/entities/vendor.entity';
import { CatalogsService } from '../src/vendors/services/catalogs.service';
import { closeTestApp, initTestApp, TestContextHelper } from './utils';

describe('Order member lists (e2e)', () => {
  let helper: TestContextHelper;
  let generators: DatasetGenerators;
  let users: UsersService;

  beforeAll(async () => {
    helper = await initTestApp();
    generators = await helper.getGenerators();
    users = helper.app.get(UsersService);
  });

  afterAll(async () => {
    if (helper) await closeTestApp(helper);
  });

  it('keeps the existing catalog, participant and group criteria for counts and member lists', async () => {
    const group = await generators.genGroup({});
    const otherGroup = await generators.genGroup({});
    const now = new Date();
    const catalog = await generators.genCatalog({ groupIdOrdEntity: group });
    const distribution = await generators.genDistribution({
      catalogIdOrEntity: catalog,
    });
    const product = await generators.genProduct({ catalogIdOrEntity: catalog });
    const inactiveProduct = await generators.genProduct({
      catalogIdOrEntity: catalog,
      active: false,
    });
    const member = async () => {
      const user = await generators.genUser({});
      await generators.genUserGroup({
        userIdOrEntity: user,
        groupIdOrEntity: group,
      });
      return user;
    };
    const [primary, secondary, zero, negative, past, future, inactive, excluded] =
      await Promise.all(Array.from({ length: 8 }, member));
    const outsider = await generators.genUser({});
    const repo = helper.app.get(Connection).getRepository(UserOrderEntity);
    const order = async (
      user: UserEntity,
      productId = product.id,
      quantity = 1,
      userId2: number | null = null,
      date = now,
    ) => {
      const entity = await generators.genUserOrder({
        userIdOrEntity: user,
        productIdOrEntity: productId,
        distributionIdOrEntity: distribution,
        quantity,
        productPrice: 1,
      });
      await repo.update(entity.id, { userId2, date });
    };

    await order(primary);
    await order(primary); // Several orders must count as one member.
    await order(primary, product.id, 1, primary.id);
    await order(outsider, product.id, 1, secondary.id);
    await order(primary, product.id, 1, outsider.id);
    await order(outsider); // A participant need not belong to this group.
    await order(zero, product.id, 0);
    await order(negative, product.id, -1);
    await order(past, product.id, 1, null, subYears(now, 2));
    await order(future, product.id, 1, null, addYears(now, 2));
    await order(inactive, inactiveProduct.id);

    const ended = await generators.genCatalog({
      groupIdOrdEntity: group,
      startDate: subYears(now, 2),
      endDate: subYears(now, 1),
    });
    const notStarted = await generators.genCatalog({
      groupIdOrdEntity: group,
      startDate: addYears(now, 1),
      endDate: addYears(now, 2),
    });
    const disabledVendor = await generators.genVendor({
      disabled: VendorDisabledReason.Banned,
    });
    const disabled = await generators.genCatalog({
      groupIdOrdEntity: group,
      vendorIdOrdEntity: disabledVendor,
    });
    const elsewhere = await generators.genCatalog({
      groupIdOrdEntity: otherGroup,
    });
    for (const otherCatalog of [ended, notStarted, disabled, elsewhere]) {
      const otherProduct = await generators.genProduct({
        catalogIdOrEntity: otherCatalog,
      });
      await order(excluded, otherProduct.id);
    }

    const expected = [primary, secondary, zero, negative, past, future, inactive]
      .map((user) => user.id)
      .sort((a, b) => a - b);
    const allMembers = await helper.app
      .get(UserGroupsService)
      .findAllUsersOfGroupId(group.id);
    const expectedWithout = allMembers
      .map((user) => user.id)
      .filter((id) => !expected.includes(id))
      .sort((a, b) => a - b);
    const catalogs = await helper.app
      .get(CatalogsService)
      .getActiveCatalogsFromActiveVendorsInGroup(group.id);

    expect(
      (await users.getUsersWithOrdersInActiveCatalogs(group.id))
        .map((user) => user.id)
        .sort((a, b) => a - b),
    ).toEqual(expected);
    expect(await users.getUsersWithOrdersInActiveCatalogs(group.id, true)).toBe(
      expected.length,
    );
    expect(
      await users.getUsersWithOrdersInActiveCatalogs(group.id, true, catalogs),
    ).toBe(expected.length);
    expect(
      (await users.getUsersWithoutOrdersInActiveCatalogs(group.id))
        .map((user) => user.id)
        .sort((a, b) => a - b),
    ).toEqual(expectedWithout);
    expect(
      (await users.getUsersWithoutOrdersInActiveCatalogs(group.id, catalogs))
        .map((user) => user.id)
        .sort((a, b) => a - b),
    ).toEqual(expectedWithout);

    // The shared participant filter is also used by distribution lists.
    expect(
      (await users.getUsersWithCommandInDistribution([distribution.id], group.id))
        .map((user) => user.id)
        .sort((a, b) => a - b),
    ).toEqual([...expected, excluded.id].sort((a, b) => a - b));
  });

  it('returns no participants and all members when there are no catalog products', async () => {
    const group = await generators.genGroup({});
    await generators.genCatalog({ groupIdOrdEntity: group });
    const members = await helper.app
      .get(UserGroupsService)
      .findAllUsersOfGroupId(group.id);

    for (const catalogs of [undefined, [] as CatalogEntity[]]) {
      expect(
        await users.getUsersWithOrdersInActiveCatalogs(group.id, true, catalogs),
      ).toBe(0);
      expect(
        (await users.getUsersWithoutOrdersInActiveCatalogs(group.id, catalogs))
          .map((user) => user.id)
          .sort((a, b) => a - b),
      ).toEqual(members.map((user) => user.id).sort((a, b) => a - b));
    }
  });
});
