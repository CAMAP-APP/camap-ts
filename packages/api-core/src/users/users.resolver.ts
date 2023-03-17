import { NotFoundException, UnauthorizedException, UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  GqlExecutionContext,
  Int,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { addressSchemaNotRequired, phoneSchema, userSchema } from 'camap-common';
import { Request, Response } from 'express';
import { AuthService, SID_COOKIE_NAME } from '../auth/auth.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MaybeCurrentUser } from '../common/decorators/maybe-current-user.decorator';
import { MutationFail } from '../common/decorators/mutation-fail.decorator';
import { TransactionalMutation } from '../common/decorators/transactional-mutation.decorator';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { MaybeAuthGuard } from '../common/guards/maybe-auth.guard';
import { GroupsService } from '../groups/services/groups.service';
import { UserGroupsService } from '../groups/services/user-groups.service';
import { MailsService } from '../mails/mails.service';
import { CacheService } from '../tools/cache.service';
import { CryptoService } from '../tools/crypto.service';
import { UpdateUserNotificationsInput } from './dto/update-user-notifications.input';
import { UpdateUserInput } from './dto/update-user.input';
import { UserEntity } from './models/user.entity';
import { InvitedUser } from './types/invited-user.type';
import { UpdateUserResult } from './types/update-user-result.type';
import { UserNotifications } from './types/user-notifications.type';
import { User } from './types/user.type';
import { UserErrorType } from './user-errors';
import {
  userHasEmailNotif24h,
  userHasEmailNotif4h,
  userHasEmailNotifOuverture,
} from './user.utils';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly userGroupsService: UserGroupsService,
    private readonly groupsService: GroupsService,
    private readonly cacheService: CacheService,
    private readonly cryptoService: CryptoService,
    private readonly authService: AuthService,
    private readonly mailsService: MailsService,
  ) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => User, { name: 'me' })
  async getMe(@CurrentUser() user: UserEntity) {
    return user;
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => User, { name: 'user' })
  async getUser(@Args({ name: 'id', type: () => Int }) id: number) {
    return this.usersService.findOne(id);
  }

  @Query(() => User)
  async getUserFromControlKey(
    @Args({ name: 'id', type: () => Int }) id: number,
    @Args({ name: 'controlKey' }) controlKey: string,
    @Args({ name: 'groupId', type: () => Int, nullable: true }) groupId?: number,
  ) {
    if (!this.isControlKeyValid(id, controlKey, groupId)) {
      throw new UnauthorizedException();
    }

    return this.usersService.findOne(id);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => Boolean)
  async isGroupAdmin(
    @Args({ name: 'groupId', type: () => Int }) groupId: number,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return this.userGroupsService.isGroupAdmin(currentUser, groupId);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => Boolean)
  async canManageAllCatalogs(
    @Args({ name: 'groupId', type: () => Int }) groupId: number,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return this.userGroupsService.canManageAllCatalogs(currentUser, groupId);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [User])
  async getUsersFromEmails(
    @Args({ name: 'emails', type: () => [String] }) emails: string[],
  ) {
    return this.usersService.findByEmails(emails);
  }

  @Query(() => InvitedUser, { nullable: true })
  async getInvitedUserToRegister(
    @Args({ name: 'email', type: () => String }) email: string,
  ) {
    const hashedUserEmail = this.cryptoService.sha1(email);
    const invitedUser = await this.cacheService.get(
      `${CacheService.PREFIXES.invitation}-${hashedUserEmail}`,
    );
    if (!invitedUser) return null;
    return invitedUser;
  }

  @ResolveField(() => UserNotifications)
  async notifications(@Parent() parent: User) {
    const user = await this.usersService.findOne(parent.id);
    if (!user) throw new NotFoundException();
    return {
      hasEmailNotif4h: userHasEmailNotif4h(user),
      hasEmailNotif24h: userHasEmailNotif24h(user),
      hasEmailNotifOuverture: userHasEmailNotifOuverture(user),
    };
  }

  @ResolveField(() => Date, { nullable: true })
  async birthDate(@Parent() parent: User) {
    if (!parent.birthDate) return;
    return new Date(parent.birthDate);
  }

  /** */
  @UseGuards(GqlAuthGuard)
  @TransactionalMutation(() => UpdateUserResult)
  @MutationFail([UserErrorType.MailAlreadyInUse])
  async updateUser(
    @Args('input') input: UpdateUserInput,
    @CurrentUser() currentUser: UserEntity,
  ) {
    let validationSchema = userSchema;
    if (input.phone) validationSchema = validationSchema.concat(phoneSchema);
    if (input.zipCode || input.address1 || input.city)
      validationSchema = validationSchema.concat(addressSchemaNotRequired);
    await validationSchema.validate(input);

    if (input.id !== currentUser.id) throw new UnauthorizedException();
    const user = await this.usersService.lock(input.id);
    if (!user) throw new NotFoundException();
    return this.usersService.update({ ...user, ...input });
  }

  @UseGuards(MaybeAuthGuard)
  @TransactionalMutation(() => User)
  async updateUserNotifications(
    @Args('input') { userId, controlKey, ...input }: UpdateUserNotificationsInput,
    @MaybeCurrentUser() currentUser?: UserEntity,
  ) {
    // Either we have a connected user or a controlKey.
    if (controlKey) {
      if (!this.isControlKeyValid(userId, controlKey)) {
        throw new UnauthorizedException();
      }
    } else if (currentUser && userId !== currentUser.id) {
      throw new UnauthorizedException();
    }

    const user = await this.usersService.findOne(userId);
    if (!user) throw new NotFoundException();
    return this.usersService.updateNotifications(userId, { ...input });
  }

  @UseGuards(GqlAuthGuard)
  @TransactionalMutation(() => Int)
  async deleteAccount(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('password') password: string,
    @Context() context: GqlExecutionContext,
    @CurrentUser() currentUser: UserEntity,
  ) {
    if (userId !== currentUser.id) throw new UnauthorizedException();

    const user = await this.usersService.lock(currentUser.id);
    const isValidPassword = await this.authService.isValidPassword(user, password);
    if (!isValidPassword) {
      throw new UnauthorizedException('wrongPassword');
    }

    const usersGroups = await this.userGroupsService.find({
      where: { userId: user.id },
    });
    const groups = await Promise.all(
      usersGroups.map((ug) => this.groupsService.findOne(ug.groupId)),
    );
    const admins = await Promise.all(
      groups.map((g) => this.userGroupsService.findAllAdminsOfGroup(g)),
    );

    const deletedUserId = await this.usersService.delete(user);

    const sid = ((context as any).req as Request).cookies[SID_COOKIE_NAME];
    await this.authService.logout(sid, (context as any).res as Response, user);

    // Send an email to group admins
    await Promise.all(
      admins.map((adminsOfGroup, index) => {
        const group = groups[index];
        return this.mailsService.createBufferedJsonMail(
          'aMemberOfYourGroupDeletedHisAccount.twig',
          {
            userName: `${currentUser.firstName} ${currentUser.lastName}`,
            groupName: group.name,
            groupId: group.id,
          },
          `Un membre de votre groupe vient de supprimer son compte.`,
          adminsOfGroup,
        );
      }),
    );

    return deletedUserId;
  }

  /**
   * HELPERS
   */
  private isControlKeyValid(
    userId: number,
    controlKey: string,
    groupId?: number,
  ): boolean {
    let stringToHash = '';
    if (groupId) {
      stringToHash += groupId;
    }
    stringToHash += userId;
    return controlKey === this.cryptoService.sha1(stringToHash);
  }
}
