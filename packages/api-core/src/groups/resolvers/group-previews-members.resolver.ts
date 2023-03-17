import { ForbiddenException, NotFoundException, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { addressSchemaNotRequired, phoneSchema, userSchema } from 'camap-common';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { AuthService } from '../../auth/auth.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Loader } from '../../common/decorators/dataloder.decorator';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { MailsService } from '../../mails/mails.service';
import { CacheService } from '../../tools/cache.service';
import { CryptoService } from '../../tools/crypto.service';
import { CacheEntity } from '../../tools/models/cache.entity';
import { VariableService } from '../../tools/variable.service';
import { UserEntity } from '../../users/models/user.entity';
import { UsersService } from '../../users/users.service';
import { GroupEntity } from '../entities/group.entity';
import { SendInvitesToNewMembersResponse } from '../inputs/send-invites-to-new-members-response.type';
import { SendInvitesToNewMembersInput } from '../inputs/send-invites-to-new-members.input';
import { GroupsLoader } from '../loaders/groups.loader';
import { GroupsService } from '../services/groups.service';
import { UserGroupsService } from '../services/user-groups.service';
import { GroupPreviewMembers } from '../types/group-preview-members.type';
import { RemoveUsersFromGroupError } from '../types/remove-users-from-group-error.type';
import { RemoveUsersFromGroupResponse } from '../types/remove-users-from-group-reponse.type';
import DataLoader = require('dataloader');

@UseGuards(GqlAuthGuard)
@Resolver(() => GroupPreviewMembers)
export class GroupPreviewMembersResolver {
  constructor(
    private readonly userGroupsService: UserGroupsService,
    private readonly groupsService: GroupsService,
    private readonly usersService: UsersService,
    private readonly cacheService: CacheService,
    private readonly mailsService: MailsService,
    private readonly cryptoService: CryptoService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly variableService: VariableService,
  ) {}

  /** */
  @Query(() => GroupPreviewMembers, { name: 'groupPreviewMembers' })
  async get(
    @Args({ name: 'id', type: () => Int }) id: number,
    @CurrentUser() currentUser: UserEntity,
    @Loader(GroupsLoader) groupLoader: DataLoader<number, GroupEntity>,
  ) {
    await this.userIsAllowedToManageMembers(currentUser, id);

    const group = await groupLoader.load(id);

    if (!group) {
      throw new NotFoundException();
    }

    return group.getPreviewMembers();
  }

  @Transactional()
  @Mutation(() => RemoveUsersFromGroupResponse)
  async removeUsersFromGroup(
    @Args('userIds', { type: () => [Int] }) userIds: number[],
    @Args('groupId', { type: () => Int }) groupId: number,
    @CurrentUser() currentUser: UserEntity,
  ) {
    const userIdsToRemove = [...userIds];
    const errors: RemoveUsersFromGroupError[] = [];
    if (userIds.includes(currentUser.id)) {
      errors.push({
        message: 'cannotRemoveSelfFromGroup',
        userId: currentUser.id,
      });
      userIdsToRemove.splice(userIdsToRemove.indexOf(currentUser.id), 1);
    }

    await this.userIsAllowedToManageMembers(currentUser, groupId);

    const users = await this.usersService.findByIds(userIdsToRemove);
    const userGroups = await Promise.all(
      users.map((user) => this.userGroupsService.get(user, groupId)),
    );

    userGroups.forEach((userGroup, index) => {
      if (!userGroup)
        errors.push({ message: 'userNotInGroup', userId: users[index].id });
    });

    const isGroupAdmins = await Promise.all(
      users.map((user) => this.userGroupsService.isGroupAdmin(user, groupId)),
    );
    let index = isGroupAdmins.length - 1;
    while (index >= 0) {
      if (isGroupAdmins[index]) {
        errors.push({ message: 'cannotRemoveAdmin', userId: users[index].id });
        userGroups.splice(index, 1);
      }
      index -= 1;
    }

    return {
      success: await Promise.all(
        userGroups.map((ug) => this.userGroupsService.delete(ug)),
      ),
      errors,
    };
  }

  @Transactional()
  @Mutation(() => SendInvitesToNewMembersResponse)
  async importAndCreateMembers(
    @Args('groupId', { type: () => Int }) groupId: number,
    @Args('withAccounts', { type: () => [Int] }) withAccounts: number[],
    @Args('withoutAccounts', { type: () => [SendInvitesToNewMembersInput] })
    withoutAccounts: SendInvitesToNewMembersInput[],
    @CurrentUser() currentUser: UserEntity,
  ): Promise<SendInvitesToNewMembersResponse> {
    const group = await this.groupsService.findOne(groupId);
    if (!group) throw new NotFoundException();

    await this.userIsAllowedToManageMembers(currentUser, groupId);

    // For users without account, we will register themn add them to the group and send them an email
    // First we validate data
    await Promise.all(
      withoutAccounts.map((user) => {
        let validationSchema = userSchema;
        if (user.phone) validationSchema = validationSchema.concat(phoneSchema);
        if (user.zipCode || user.address1 || user.city)
          validationSchema = validationSchema.concat(addressSchemaNotRequired);
        return validationSchema.validate(user);
      }),
    );

    // Create accounts
    const newAccounts: UserEntity[] = [];
    for (const user of withoutAccounts) {
      try {
        const newAccount = await this.authService.register(
          user.email,
          '',
          user.firstName,
          user.lastName,
          user.phone,
          user.address1
            ? `${user.address1} ${user.address2 || ''}`
            : user.address2 || '',
          user.zipCode,
          user.city,
          user.email2,
          user.firstName2,
          user.lastName2,
          user.phone2,
        );
        newAccounts.push(newAccount);
      } catch (e) {
        // We can ignore this error, it occures probably
        // because there are several lines with the same
        // email in the CSV.
        if (e.message !== 'emailAlreadyRegistered') {
          throw e;
        }
      }
    }

    const hashedUserEmails = withoutAccounts.map((user) =>
      this.cryptoService.sha1(user.email),
    );
    // Store change password token in Cache
    const twoWeeksInSeconds = 60 * 60 * 24 * 7 * 2;
    const caches = await Promise.all(
      newAccounts.map(
        (user, index) =>
          user &&
          this.cacheService.set(
            `${CacheService.PREFIXES.changePassword}-${hashedUserEmails[index]}`,
            `i${user.id.toString()}`, // Haxe will be in charge of parsing this. We add an "i" to allow haxe parser to parse the user id.
            twoWeeksInSeconds,
          ),
      ),
    );

    // Add them to the group
    await Promise.all(
      newAccounts.map(
        (user) => user && this.userGroupsService.create(user.id, groupId),
      ),
    );

    const theme = await this.variableService.getTheme();

    // Send emails
    await Promise.all(
      newAccounts.map((recipient, index) => {
        if (!recipient) return;
        const token = caches[index].name;
        let link = `${this.configService.get(
          'CAMAP_HOST',
        )}/user/forgottenPassword/${token}/${
          recipient.id
        }/true?mtm_campaign=new-user-created-by-other&mtm_medium=email`;

        return this.mailsService.createBufferedJsonMail(
          'accountCreatedByOther.twig',
          {
            groupName: group.name,
            recipientName: recipient.firstName,
            senderName: `${currentUser.firstName} ${currentUser.lastName}`,
            link,
          },
          `Un compte ${theme.name} vous a été créé`,
          [recipient],
          currentUser,
          true,
        );
      }),
    );

    // For users with an account, we will add them to the group and send them an email
    let usersWithAccount = await Promise.all(
      withAccounts.map((id) => this.usersService.findOne(id)),
    );
    // Filter users who are already member of this group
    const usersWithAccountInGroup = await Promise.all(
      usersWithAccount.map((u) => this.userGroupsService.get(u, groupId)),
    );
    usersWithAccount = usersWithAccount.filter(
      (_, index) => !usersWithAccountInGroup[index],
    );

    // Add them to the group
    await Promise.all(
      usersWithAccount.map((user) =>
        this.userGroupsService.create(user.id, groupId),
      ),
    );

    // Send emails
    await Promise.all(
      usersWithAccount.map((recipient) => {
        let link = `${this.configService.get('CAMAP_HOST')}/group/${group.id}`;
        return this.mailsService.createBufferedJsonMail(
          'addedToGroupByOther.twig',
          {
            groupName: group.name,
            recipientName: recipient.firstName,
            senderName: `${currentUser.firstName} ${currentUser.lastName}`,
            link,
          },
          `Vous avez été ajouté à un groupe ${theme.name}`,
          [recipient],
          currentUser,
          true,
        );
      }),
    );

    return {
      withoutAccounts: caches.filter((c) => !!c).map((c) => c.name),
      withAccounts: usersWithAccount.map((u) => u.id),
    };
  }

  @Transactional()
  @Mutation(() => SendInvitesToNewMembersResponse)
  async sendInvitesToNewMembers(
    @Args('groupId', { type: () => Int }) groupId: number,
    @Args('withAccounts', { type: () => [Int] }) withAccounts: number[],
    @Args('withoutAccounts', { type: () => [SendInvitesToNewMembersInput] })
    withoutAccounts: SendInvitesToNewMembersInput[],
    @CurrentUser() currentUser: UserEntity,
  ): Promise<SendInvitesToNewMembersResponse> {
    const group = await this.groupsService.findOne(groupId);
    if (!group) throw new NotFoundException();

    await this.userIsAllowedToManageMembers(currentUser, groupId);

    // For users without account, we will send them an invite to join Camap
    // First we validate data
    await Promise.all(
      withoutAccounts.map((user) => {
        let validationSchema = userSchema;
        if (user.phone) validationSchema = validationSchema.concat(phoneSchema);
        if (user.zipCode || user.address1 || user.city)
          validationSchema = validationSchema.concat(addressSchemaNotRequired);
        return validationSchema.validate(user);
      }),
    );

    const hashedUserEmails = withoutAccounts.map((user) =>
      this.cryptoService.sha1(user.email),
    );
    // Stock invites in Cache
    const twoWeeksInSeconds = 60 * 60 * 24 * 7 * 2;
    const caches: CacheEntity[] = [];
    for (const [index, user] of withoutAccounts.entries()) {
      const cache = await this.cacheService.set(
        `${CacheService.PREFIXES.invitation}-${hashedUserEmails[index]}`,
        JSON.stringify(user),
        twoWeeksInSeconds,
      );
      caches.push(cache);
    }

    const theme = await this.variableService.getTheme();

    // Send invites by email
    await Promise.all(
      withoutAccounts.map((recipient, index) => {
        let link = `${this.configService.get('CAMAP_HOST')}/invite/${
          hashedUserEmails[index]
        }/${recipient.email}/${
          group.id
        }?mtm_campaign=new-user-invitation&mtm_medium=email`;

        return this.mailsService.createBufferedJsonMail(
          'invitationToCreateAccount.twig',
          {
            groupName: group.name,
            recipientName: recipient.firstName,
            senderName: `${currentUser.firstName} ${currentUser.lastName}`,
            link,
          },
          `Invitation à rejoindre un groupe ${theme.name}`,
          [recipient],
          currentUser,
          true,
        );
      }),
    );

    // For users with an account, we will send them a invite to join the group
    let usersWithAccount = await Promise.all(
      withAccounts.map((id) => this.usersService.findOne(id)),
    );
    // Filter users who are already member of this group
    const usersWithAccountInGroup = await Promise.all(
      usersWithAccount.map((u) => this.userGroupsService.get(u, groupId)),
    );
    usersWithAccount = usersWithAccount.filter(
      (_, index) => !usersWithAccountInGroup[index],
    );

    // Send invites by email
    await Promise.all(
      usersWithAccount.map((recipient) => {
        const hashedUserEmail = this.cryptoService.sha1(recipient.email);
        let link = `${this.configService.get(
          'CAMAP_HOST',
        )}/invite/${hashedUserEmail}/${recipient.email}/${group.id}/${recipient.id}`;

        return this.mailsService.createBufferedJsonMail(
          'invitationToJoinGroup.twig',
          {
            groupName: group.name,
            recipientName: recipient.firstName,
            senderName: `${currentUser.firstName} ${currentUser.lastName}`,
            link,
          },
          `Invitation à rejoindre un groupe ${theme.name}`,
          [recipient],
          currentUser,
          true,
        );
      }),
    );

    return {
      withoutAccounts: caches.map((c) => c.name),
      withAccounts: usersWithAccount.map((u) => u.id),
    };
  }

  /**
   * HELPERS
   */
  private async userIsAllowedToManageMembers(
    currentUser: UserEntity,
    groupId: number,
  ) {
    const hasRight = await this.userGroupsService.canManageMembers(
      currentUser,
      groupId,
    );
    if (!hasRight) {
      throw new ForbiddenException(
        `Current user  ${currentUser.id} does not have membership right in group ${groupId}.`,
      );
    }
  }
}
