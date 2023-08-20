import { NotFoundException, UnauthorizedException, UseGuards } from '@nestjs/common';
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
import { PaymentsService } from '../../payments/services/payments.service';
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

@UseGuards(GqlAuthGuard)
@Resolver(() => Group)
export class GroupsResolver {
  constructor(
    private readonly groupsService: GroupsService,
    private readonly usersService: UsersService,
    private readonly userGroupsService: UserGroupsService,
    private readonly filesService: FilesService,
    private readonly paymentsService: PaymentsService,
    private readonly multiDistribsService: MultiDistribsService,
  ) { }

  /** QUERIES */
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
  @ResolveField()
  async user(@Parent() group: GroupEntity) {
    return this.usersService.findOne(group.userId);
  }

  @ResolveField(() => String, { nullable: true })
  async image(@Parent() parent: GroupEntity): Promise<string | null> {
    if (!parent.imageId) return null;
    return this.filesService.getUrl(parent.imageId);
  }

  @ResolveField(() => UserGroup, { nullable: true })
  async userGroup(
    @Parent() group: GroupEntity,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return this.userGroupsService.get(currentUser, group.id);
  }

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
  @Transactional()
  @Mutation(() => UserGroup)
  async quitGroup(
    @Args('groupId', { type: () => Int }) groupId: number,
    @CurrentUser() currentUser: UserEntity,
  ) {
    const group = await this.groupsService.findOne(groupId);
    if (!group) throw new NotFoundException();
    // AJOUTER CONTROLE
    const balance = await this.paymentsService.getUserBalance(currentUser.id, groupId);
    //if (balance < 0) throw new UnauthorizedException('votre solde est négatif: solde = ${balance}', 'Vous ne pouvez pas quitter ce groupe');
    if (balance < 0) {
      //throw new Error('Vous ne pouvez pas quitter ce groupe, votre solde est négatif: solde = ${balance}');
      throw new UnauthorizedException(
        `Vous ne pouvez pas quitter ce groupe, votre solde est négatif: solde = ${balance}`,
      );
    }
    // FIN
    const userGroup = await this.userGroupsService.get(currentUser, groupId);
    if (!userGroup) throw new NotFoundException();

    return this.userGroupsService.delete(userGroup);
  }

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
