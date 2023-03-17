import { ForbiddenException, NotFoundException, UseGuards } from '@nestjs/common';
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { add, sub } from 'date-fns';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { PaymentsService } from '../../payments/services/payments.service';
import { Operation } from '../../payments/types/operation.type';
import { MultiDistribEntity } from '../../shop/entities/multi-distrib.entity';
import { MultiDistribsService } from '../../shop/services/multi-distribs.service';
import { UserEntity } from '../../users/models/user.entity';
import { User } from '../../users/types/user.type';
import { UsersService } from '../../users/users.service';
import { CreateMembershipInput } from '../inputs/create-membership.input';
import { CreateMembershipsResponseError } from '../inputs/create-memberships-error.type';
import { CreateMembershipsResponse } from '../inputs/create-memberships-response.type';
import { CreateMembershipsInput } from '../inputs/create-memberships.input';
import { GroupsService } from '../services/groups.service';
import { MembershipsService } from '../services/memberships.service';
import { UserGroupsService } from '../services/user-groups.service';
import { Group } from '../types/group.type';
import { Membership } from '../types/membership.type';
import { MembershipFormData } from '../types/membershipFormData.type';

@UseGuards(GqlAuthGuard)
@Resolver(() => Membership)
export class MembershipsResolver {
  constructor(
    private readonly membershipService: MembershipsService,
    private readonly userService: UsersService,
    private readonly groupService: GroupsService,
    private readonly multiDistribsService: MultiDistribsService,
    private readonly userGroupService: UserGroupsService,
    private readonly paymentsService: PaymentsService,
  ) {}

  /**
   * Get memberships of a user in a group
   */
  @Query(() => [Membership])
  async getUserMemberships(
    @Args({ name: 'groupId', type: () => Int }) groupId: number,
    @Args({ name: 'userId', type: () => Int }) userId: number,
    @Args({ name: 'ignoreIfNotAllowed', type: () => Boolean, defaultValue: false })
    ignoreIfNotAllowed: boolean = false,
    @CurrentUser() currentUser: UserEntity,
  ) {
    try {
      const group = await this.userIsAllowedToAccessMemberships(
        currentUser,
        groupId,
        ignoreIfNotAllowed,
      );
      const userMemberships = await this.membershipService.getUserMemberships(
        userId,
        groupId,
      );

      const operations: Operation[] = await Promise.all(
        userMemberships.map((m) => m.operation),
      );

      return userMemberships.map((m, index) => ({
        ...m,
        amount:
          m.operationId !== null ? Math.abs(operations[index].amount) : m.amount,
        name: this.membershipService.getPeriodNameFromYear(group, m.year),
      }));
    } catch (e) {
      if (ignoreIfNotAllowed) {
        return [];
      } else {
        throw e;
      }
    }
  }

  /**
   * Get data of a fill in a membership form
   */
  @Query(() => MembershipFormData)
  async getMembershipFormData(
    @Args({ name: 'groupId', type: () => Int }) groupId: number,
    @Args({ name: 'userId', type: () => Int }) userId: number,
    @CurrentUser() currentUser: UserEntity,
  ): Promise<MembershipFormData> {
    const group = await this.userIsAllowedToAccessMemberships(currentUser, groupId);

    const { membershipFee } = group;

    const availableYears = [];
    const now = new Date();
    for (let i = -4; i < 2; i++) {
      const year = add(now, { years: i });
      const membershipYear = this.membershipService.getMembershipYear(group, year);
      availableYears.push({
        name: this.membershipService.getPeriodNameFromYear(group, membershipYear),
        id: membershipYear,
      });
    }

    const from = sub(new Date(), { months: 3 });
    const to = add(new Date(), { days: 5 });
    const distributions = await this.multiDistribsService.getFromTimeRange(
      group,
      from,
      to,
    );

    return { membershipFee, availableYears, distributions };
  }

  @ResolveField(() => String)
  async id(@Parent() parent: Membership) {
    return this.parseMembershipId(parent);
  }

  @ResolveField(() => User)
  async user(@Parent() parent: Membership) {
    return this.userService.findOne(parent.userId);
  }

  @ResolveField(() => Group)
  async group(@Parent() parent: Membership) {
    return this.groupService.findOne(parent.groupId);
  }

  @ResolveField(() => Operation, { nullable: true })
  async operation(@Parent() parent: Membership) {
    if (!parent.operationId) return null;
    return this.paymentsService.findOneById(parent.operationId);
  }

