import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { utcToZonedTime } from 'date-fns-tz';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { TZ_PARIS } from '../../common/constants';
import { WaitingListEntity } from '../../entities/waiting-list.entity';
import { UserEntity } from '../../users/models/user.entity';
import { GroupEntity } from '../entities/group.entity';

@Injectable()
export class WaitingListsService {
  constructor(
    @InjectRepository(WaitingListEntity)
    private readonly waitingListsRepo: Repository<WaitingListEntity>,
  ) {}

  async findOne(userId: number, groupId: number): Promise<WaitingListEntity> {
    return this.waitingListsRepo.findOne({ userId, amapId: groupId });
  }

  async getNumberOfWaitingUsersInGroup(groupId: number): Promise<number> {
    return this.waitingListsRepo.count({ amapId: groupId });
  }

  async getWaitingListsOfGroup(groupId: number): Promise<WaitingListEntity[]> {
    return this.waitingListsRepo.find({
      where: { amapId: groupId },
      relations: ['user'],
    });
  }

  @Transactional()
  async create(
    user: UserEntity,
    group: GroupEntity,
    message: string,
  ): Promise<WaitingListEntity> {
    return this.waitingListsRepo.save({
      user,
      amap: group,
      message,
      raw_date: utcToZonedTime(new Date(), TZ_PARIS),
    });
  }

  @Transactional()
  async delete(waitingList: WaitingListEntity) {
    await this.waitingListsRepo.delete({
      amapId: waitingList.amapId,
      userId: waitingList.userId,
    });
    return waitingList;
  }
}
