import { ForbiddenException, UseGuards } from '@nestjs/common';
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { zonedTimeToUtc } from 'date-fns-tz';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { TZ_PARIS } from '../../common/constants';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { WaitingListEntity } from '../../entities/waiting-list.entity';
import { MailsService } from '../../mails/mails.service';
import { UserEntity } from '../../users/models/user.entity';
import { UsersService } from '../../users/users.service';
import { GroupEntity } from '../entities/group.entity';
import { GroupsService } from '../services/groups.service';
import { UserGroupsService } from '../services/user-groups.service';
import { WaitingListsService } from '../services/waitingLists.service';
import { MoveBackToWaitingListError } from '../types/move-back-to-waiting-list-error.type';
import { MoveBackToWaitingListResponse } from '../types/move-back-to-waiting-list-response.type';
import { UserGroup } from '../types/user-group.type';
import { WaitingList } from '../types/waitingList.type';

@UseGuards(GqlAuthGuard)
@Resolver(() => WaitingList)
export class WaitingListsResolver {
  constructor(
    private readonly waitinglistsService: WaitingListsService,
    private readonly usersService: UsersService,
    private readonly groupsService: GroupsService,
    private readonly userGroupsService: UserGroupsService,
    private readonly mailsService: MailsService,
  ) {}

  @Query(() => [WaitingList], { name: 'getWaitingListsOfGroup' })
  async getWaitingListsOfGroup(
    @Args('groupId', { type: () => Int }) groupId: number,
  ) {
    return this.waitinglistsService.getWaitingListsOfGroup(groupId);
  }

  @Transactional()
  @Mutation(() => MoveBackToWaitingListResponse, { name: 'moveBackToWaitingList' })
  async moveBackToWaitingList(
    @Args('userIds', { type: () => [Int] }) userIds: number[],
    @Args('groupId', { type: () => Int }) groupId: number,
    @Args('message') message: string,
    @CurrentUser() currentUser: UserEntity,
  ) {
    const userIdsToMoveToWL = [...userIds];
    const errors: MoveBackToWaitingListError[] = [];
    if (userIds.includes(currentUser.id)) {
      errors.push({ message: 'cannotSetSelfToWaitingList', userId: currentUser.id });
      userIdsToMoveToWL.splice(userIdsToMoveToWL.indexOf(currentUser.id), 1);
    }

    const group = await this.groupsService.findOne(groupId);

    if (
      !group ||
      !(await this.userGroupsService.canManageMembers(currentUser, group))
    ) {
      throw new ForbiddenException(
        'Current user cannot access membership management',
      );
    }

    const users = await this.usersService.findByIds(userIdsToMoveToWL);
    const userGroups = await Promise.all(
      users.map((user) => this.userGroupsService.get(user, groupId)),
    );

    userGroups.forEach((userGroup, index) => {
      if (userGroup) return;
      errors.push({ message: 'userNotInGroup', userId: users[index].id });
      userGroups.splice(index, 1);
      users.splice(index, 1);
    });

    const isGroupAdmins = await Promise.all(
      users.map((user) => this.userGroupsService.isGroupAdmin(user, group)),
    );
    let index = isGroupAdmins.length - 1;
    while (index >= 0) {
      if (isGroupAdmins[index]) {
        errors.push({
          message: 'cannotSetAdminToWaitingLIst',
          userId: users[index].id,
        });
        userGroups.splice(index, 1);
        users.splice(index, 1);
      }
      index -= 1;
    }

    await Promise.all(
      userGroups.map((ug) => ug && this.userGroupsService.delete(ug)),
    );

    return {
      success: await Promise.all(
        users.map((user) => this.waitinglistsService.create(user, group, message)),
      ),
      errors,
    };
  }

