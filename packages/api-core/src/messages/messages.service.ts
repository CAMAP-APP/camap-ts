/* eslint-disable no-restricted-syntax */
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { subMonths } from 'date-fns';
import { DeepPartial, IsNull, LessThan, Not, Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { MessageEntity } from '../entities/message.entity';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger('MessageService');

  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepo: Repository<MessageEntity>,
  ) {}

  async findOneById(id: number) {
    return this.messageRepo.findOne(id);
  }

  async create(message: DeepPartial<MessageEntity>) {
    return this.messageRepo.save(message);
  }

  async deleteMessageOlderThanDate(date: Date) {
    return this.messageRepo.delete({ date: LessThan(date) });
  }

  /**
   * Get first 20 messages in a group
   */
  async getMessagesForGroup(groupId: number): Promise<MessageEntity[]> {
    return this.messageRepo.find({
      where: {
        amapId: groupId,
      },
      order: { date: 'DESC' },
      take: 20,
    });
  }

  /**
   * Get first 20 messages sent by a user in a group
   */
  async getUserMessagesForGroup(
    groupId: number,
    userId: number,
  ): Promise<MessageEntity[]> {
    return this.messageRepo.find({
      where: {
        amapId: groupId,
        senderId: userId,
      },
      order: { date: 'DESC' },
      take: 20,
    });
  }

  /**
   * Get first 20 messages sent by a user in any group
   */
  async getUserMessages(userId: number): Promise<MessageEntity[]> {
    return this.messageRepo.find({
      where: {
        senderId: userId,
        amapId: Not(IsNull()),
      },
      order: { date: 'DESC' },
      take: 20,
    });
  }

  /**
   * CRONS
   */
  @Transactional()
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanOldMessages() {
    const oldDate = subMonths(new Date(), 4);
    this.logger.log(`Delete messages older than ${oldDate.toJSON()}`);
    this.deleteMessageOlderThanDate(oldDate);
  }
}
