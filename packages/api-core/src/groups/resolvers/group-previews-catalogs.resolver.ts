import { ForbiddenException, NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Int, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Loader } from '../../common/decorators/dataloder.decorator';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { PlaceEntity } from '../../places/models/place.entity';
import { PlacesService } from '../../places/services/places.service';
import { Place } from '../../places/types/place.type';
import { UserEntity } from '../../users/models/user.entity';
import { User } from '../../users/types/user.type';
import { GroupEntity } from '../entities/group.entity';
import { VolunteerRoleEntity } from '../entities/volunteer-role.entity';
import { GroupsLoader } from '../loaders/groups.loader';
import { GroupsService } from '../services/groups.service';
import { UserGroupsService } from '../services/user-groups.service';
import { VolunteersService } from '../services/volunteers.service';
import { GroupPreviewCatalogs } from '../types/group-preview-catalogs.type';
import { VolunteerRole } from '../types/volunteer-role.type';
import DataLoader = require('dataloader');

@UseGuards(GqlAuthGuard)
@Resolver(() => GroupPreviewCatalogs)
export class GroupPreviewCatalogssResolver {
  constructor(
    private readonly userGroupsService: UserGroupsService,
    private readonly volunteersService: VolunteersService,
    private readonly placesService: PlacesService,
    private readonly groupsService: GroupsService,
  ) {}

  /** */
  @Query(() => GroupPreviewCatalogs, { name: 'groupPreviewCatalogs' })
  async get(
    @Args({ name: 'id', type: () => Int }) id: number,
    @CurrentUser() currentUser: UserEntity,
    @Loader(GroupsLoader) groupLoader: DataLoader<number, GroupEntity>,
  ) {
    await this.userIsAllowedToManageCatalogs(currentUser, id);

    const group = await groupLoader.load(id);

    if (!group) {
      throw new NotFoundException();
    }

    return group.getPreviewCatalogs();
  }

  /**
   * Resolve fields
   */

  @ResolveField(() => [VolunteerRole])
  async volunteerRoles(
    @Parent()
    parent: GroupPreviewCatalogs & {
      volunteerRoles?: Promise<VolunteerRoleEntity[]>;
    },
  ): Promise<VolunteerRole[]> {
    if (parent.volunteerRoles) {
      return parent.volunteerRoles;
    }
    return this.volunteersService.findRolesFromGroupId(parent.id);
  }

  @ResolveField(() => [Place])
  async places(
    @Parent()
    parent: GroupPreviewCatalogs & {
      places?: Promise<PlaceEntity[]>;
    },
  ): Promise<PlaceEntity[]> {
    if (parent.places) {
      return parent.places;
    }
    return this.placesService.findFromGroup(parent.id);
  }

  @ResolveField(() => Place)
  async mainPlace(
    @Parent()
    parent: GroupPreviewCatalogs,
  ): Promise<PlaceEntity> {
    return this.groupsService.getMainPlace(parent.id);
  }

  @ResolveField(() => [User])
  async users(@Parent() group: GroupEntity) {
    return this.userGroupsService.findAllUsersOfGroupId(group.id, [], true);
  }

  /**
   * HELPERS
   */
  private async userIsAllowedToManageCatalogs(
    currentUser: UserEntity,
    groupId: number,
  ) {
    const hasRight = await this.userGroupsService.canManageAllCatalogs(
      currentUser,
      groupId,
    );
    if (!hasRight) {
      throw new ForbiddenException(
        `Current user  ${currentUser.id} does not have catalogAdmin right in group ${groupId}.`,
      );
    }
  }
}
