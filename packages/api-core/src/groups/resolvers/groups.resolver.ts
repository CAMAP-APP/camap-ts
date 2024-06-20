import {ForbiddenException, NotFoundException, UnauthorizedException, UseGuards} from '@nestjs/common';
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { compressImage } from '../../common/image';
import { FilesService } from '../../files/file.service';
import { MultiDistribEntity } from '../../shop/entities/multi-distrib.entity';
import { MultiDistribsService } from '../../shop/services/multi-distribs.service';
import { MultiDistrib } from '../../shop/types/multi-distrib.type';
import { UserEntity } from '../../users/models/user.entity';
import { UsersService } from '../../users/users.service';
import { GroupEntity } from '../entities/group.entity';
import { GroupsService } from '../services/groups.service';
import { UserGroupsService } from '../services/user-groups.service';
import { Group } from '../types/group.type';
import { UserGroup } from '../types/user-group.type';
import { isControlKeyValid } from '../../common/utils';
import { CryptoService } from '../../tools/crypto.service';
import { OrdersService } from '../../payments/services/orders.service';

@Resolver(() => Group)
export class GroupsResolver {
  constructor(
    private readonly groupsService: GroupsService,
    private readonly usersService: UsersService,
    private readonly ordersService: OrdersService,
    private readonly userGroupsService: UserGroupsService,
    private readonly filesService: FilesService,
    private readonly multiDistribsService: MultiDistribsService,
    private readonly cryptoService: CryptoService,
  ) { }

  /** QUERIES */
  @UseGuards(GqlAuthGuard)
  @Query(() => Group, { name: 'group' })
  async get(
    @Args({ name: 'id', type: () => Int }) id: number,
    @CurrentUser() currentUser: UserEntity,
  ) {
    const group = await this.groupsService.findOne(id);
    if (!group) throw new NotFoundException();

    await this.userIsAllowedToManageGroup(currentUser, id);

    return group;
  }

  /**
   * RESOLVE FIELDS
   */
  @UseGuards(GqlAuthGuard)
  @ResolveField()
  async user(@Parent() group: GroupEntity) {
    return this.usersService.findOne(group.userId);
  }

  @UseGuards(GqlAuthGuard)
  @ResolveField(() => String, { nullable: true })
  async image(@Parent() parent: GroupEntity): Promise<string | null> {
    if (!parent.imageId) return null;
    return this.filesService.getUrl(parent.imageId);
  }

  @UseGuards(GqlAuthGuard)
  @ResolveField(() => UserGroup, { nullable: true })
  async userGroup(
    @Parent() group: GroupEntity,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return this.userGroupsService.get(currentUser, group.id);
  }

  @UseGuards(GqlAuthGuard)
  @ResolveField(() => [MultiDistrib])
  multiDistribs(
    @Parent() group: Group & { multiDistribs?: Promise<MultiDistribEntity[]> },
  ) {
    if (group.multiDistribs) {
      return group.multiDistribs;
    }
    return this.multiDistribsService.finder.byGroupId(group.id);
  }

  /** MUTATIONS */
  @UseGuards(GqlAuthGuard)
  @Transactional()
  @Mutation(() => UserGroup)
  async quitGroup(
    @Args('groupId', { type: () => Int }) groupId: number,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return await this.doQuitGroup(groupId, currentUser);
  }

  @Transactional()
  @Mutation(() => UserGroup)
  async quitGroupByControlKey(
    @Args('groupId', { type: () => Int }) groupId: number,
    @Args('userId', { type: () => Int }) userId: number,
    @Args('controlKey', { type: () => String }) controlKey: string,
  ) {
    if (!isControlKeyValid(this.cryptoService, userId, controlKey, groupId)) {
      throw new UnauthorizedException();
    }
    const user = await this.usersService.findOne(userId);
    if (!user) throw new NotFoundException();
    return this.doQuitGroup(groupId, user);
  }

  private async doQuitGroup(groupId: number, user: UserEntity) {
    const group = await this.groupsService.findOne(groupId);

    if (!group) throw new NotFoundException();

    if (groupId == 16936) {
      throw new ForbiddenException(
        `Vous ne pouvez pas quitter ce groupe`,
      );
    }

    const userGroup = await this.userGroupsService.get(user, groupId);
    if (!userGroup) throw new NotFoundException();
    if (userGroup.balance < 0) {
      throw new ForbiddenException({
        message: 'unableToQuitGroupNegativeBalance', options: {
          groupName: group.name,
          balance: userGroup.balance,
        },
      });
    }

    // Don't delete users who still have recent orders of less than 1 month
    let orders = await this.ordersService.findRecentUserOrders(user.id, groupId);
    if (orders.length > 0) {
      throw new ForbiddenException(
        `Impossible de quitter ce groupe ${group.name} vous avez des commandes trop récentes (< 1 mois).`,
      );
    }

    return this.userGroupsService.delete(userGroup);
  }

  @UseGuards(GqlAuthGuard)
  @Transactional()
  @Mutation(() => Group)
  async setGroupImage(
    @Args({ name: 'groupId', type: () => Int })
    groupId: number,
    @Args({ name: 'base64EncodedImage' })
    base64EncodedImage: string,
    @Args({ name: 'mimeType' })
    mimeType: string,
    @Args({ name: 'fileName' })
    fileName: string,
    @Args({ name: 'maxWidth', type: () => Int })
    maxWidth: number,
    @CurrentUser() currentUser: UserEntity,
  ) {
    let group = await this.groupsService.findOne(groupId);
    if (!group) throw new NotFoundException();

    await this.userIsAllowedToManageGroup(currentUser, groupId);

    const imageData = base64EncodedImage.substr(`data:${mimeType};base64,`.length);
    const compressedImage = await compressImage(
      Buffer.from(imageData, 'base64'),
      mimeType,
      maxWidth,
    );

    const newImage = await this.filesService.createFromBytes(
      compressedImage,
      fileName,
    );

    if (group.imageId) {
      await this.filesService.delete(group.imageId);
    }

    group = await this.groupsService.lock(groupId);

    return this.groupsService.update({
      id: group.id,
      imageId: newImage.id,
    });
  }

  /**
   * HELPERS
   */
  private async userIsAllowedToManageGroup(
    currentUser: UserEntity,
    groupId: number,
  ) {
    const hasRight = await this.userGroupsService.isGroupAdmin(currentUser, groupId);
    if (!hasRight)
      throw new UnauthorizedException(
        `Current user  ${currentUser.id} is not admin of group ${groupId}.`,
      );
  }
}
