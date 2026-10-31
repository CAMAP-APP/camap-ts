import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async getUsersToRenew(group: GroupEntity): Promise<UserEntity[]> {
    if (!group.hasMembership) return [];

    const period = getMembershipPeriod(group);
    const query = this.userGroupsRepo
      .createQueryBuilder('ug')
      .innerJoinAndSelect('ug.user', 'user')
      .where('ug.groupId = :groupId', { groupId: group.id })
      .setParameters(period)
      .orderBy('user.lastName', 'ASC')
      .addOrderBy('user.firstName', 'ASC');

    // Distribution dates, rather than order creation dates, define the year.
    const orders = query
      .subQuery()
      .select('1')
      .from(UserOrderEntity, 'o')
      .innerJoin('o.distribution', 'd')
      .innerJoin('d.catalog', 'c')
      .where('c.groupId = :groupId')
      .andWhere('(o.userId = ug.userId OR o.userId2 = ug.userId)')
      .andWhere('o.quantity > 0')
      .andWhere('d.raw_date >= :from AND d.raw_date < :to')
      .getQuery();

    const subscriptions = query
      .subQuery()
      .select('1')
      .from(CsaSubscriptionEntity, 's')
      .innerJoin('s.catalog', 'catalog')
      .where('catalog.groupId = :groupId')
      .andWhere('(s.userId = ug.userId OR s.userId2 = ug.userId)')
      .andWhere('s.startDate < :to AND s.endDate > :from')
      .getQuery();
    const memberships = query
      .subQuery()
      .select('1')
      .from(MembershipEntity, 'm')
      .where('m.groupId = :groupId AND m.userId = ug.userId AND m.year = :year')
      .getQuery();

    query
      .andWhere(`(EXISTS ${orders} OR EXISTS ${subscriptions})`)
      .andWhere(`NOT EXISTS ${memberships}`);

    return (await query.getMany()).map((ug) => ug.user);
  }
}