  @ResolveField(() => Date)
  async date(@Parent() parent: Membership) {
    return new Date(parent.date);
  }

  @Transactional()
  @Mutation(() => Membership)
  async createMembership(
    @Args({ name: 'input', type: () => CreateMembershipInput })
    {
      userId,
      groupId,
      year,
      date,
      membershipFee,
      distributionId,
    }: CreateMembershipInput,
    @CurrentUser() currentUser: UserEntity,
  ) {
    const group = await this.userIsAllowedToAccessMemberships(currentUser, groupId);

    const membershipYear = year || this.membershipService.getMembershipYear(group);

    const membership = await this.membershipService.getUserMembership(
      userId,
      groupId,
      membershipYear,
    );
    if (membership) throw new ForbiddenException('membershipAlreayExists');

    const user = await this.userService.findOne(userId);
    if (!user) throw new ForbiddenException('This user does not exists');

    if (!group.hasMembership)
      throw new ForbiddenException('This group does not have memberships');

    let distribution: MultiDistribEntity;
    if (distributionId) {
      distribution = await this.multiDistribsService.finder.one(distributionId);
      if (!distribution) throw new NotFoundException('distribution not found');
    }
    return this.membershipService.createMembership(
      user,
      group,
      date,
      membershipYear,
      membershipFee,
      distribution,
    );
  }

  @Transactional()
  @Mutation(() => CreateMembershipsResponse)
  async createMemberships(
    @Args({ name: 'input', type: () => CreateMembershipsInput })
    {
      userIds,
      groupId,
      year,
      date,
      paymentType,
      membershipFee,
      distributionId,
    }: CreateMembershipsInput,
    @CurrentUser() currentUser: UserEntity,
  ) {
    const group = await this.userIsAllowedToAccessMemberships(currentUser, groupId);
    const membershipYear = year || this.membershipService.getMembershipYear(group);
    const errors: CreateMembershipsResponseError[] = [];

    const userIdsToCreateMembership = [...userIds];
    const users = await this.userService.findByIds(userIds);

    const memberships = await Promise.all(
      userIds.map((userId) =>
        this.membershipService.getUserMembership(userId, groupId, membershipYear),
      ),
    );

    let index = memberships.length - 1;
    while (index >= 0) {
      if (memberships[index]) {
        errors.push({ message: 'membershipAlreayExists', userId: users[index].id });
        userIdsToCreateMembership.splice(index, 1);
      }
      index -= 1;
    }

    return {
      success: await Promise.all(
        userIdsToCreateMembership.map((userId) =>
          this.createMembership(
            {
              userId,
              groupId,
              year,
              date,
              paymentType,
              membershipFee,
              distributionId,
            },
            currentUser,
          ),
        ),
      ),
      errors,
    };
  }

  @Transactional()
  @Mutation(() => String)
  async deleteMembership(
    @Args({ name: 'groupId', type: () => Int }) groupId: number,
    @Args({ name: 'userId', type: () => Int }) userId: number,
    @Args({ name: 'year', type: () => Int }) year: number,
    @CurrentUser() currentUser: UserEntity,
  ) {
    const user = await this.userService.findOne(userId);
    const group = await this.groupService.findOne(groupId);

    // rights
    if (!(await this.userGroupService.canManageMembers(currentUser, group))) {
      throw new ForbiddenException(
        'Current user cannot access membership management',
      );
    }

    const result = await this.membershipService.deleteMembership(
      user.id,
      group.id,
      year,
    );

    if (!result) throw new NotFoundException();

    return this.parseMembershipId({ userId: user.id, groupId: group.id, year });
  }

  /**
   * HELPERS
   */
  private async userIsAllowedToAccessMemberships(
    currentUser: UserEntity,
    groupId: number,
    ignoreIfNotAllowed: boolean = false,
  ) {
    const group = await this.groupService.findOne(groupId);

    if (!group) throw new NotFoundException('Group not found');

    if (!(await this.userGroupService.canManageMembers(currentUser, group))) {
      throw new ForbiddenException(
        'Current user cannot access membership management',
      );
    }

    return group;
  }

  private parseMembershipId({
    userId,
    groupId,
    year,
  }: Pick<Membership, 'userId' | 'groupId' | 'year'>) {
    return `${userId}-${groupId}-${year}`;
  }
}
