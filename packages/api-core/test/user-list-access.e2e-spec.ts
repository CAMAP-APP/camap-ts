import { DatasetGenerators } from '../src/dev/dataset-generator';
import { GroupEntity } from '../src/groups/entities/group.entity';
import { UserEntity } from '../src/users/models/user.entity';
import { CatalogEntity } from '../src/vendors/entities/catalog.entity';
import { closeTestApp, initTestApp, TestContextHelper } from './utils';

type Rights = Array<{ right: string; params?: string[] | null }>;

const listQuery = `query($listType: String!, $groupId: Int!, $data: String) {
  getUserListInGroupByListType(listType: $listType, groupId: $groupId, data: $data) { id }
}`;

describe('Member list access (e2e)', () => {
  let helper: TestContextHelper;
  let generators: DatasetGenerators;
  let group: GroupEntity;
  let otherGroup: GroupEntity;
  let catalog: CatalogEntity;
  let otherCatalog: CatalogEntity;
  let foreignCatalog: CatalogEntity;
  let members: UserEntity[];

  beforeAll(async () => {
    helper = await initTestApp();
    generators = await helper.getGenerators();
  });

  afterAll(async () => {
    if (helper) await closeTestApp(helper);
  });

  const userIn = async (target: GroupEntity, rights: Rights = []) => {
    const user = await generators.genUser({ rights: [] });
    await generators.genUserGroup({
      userIdOrEntity: user,
      groupIdOrEntity: target,
      rights,
    });
    return user;
  };

  beforeEach(async () => {
    group = await generators.genGroup({});
    otherGroup = await generators.genGroup({});
    catalog = await generators.genCatalog({ groupIdOrdEntity: group });
    otherCatalog = await generators.genCatalog({ groupIdOrdEntity: group });
    foreignCatalog = await generators.genCatalog({ groupIdOrdEntity: otherGroup });
    members = [await userIn(group), await userIn(group)];
  });

  const fetchList = async (
    user: UserEntity,
    listType: string,
    groupId: number,
    data: string | null = null,
  ) =>
    helper.createApolloClient(user).query<{
      getUserListInGroupByListType: Array<{ id: number }>;
    }>({ query: listQuery, variables: { listType, groupId, data } });

  const expectDenied = async (
    user: UserEntity,
    listType: string,
    groupId: number,
    data: string | null = null,
  ) => {
    const { data: result, errors } = await fetchList(user, listType, groupId, data);
    expect(result).toBeUndefined();
    expect(errors).toBeDefined();
  };

  const expectAllMembers = async (user: UserEntity, data: string | null = null) => {
    const { data: result, errors } = await fetchList(user, 'all', group.id, data);
    expect(errors).toBeUndefined();
    const ids = result.getUserListInGroupByListType.map((u) => u.id);
    for (const member of members) expect(ids).toContain(member.id);
  };

  it.each(['all', 'admins', 'hasOrders', 'newUsers', 'waitingList'])(
    'denies the %s list to a member without management rights',
    async (listType) => {
      await expectDenied(await userIn(group), listType, group.id);
    },
  );

  it('denies lists to a manager of another group', async () => {
    const outsider = await userIn(otherGroup, [{ right: 'GroupAdmin' }]);
    await expectDenied(outsider, 'all', group.id);
    await expectDenied(outsider, 'contractSubscribers', group.id, String(catalog.id));
  });

  it.each(['Membership', 'Messages', 'GroupAdmin'])(
    'returns the members to a %s manager',
    async (right) => {
      await expectAllMembers(await userIn(group, [{ right }]));
    },
  );

  it('returns the members to the manager of the given catalog', async () => {
    const user = await userIn(group, [
      { right: 'ContractAdmin', params: [String(catalog.id)] },
    ]);
    await expectAllMembers(user, String(catalog.id));
  });

  it('returns the members to a manager of all catalogs', async () => {
    const user = await userIn(group, [{ right: 'ContractAdmin', params: null }]);
    await expectAllMembers(user, String(catalog.id));
  });

  it('limits a catalog manager to the members list of that catalog', async () => {
    const user = await userIn(group, [
      { right: 'ContractAdmin', params: [String(catalog.id)] },
    ]);
    await expectDenied(user, 'all', group.id);
    await expectDenied(user, 'all', group.id, String(otherCatalog.id));
    await expectDenied(user, 'all', group.id, 'not-an-id');
    await expectDenied(user, 'contractSubscribers', group.id, String(catalog.id));
  });

  it('does not accept a catalog of another group for the members list', async () => {
    const user = await userIn(otherGroup, [{ right: 'ContractAdmin', params: null }]);
    await expectDenied(user, 'all', group.id, String(foreignCatalog.id));
  });

  it('rejects a catalog of another group for catalog subscribers', async () => {
    const manager = await userIn(group, [{ right: 'Membership' }]);
    await expectDenied(
      manager,
      'contractSubscribers',
      group.id,
      String(foreignCatalog.id),
    );
    const { errors } = await fetchList(
      manager,
      'contractSubscribers',
      group.id,
      String(catalog.id),
    );
    expect(errors).toBeUndefined();
  });

  it('rejects a distribution of another group', async () => {
    const manager = await userIn(group, [{ right: 'Messages' }]);
    const distributionIn = async (target: GroupEntity, targetCatalog: CatalogEntity) => {
      const multiDistrib = await generators.genMultiDistrib({
        groupIdOrEntity: target,
        placeIdOrEntity: target.placeId,
      });
      return generators.genDistribution({
        catalogIdOrEntity: targetCatalog,
        multiDistribIdOrEntity: multiDistrib,
        placeIdOrEntity: target.placeId,
      });
    };
    const foreignDistribution = await distributionIn(otherGroup, foreignCatalog);
    await expectDenied(
      manager,
      'withProductToGetOnDistribution',
      group.id,
      String(foreignDistribution.id),
    );
    const ownDistribution = await distributionIn(group, catalog);
    const { errors } = await fetchList(
      manager,
      'withProductToGetOnDistribution',
      group.id,
      String(ownDistribution.id),
    );
    expect(errors).toBeUndefined();
  });
});
