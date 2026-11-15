import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { throwIfAborted } from '../../common/throw-if-aborted';
import { UserOrderEntity } from '../../shop/entities/user-order.entity';
import { UserEntity } from '../../users/models/user.entity';
import { CsaSubscriptionEntity } from '../entities/csa-subscription.entity';
import { GroupEntity } from '../entities/group.entity';
import { MembershipEntity } from '../entities/membership.entity';
import { UserGroupEntity } from '../entities/user-group.entity';
import { getMembershipPeriod } from '../membership-period';

@Injectable()
export class MemberYearListsService {
  constructor(
    @InjectRepository(UserGroupEntity)
    private readonly userGroupsRepo: Repository<UserGroupEntity>,
  ) {}

  async getUsersToRenew(group: GroupEntity, count?: false): Promise<UserEntity[]>;
  async getUsersToRenew(
    group: GroupEntity,
    count: true,
    signal?: AbortSignal,
  ): Promise<number>;
  async getUsersToRenew(
    group: GroupEntity,
    count = false,
    signal?: AbortSignal,
  ): Promise<UserEntity[] | number> {
    throwIfAborted(signal);
    if (!group.hasMembership) return count ? 0 : [];

    const period = getMembershipPeriod(group);
    const parameters = { ...period, groupId: group.id };
    // Collect activity once, rather than scan the history for each group member.
    // Distribution dates define order activity within the membership year.
    const ordersQuery = this.userGroupsRepo.manager
      .createQueryBuilder(UserOrderEntity, 'o')
      .select('o.userId', 'userId')
      .addSelect('o.userId2', 'userId2')
      .distinct(true)
      .innerJoin('o.distribution', 'd')
      .innerJoin('d.catalog', 'c')
      .where('c.groupId = :groupId')
      .andWhere('o.quantity > 0')
      .andWhere('d.raw_date >= :from AND d.raw_date < :to')
      .setParameters(parameters);
    const subscriptionsQuery = this.userGroupsRepo.manager
      .createQueryBuilder(CsaSubscriptionEntity, 's')
      .select('s.userId', 'userId')
      .addSelect('s.userId2', 'userId2')
      .distinct(true)
      .innerJoin('s.catalog', 'catalog')
      .where('catalog.groupId = :groupId')
      .andWhere('s.startDate < :to AND s.endDate > :from')
      .setParameters(parameters);
    const [orders, subscriptions] = await Promise.all([
      ordersQuery.getRawMany<Pick<UserOrderEntity, 'userId' | 'userId2'>>(),
      subscriptionsQuery.getRawMany<
        Pick<CsaSubscriptionEntity, 'userId' | 'userId2'>
      >(),
    ]);
    // A disconnected client must not start the final membership query.
    // Queries already running in MySQL are allowed to finish.
    throwIfAborted(signal);
    const activeUserIds = new Set<number>();
    for (const { userId, userId2 } of [...orders, ...subscriptions]) {
      activeUserIds.add(userId);
      if (userId2 !== null) activeUserIds.add(userId2);
    }
    if (!activeUserIds.size) return count ? 0 : [];

    const query = this.userGroupsRepo
      .createQueryBuilder('ug')
      .where('ug.groupId = :groupId')
      .andWhere('ug.userId IN (:...activeUserIds)', {
        activeUserIds: [...activeUserIds],
      })
      .setParameters(parameters);
    const memberships = query
      .subQuery()
      .select('1')
      .from(MembershipEntity, 'm')
      .where('m.groupId = :groupId AND m.userId = ug.userId AND m.year = :year')
      .getQuery();

    query.andWhere(`NOT EXISTS ${memberships}`);

    if (count) return query.getCount();

    return (
      await query
        .innerJoinAndSelect('ug.user', 'user')
        .orderBy('user.lastName', 'ASC')
        .addOrderBy('user.firstName', 'ASC')
        .getMany()
    ).map((ug) => ug.user);
  }
}
