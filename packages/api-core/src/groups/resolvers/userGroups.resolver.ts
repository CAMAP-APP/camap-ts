import { ForbiddenException, UseGuards } from '@nestjs/common';
import { Args, Int, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { UserEntity } from '../../users/models/user.entity';
import { GroupEntity } from '../entities/group.entity';
import { GroupsService } from '../services/groups.service';
import { MembershipsService } from '../services/memberships.service';
import { UserGroupsService } from '../services/user-groups.service';
import { Group } from '../types/group.type';
import { UserGroup } from '../types/user-group.type';

@UseGuards(GqlAuthGuard)
@Resolver(() => UserGroup)
export class UserGroupsResolver {
  constructor(
    private readonly userGroupsService: UserGroupsService,
    private readonly groupsService: GroupsService,
    private readonly membershipsService: MembershipsService,
  ) {}

  /** QUERIES */
  @Query(() => UserGroup, { nullable: true })
  async userGroup(
    @Args({ name: 'groupId', type: () => Int }) groupId: number,
    @Args({ name: 'userId', type: () => Int }) userId: number,
    @CurrentUser() currentUser: UserEntity,
  ) {
    const isGroupAdmin = await this.userGroupsService.isGroupAdmin(
      currentUser,
      groupId,
    );
    const canManageAllCatalogs = await this.userGroupsService.canManageAllCatalogs(
      currentUser,
      groupId,
    );
    const canManageMembers = await this.userGroupsService.canManageMembers(
      currentUser,
      groupId,
    );
    if (!isGroupAdmin && !canManageAllCatalogs && !canManageMembers) {
      throw new ForbiddenException(
        'You do not have the authorization to access user group',
      );
    }

    return this.userGroupsService.get(userId, groupId);
  }

  /**
   * RESOLVE FIELDS
   */
  @ResolveField(() => Group)
  async group(@Parent() parent: UserGroup & { group?: Promise<GroupEntity> }) {
    if (parent.group) {
      return parent.group;
    }
    return this.groupsService.findOne(parent.groupId);
  }

  @ResolveField(() => Boolean)
  async hasValidMembership(@Parent() parent: UserGroup) {
    return this.membershipsService.hasValidMembership(
      parent.userId,
      await this.group(parent),
    );
  }
}
