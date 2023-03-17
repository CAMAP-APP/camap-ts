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
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Loader } from '../common/decorators/dataloder.decorator';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { GroupEntity } from '../groups/entities/group.entity';
import { GroupsLoader } from '../groups/loaders/groups.loader';
import { GroupsService } from '../groups/services/groups.service';
import { UserGroupsService } from '../groups/services/user-groups.service';
import { Group } from '../groups/types/group.type';
import { MailsService } from '../mails/mails.service';
import { UserEntity } from '../users/models/user.entity';
import { User } from '../users/types/user.type';
import { UsersService } from '../users/users.service';
import { CreateMessageInput } from './dto/create-message.input';
import { MessagesService } from './messages.service';
import { AttachmentUnion, Message } from './models/message.type';
import DataLoader = require('dataloader');

@UseGuards(GqlAuthGuard)
@Resolver(() => Message)
export class MessagesResolver {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly userService: UsersService,
    private readonly userGroupService: UserGroupsService,
    private readonly mailsService: MailsService,
    private readonly groupsService: GroupsService,
  ) {}

  @Query(() => [Message])
  async getMessagesForGroup(
    @Args({ name: 'groupId', type: () => Int }) groupId: number,
    @CurrentUser() currentUser: UserEntity,
  ) {
    await this.userIsAllowedToAccessMessages(currentUser, groupId);
    return this.messagesService.getMessagesForGroup(groupId);
  }

  @Query(() => [Message])
  async getUserMessagesForGroup(
    @Args({ name: 'groupId', type: () => Int }) groupId: number,
    @CurrentUser() currentUser: UserEntity,
  ) {
    await this.userIsAllowedToAccessMessages(currentUser, groupId);
    return this.messagesService.getUserMessagesForGroup(groupId, currentUser.id);
  }

  @Query(() => Message, { name: 'message' })
  async getMessage(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() currentUser: UserEntity,
  ): Promise<Message> {
    const message = await this.messagesService.findOneById(id);

    await this.userIsAllowedToAccessMessages(currentUser, message.amapId);

    if (!message) throw new NotFoundException('Message not found');

    let recipients: string[];
    try {
      recipients = JSON.parse(message.recipients);
    } catch (e) {
      throw e;
    }

    return {
      ...message,
      attachments: message.attachments as any, // trick for attachments ResolveField
      recipients,
    };
  }

  @Query(() => [Message])
  async getLatestMessages(@CurrentUser() currentUser: UserEntity) {
    const messages = await this.messagesService.getUserMessages(currentUser.id);

    const fixedMessages: Message[] = [];

    messages.forEach((message) => {
      let recipients: string[];
      try {
        recipients = JSON.parse(message.recipients);
      } catch (e) {
        throw e;
      }

      fixedMessages.push({
        ...message,
        attachments: (message.attachments as any) || [],
        recipients,
      });
    });

    return fixedMessages;
  }

  @ResolveField(() => User)
  async sender(@Parent() parent: Message) {
    return this.userService.findOne(parent.senderId);
  }

  @ResolveField(() => [AttachmentUnion])
  async attachments(@Parent() parent: Message) {
    if (!parent.attachments) return [];
    return parent.attachments.map((a) => {
      if (typeof a === 'string') return { fileName: a };
      return a;
    });
  }

  @ResolveField(() => Group, { nullable: true })
  async group(
    @Parent() parent: Message,
    @Loader(GroupsLoader) groupsLoader: DataLoader<number, GroupEntity>,
  ) {
    if (!parent.amapId) return null;
    return groupsLoader.load(parent.amapId);
  }

  @Transactional()
  @Mutation(() => Message)
  async createMessage(
    @Args({ name: 'input', type: () => CreateMessageInput })
    {
      title,
      htmlBody,
      senderName,
      senderEmail,
      recipients,
      group,
      list,
      attachments,
      slateContent,
    }: CreateMessageInput,
    @CurrentUser() currentUser: UserEntity,
  ) {
    const mail = await this.mailsService.createBufferedJsonMail(
      'message.twig',
      {
        text: htmlBody,
        quitGroupLink: this.mailsService.getQuitGroupLink(group.id),
        groupName: group.name,
        groupId: group.id,
        list: list?.name,
      },
      title,
      recipients,
      {
        firstName: senderName,
        lastName: '',
        email: senderEmail,
        id: currentUser.id,
      },
      true,
      attachments,
    );

    const messageAttachments = attachments.map((a) => {
      if (a.cid) {
        return { cid: a.cid, content: a.content };
      }
      return a.filename;
    });

    return this.messagesService.create({
      title,
      body: mail.htmlBody,
      senderId: currentUser.id,
      recipients: JSON.stringify(recipients.map((r) => r.email) as [string]),
      amapId: group.id,
      date: mail.cdate,
      recipientListId: list.type,
      raw_attachments: JSON.stringify(messageAttachments),
      slateContent,
    });
  }

  /**
   * HELPERS
   */
  private async userIsAllowedToAccessMessages(
    currentUser: UserEntity,
    groupId: number,
  ) {
    const hasRight = await this.userGroupService.canManageMessages(
      currentUser,
      groupId,
    );
    if (!hasRight)
      throw new ForbiddenException(
        `Current user cannot access messages in group ${groupId}.`,
      );
  }
}
