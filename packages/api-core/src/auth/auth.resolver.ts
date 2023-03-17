import { UnauthorizedException, UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  GqlExecutionContext,
  GraphQLExecutionContext,
  Int,
  Mutation,
  Query,
  Resolver,
} from '@nestjs/graphql';
import {
  addressSchemaNotRequired,
  loginSchema,
  phoneSchema,
  userRegistrationSchema,
} from 'camap-common';
import { Request, Response } from 'express';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MaybeCurrentUser } from '../common/decorators/maybe-current-user.decorator';
import { UserIp } from '../common/decorators/user-ip.decorator';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { MaybeAuthGuard } from '../common/guards/maybe-auth.guard';
import { UserGroupsService } from '../groups/services/user-groups.service';
import { UserEntity } from '../users/models/user.entity';
import { User } from '../users/types/user.type';
import { UsersService } from '../users/users.service';
import {
  AuthService,
  SID_COOKIE_NAME,
  UserWrappedWithCookies,
} from './auth.service';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';

@Resolver(() => User)
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly userGroupsService: UserGroupsService,
  ) {}

  /** */
  @Transactional()
  @Mutation(() => User)
  async login(
    @Args('input') input: LoginInput,
    @UserIp() ip: string,
    @Context() context: GraphQLExecutionContext,
  ) {
    await loginSchema.validate(input);

    const userAndCookies = await this.authService.login(
      input.email,
      input.password,
      ip,
      input.sid,
    );
    return this.setCookieHeaderAndReturnUser(context, userAndCookies, input.sid);
  }

  @Mutation(() => Int)
  async recordBadLogin(@UserIp() ip: string) {
    return this.authService.recordBadLogin(ip);
  }

  @Transactional()
  @Mutation(() => User)
  async register(
    @Args('input') input: RegisterInput,
    @UserIp() ip: string,
    @Context() context: GraphQLExecutionContext,
  ) {
    let validationSchema = userRegistrationSchema;
    if (input.phone) validationSchema = validationSchema.concat(phoneSchema);
    if (input.zipCode || input.address1 || input.city)
      validationSchema = validationSchema.concat(addressSchemaNotRequired);
    await validationSchema.validate(input);

    const userAndCookies = await this.authService.registerAndLogin(
      input.email,
      input.password,
      input.firstName,
      input.lastName,
      ip,
      input.sid,
      input.phone,
      input.address1,
      input.zipCode,
      input.city,
      input.email2,
      input.firstName2,
      input.lastName2,
      input.phone2,
    );

    if (input.invitedGroupId) {
      await this.userGroupsService.create(
        userAndCookies.user.id,
        input.invitedGroupId,
      );
    }

    return this.setCookieHeaderAndReturnUser(context, userAndCookies, input.sid);
  }

  @Mutation(() => Int, { nullable: true })
  @UseGuards(MaybeAuthGuard)
  async logout(
    @Context() context: GqlExecutionContext,
    @MaybeCurrentUser() currentUser?: UserEntity,
  ) {
    const sid = ((context as any).req as Request).cookies[SID_COOKIE_NAME];

    await this.authService.logout(
      sid,
      (context as any).res as Response,
      currentUser,
    );

    return currentUser?.id;
  }

  @Transactional()
  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async loginAs(
    @Args('userId', { type: () => Int }) userId: number,
    @CurrentUser() currentUser: UserEntity,
    @Context() context: GraphQLExecutionContext,
    @Args('groupId', { type: () => Int, nullable: true }) groupId?: number,
  ) {
    const user = await this.usersService.findOne(userId);

    if (!currentUser.isSuperAdmin()) {
      if (!groupId || !this.userGroupsService.isGroupAdmin(user, groupId))
        throw new UnauthorizedException();
      if (user.isSuperAdmin()) throw new UnauthorizedException();
      const numberOfGroupThisUserIsMemberOf = await this.userGroupsService.count({
        where: {
          userId,
        },
      });
      if (numberOfGroupThisUserIsMemberOf > 1) throw new UnauthorizedException();
    }

    const userAndCookies = await this.authService.wrapUserWithJwt(user);

    return this.setCookieHeaderAndReturnUser(context, userAndCookies);
  }

  @Transactional()
  @Query(() => Boolean)
  async isEmailRegistered(@Args('email') email: string) {
    const existingUser = await this.usersService.findOneByEmail(email);
    return !!existingUser;
  }

  /**
   * HELPERS
   */
  private setCookieHeaderAndReturnUser(
    context: GraphQLExecutionContext,
    userAndCookies?: UserWrappedWithCookies,
    sid?: string,
  ): Pick<UserEntity, 'id' | 'email'> {
    if (!userAndCookies) {
      throw new UnauthorizedException();
    }

    const cookies = [
      userAndCookies.cookies.withAccessToken,
      userAndCookies.cookies.withRefreshToken,
    ];
    if (sid) {
      cookies.push(this.authService.getAuthSidCookie(sid));
    }
    ((context as any).res as Response).setHeader('Set-Cookie', cookies);

    return userAndCookies.user;
  }
}