  @Transactional()
  @Mutation(() => WaitingList, { name: 'cancelRequest' })
  async cancelRequest(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('groupId', { type: () => Int }) groupId: number,
    @CurrentUser() currentUser: UserEntity,
  ) {
    const { user, group, waitingList } =
      await this.waitingListExistsAndUserIsAllowed(currentUser, userId, groupId);

    // email the requester
    const groupName = group.name;
    const userName = `${user.firstName} ${user.lastName}`;
    const currentUserName = `${currentUser.firstName} ${currentUser.lastName}`;

    await this.mailsService.createBufferedJsonMail(
      'message.twig',
      {
        text: `Votre demande d'adhésion au groupe <b>${groupName}</b> a été refusée.`,
        groupName,
        groupId,
      },
      `Demande d'adhésion refusée.`,
      [user],
      currentUser,
    );

    // email others admin
    let admins = await this.userGroupsService.findAllAdminsOfGroup(group);
    const memberAdmins = await Promise.all(
      admins.map((a) => this.userGroupsService.canManageMembers(a, groupId)),
    );
    admins = admins.filter((_, index) => memberAdmins[index]);
    admins.forEach((admin) => {
      if (admin.id === currentUser.id) return;
      this.mailsService.createBufferedJsonMail(
        'message.twig',
        {
          text: `<p><b>${userName}</b> était inscrit à la liste d'attente.</p><p><b>${currentUserName}</b> a refusé sa demande.</p>`,
          groupName,
          groupId,
        },
        `${groupName} La demande d'adhésion de ${userName} a été refusée par ${currentUserName}.`,
        [admin],
        currentUser,
      );
    });

    return this.waitinglistsService.delete(waitingList);
  }

  @Transactional()
  @Mutation(() => UserGroup, { name: 'approveRequest' })
  async approveRequest(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('groupId', { type: () => Int }) groupId: number,
    @CurrentUser() currentUser: UserEntity,
  ) {
    const { user, group, waitingList } =
      await this.waitingListExistsAndUserIsAllowed(currentUser, userId, groupId);

    let userGroup = await this.userGroupsService.get(user, groupId);
    if (!userGroup) {
      userGroup = await this.userGroupsService.create(userId, groupId);
    }

    await this.waitinglistsService.delete(waitingList);

    // email the requester
    const groupName = group.name;
    const userName = `${user.firstName} ${user.lastName}`;
    const currentUserName = `${currentUser.firstName} ${currentUser.lastName}`;

    await this.mailsService.createBufferedJsonMail(
      'message.twig',
      {
        text: `<p>Votre demande d'adhésion à <b>${groupName}</b> a été acceptée !</p><p>Vous êtes maintenant membre de ce groupe.</p>`,
        groupName,
        groupId,
      },
      `Demande d'adhésion acceptée.`,
      [user],
      currentUser,
    );

    // email others admin
    let admins = await this.userGroupsService.findAllAdminsOfGroup(group);
    const memberAdmins = await Promise.all(
      admins.map((a) => this.userGroupsService.canManageMembers(a, groupId)),
    );
    admins = admins.filter(
      (admin, index) => memberAdmins[index] && admin.id !== currentUser.id,
    );
    if (admins.length) {
      await this.mailsService.createBufferedJsonMail(
        'message.twig',
        {
          text: `<p><b>${userName}</b> était inscrit à la liste d'attente.</p><p><b>${currentUserName}</b> a accepté sa demande.</p>`,
          groupName,
          groupId,
        },
        `${groupName} La demande d'adhésion de ${userName} a été acceptée par ${currentUserName}.`,
        admins,
        currentUser,
      );
    }

    return userGroup;
  }

  @ResolveField(() => Date)
  date(@Parent() parent: WaitingList & Pick<WaitingListEntity, 'raw_date'>) {
    return zonedTimeToUtc(parent.raw_date, TZ_PARIS);
  }

  /**
   * HELPERS
   */
  private async waitingListExistsAndUserIsAllowed(
    currentUser: UserEntity,
    userId: number,
    groupId: number,
  ): Promise<{
    user: UserEntity;
    group: GroupEntity;
    waitingList: WaitingListEntity;
  }> {
    const hasRight = await this.userGroupsService.canManageMembers(
      currentUser,
      groupId,
    );
    if (!hasRight)
      throw new ForbiddenException(
        `Current user ${currentUser.id} cannot access membership in group ${groupId}.`,
      );

    const user = await this.usersService.findOne(userId);
    if (!user) throw new ForbiddenException('This user does not exists');
    const group = await this.groupsService.findOne(groupId);
    if (!group) throw new ForbiddenException('This group does not exists');

    const waitingList = await this.waitinglistsService.findOne(userId, groupId);
    if (!waitingList)
      throw new ForbiddenException(
        `The user ${userId} is not in waiting list of group ${groupId}. Current user: ${currentUser.id}.`,
      );

    return { user, group, waitingList };
  }
}
