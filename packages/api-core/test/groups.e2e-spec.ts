import { getRepositoryToken } from '@nestjs/typeorm';
import { gql } from 'apollo-server-core';
import { Repository } from 'typeorm';
import { DatasetGenerators } from '../src/dev/dataset-generator';
import { GroupEntity } from '../src/groups/entities/group.entity';
import { SendInvitesToNewMembersResponse } from '../src/groups/inputs/send-invites-to-new-members-response.type';
import { UserGroup } from '../src/groups/types/user-group.type';
import { MailsService } from '../src/mails/mails.service';
import { CacheService } from '../src/tools/cache.service';
import { RightSite } from '../src/users/models/user.entity';
import {
  closeTestApp,
  createApolloClient,
  initTestApp,
  TestContextHelper,
} from './utils';

const QUIT_GROUP = gql`
  mutation quitGroup($groupId: Int!) {
    quitGroup(groupId: $groupId) {
      userId
      groupId
    }
  }
`;

const SEND_INVITES_TO_NEW_MEMBERS = gql`
  mutation sendInvitesToNewMembers(
    $groupId: Int!
    $withAccounts: [Int!]!
    $withoutAccounts: [SendInvitesToNewMembersInput!]!
  ) {
    sendInvitesToNewMembers(
      groupId: $groupId
      withAccounts: $withAccounts
      withoutAccounts: $withoutAccounts
    ) {
      withAccounts
      withoutAccounts
    }
  }
`;

const USER_WITHOUT_ACCOUNT = {
  firstName: 'First',
  lastName: 'Last',
  email: 'email@email.com',
  phone: '0600000000',
  firstName2: 'First2',
  lastName2: 'Last2',
  email2: 'email2@email.com',
  phone2: '0600000000',
  address1: 'addr1',
  address2: 'addr2',
  zipCode: '12345',
  city: 'City',
};

describe('Groups (e2e)', () => {
  let testHelper: TestContextHelper;
  let groupRepo: Repository<GroupEntity>;
  let mailsService: MailsService;
  let generators: DatasetGenerators;

  beforeAll(async () => {
    testHelper = await initTestApp(false);
    groupRepo = testHelper.moduleFixture.get<Repository<GroupEntity>>(
      getRepositoryToken(GroupEntity),
    );
    mailsService = testHelper.moduleFixture.get<MailsService>(MailsService);
    generators = await testHelper.getGenerators();
  });

  afterAll(async () => {
    await closeTestApp(testHelper);
  });

  /**
   * QUIT GROUP
   */
  it('QUIT GROUP - If user is in group, Should quit group and return the deleted UserGroup', async () => {
    const user = await generators.genUser({});
    const group = await generators.genGroup({});
    await generators.genUserGroup({
      userIdOrEntity: user,
      groupIdOrEntity: group,
    });
    const { query } = createApolloClient(testHelper, user);

    const { data, errors } = await query<UserGroup>({
      query: QUIT_GROUP,
      variables: { groupId: group.id },
    });

    expect(data).toEqual({ quitGroup: { userId: user.id, groupId: group.id } });
    expect(errors).toBeUndefined();
  });

  it('QUIT GROUP - If the group does not exist, Should return an error', async () => {
    const user = await generators.genUser({});
    const groupId = -1;
    const { query } = createApolloClient(testHelper, user);

    const { data, errors } = await query<UserGroup>({
      query: QUIT_GROUP,
      variables: { groupId },
    });

    expect(data).toBeFalsy();
    expect(errors).toBeDefined();
  });

  it('QUIT GROUP - If the user does not exist, Should return an error', async () => {
    const group = await generators.genGroup({});
    const { query } = createApolloClient(testHelper);

    const { data, errors } = await query<UserGroup>({
      query: QUIT_GROUP,
      variables: { groupId: group.id },
    });

    expect(data).toBeFalsy();
    expect(errors).toBeDefined();
  });

  /**
   * SEND INVITES TO NEW MEMBERS
   */
  it('SEND INVITES TO NEW MEMBERS - If both withAccounts and withoutAccounts are empty, Should return an empty array.', async () => {
    const user = await generators.genUser({
      rights: [RightSite.SuperAdmin],
    });
    const group = await generators.genGroup({});
    await generators.genUserGroup({
      userIdOrEntity: user,
      groupIdOrEntity: group,
    });
    const { query } = createApolloClient(testHelper, user);

    const { data, errors } = await query<{
      sendInvitesToNewMembers: SendInvitesToNewMembersResponse;
    }>({
      query: SEND_INVITES_TO_NEW_MEMBERS,
      variables: { groupId: group.id, withAccounts: [], withoutAccounts: [] },
    });

    expect(data.sendInvitesToNewMembers.withAccounts).toHaveLength(0);
    expect(data.sendInvitesToNewMembers.withoutAccounts).toHaveLength(0);
    expect(errors).toBeUndefined();
  });

  it('SEND INVITES TO NEW MEMBERS - If withAccounts contain 3 ids of existing users that are not in this group, Should return these ids.', async () => {
    const user = await generators.genUser({
      rights: [RightSite.SuperAdmin],
    });
    const group = await generators.genGroup({});
    await generators.genUserGroup({
      userIdOrEntity: user,
      groupIdOrEntity: group,
    });
    const existingUsers = await Promise.all([
      await generators.genUser({}),
      await generators.genUser({}),
      await generators.genUser({}),
    ]);
    const { query } = createApolloClient(testHelper, user);

    const { data, errors } = await query<{
      sendInvitesToNewMembers: SendInvitesToNewMembersResponse;
    }>({
      query: SEND_INVITES_TO_NEW_MEMBERS,
      variables: {
        groupId: group.id,
        withAccounts: existingUsers.map((u) => u.id),
        withoutAccounts: [],
      },
    });

    expect(data.sendInvitesToNewMembers.withAccounts).toEqual(
      existingUsers.map((u) => u.id),
    );
    expect(data.sendInvitesToNewMembers.withoutAccounts).toHaveLength(0);
    expect(errors).toBeUndefined();
  });

  it('SEND INVITES TO NEW MEMBERS - If withAccounts contain an id of an existing users that is member of this group, Should return en empty array.', async () => {
    const user = await generators.genUser({
      rights: [RightSite.SuperAdmin],
    });
    const group = await generators.genGroup({});
    const otherUser = await generators.genUser({});
    await generators.genUserGroup({
      userIdOrEntity: otherUser,
      groupIdOrEntity: group,
    });
    const { query } = createApolloClient(testHelper, user);

    const { data, errors } = await query<{
      sendInvitesToNewMembers: SendInvitesToNewMembersResponse;
    }>({
      query: SEND_INVITES_TO_NEW_MEMBERS,
      variables: {
        groupId: group.id,
        withAccounts: [otherUser.id],
        withoutAccounts: [],
      },
    });

    expect(data.sendInvitesToNewMembers.withAccounts).toHaveLength(0);
    expect(data.sendInvitesToNewMembers.withoutAccounts).toHaveLength(0);
    expect(errors).toBeUndefined();
  });

  it('SEND INVITES TO NEW MEMBERS - If withoutAccounts contain data of users, Should return the created Cache keys.', async () => {
    const user = await generators.genUser({
      rights: [RightSite.SuperAdmin],
    });
    const group = await generators.genGroup({});
    const { query } = createApolloClient(testHelper, user);

    const { data, errors } = await query<{
      sendInvitesToNewMembers: SendInvitesToNewMembersResponse;
    }>({
      query: SEND_INVITES_TO_NEW_MEMBERS,
      variables: {
        groupId: group.id,
        withAccounts: [],
        withoutAccounts: [USER_WITHOUT_ACCOUNT],
      },
    });

    expect(data).toBeDefined();
    expect(data.sendInvitesToNewMembers.withoutAccounts[0]).toMatch(
      new RegExp(`${CacheService.PREFIXES.invitation}-`, 'g'),
    );
    expect(data.sendInvitesToNewMembers.withAccounts).toHaveLength(0);
    expect(errors).toBeUndefined();
  });

  it('SEND INVITES TO NEW MEMBERS - If group does not exists, Should return an error.', async () => {
    const user = await generators.genUser({
      rights: [RightSite.SuperAdmin],
    });
    const groupId = -1;
    await expect(groupRepo.findOne(groupId)).resolves.toBeUndefined();
    const { query } = createApolloClient(testHelper, user);

    const { data, errors } = await query<{
      sendInvitesToNewMembers: SendInvitesToNewMembersResponse;
    }>({
      query: SEND_INVITES_TO_NEW_MEMBERS,
      variables: {
        groupId,
        withAccounts: [],
        withoutAccounts: [],
      },
    });

    expect(data).toBeFalsy();
    expect(errors).toBeDefined();
  });

  it('SEND INVITES TO NEW MEMBERS - If current user is not allowed to manage members, Should return an error.', async () => {
    const user = await generators.genUser({});
    const group = await generators.genGroup({});
    const { query } = createApolloClient(testHelper, user);

    const { data, errors } = await query<{
      sendInvitesToNewMembers: SendInvitesToNewMembersResponse;
    }>({
      query: SEND_INVITES_TO_NEW_MEMBERS,
      variables: {
        groupId: group.id,
        withAccounts: [],
        withoutAccounts: [],
      },
    });

    expect(data).toBeFalsy();
    expect(errors).toBeDefined();
  });

  it('SEND INVITES TO NEW MEMBERS - Should create a BufferedJsonMail for each user (with or without account) that are not already member of this group.', async () => {
    const user = await generators.genUser({
      rights: [RightSite.SuperAdmin],
    });
    const group = await generators.genGroup({});
    const { query } = createApolloClient(testHelper, user);

    const existingUsers = await Promise.all([
      await generators.genUser({}),
      await generators.genUser({}),
      await generators.genUser({}),
    ]);

    jest.spyOn(mailsService, 'createBufferedJsonMail');

    await query<{ sendInvitesToNewMembers: SendInvitesToNewMembersResponse }>({
      query: SEND_INVITES_TO_NEW_MEMBERS,
      variables: {
        groupId: group.id,
        withAccounts: existingUsers.map((u) => u.id),
        withoutAccounts: [USER_WITHOUT_ACCOUNT],
      },
    });

    expect(mailsService.createBufferedJsonMail).toHaveBeenCalledTimes(
      existingUsers.length + 1,
    );
  });
});
