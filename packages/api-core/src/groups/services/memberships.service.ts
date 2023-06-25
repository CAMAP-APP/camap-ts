import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { checkDeleted } from '../../common/utils';
import { PaymentTypeId } from '../../payments/interfaces';
import { OperationType } from '../../payments/OperationType';
import { PaymentsService } from '../../payments/services/payments.service';
import { MultiDistribEntity } from '../../shop/entities/multi-distrib.entity';
import { UserEntity } from '../../users/models/user.entity';
import { GroupEntity } from '../entities/group.entity';
import { MembershipEntity } from '../entities/membership.entity';
import { UserGroupEntity } from '../entities/user-group.entity';
import { GroupsService } from './groups.service';
import { UserGroupsService } from './user-groups.service';

@Injectable()
export class MembershipsService {
  /**
   * inject membership entity
   * */

  constructor(
    @InjectRepository(MembershipEntity)
    private readonly membershipRepo: Repository<MembershipEntity>,
    @Inject(forwardRef(() => GroupsService))
    private readonly groupsService: GroupsService,
    @Inject(forwardRef(() => PaymentsService))
    private readonly paymentsService: PaymentsService,
    @Inject(forwardRef(() => UserGroupsService))
    private readonly userGroupsService: UserGroupsService,
  ) {}

  /**
   * Get user Memberships for a group
   */
  async getUserMemberships(
    userId: number,
    groupId: number,
  ): Promise<MembershipEntity[]> {
    return this.membershipRepo.find({
      where: {
        userId,
        groupId,
      },
      order: { date: 'DESC' },
    });
  }

  /**
   * Get user membership for a group and a year
   */
  async getUserMembership(
    userId: number,
    groupId: number,
    year: number,
    lock = false,
  ) {
    return this.membershipRepo.findOne({
      where: {
        userId,
        groupId,
        year,
      },
      ...(lock ? { lock: { mode: 'pessimistic_write' } } : {}),
    });
  }

  /**
   * Get membership from this year or the one before for one user
   */
  async getActiveMembershipsForUser(userId: number) {
    const year = new Date().getFullYear();

    return this.membershipRepo.findOne({
      select: ['userId'],
      where: [
        { userId, year },
        { userId, year: year - 1 },
      ],
    });
  }

  /**
   * Get all memberships of user
   */
  async findByUserId(userId: number) {
    return this.membershipRepo.find({ userId });
  }

  @Transactional()
  async createMembership(
    user: UserEntity,
    group: GroupEntity,
    date: Date,
    year: number,
    membershipFee?: number,
    distribution?: MultiDistribEntity,
  ): Promise<MembershipEntity> {
    let fee = membershipFee;
    if (!fee) {
      if (!group.membershipFee) {
        throw new InternalServerErrorException('You should define a membership fee');
      } else {
        fee = group.membershipFee;
      }
    }

    let usedPaymentType = PaymentTypeId.cash;

    const periodName = this.getPeriodNameFromYear(group, year);
    // debt operation
    const membershipOperation = await this.paymentsService.makeNonPaymentOperation(
      user.id,
      group.id,
      OperationType.Membership,
      0 - fee,
      `Adhésion ${periodName}`,
      date,
      false,
      { year },
    );

    // payment operation
    await this.paymentsService.makePaymentOperation({
      userId: user.id,
      groupId: group.id,
      type: usedPaymentType,
      amount: fee,
      name: `Paiement adhésion ${periodName}`,
      date,
      pending: false,
      relation: membershipOperation,
    });

    const cotis = this.membershipRepo.create({
      groupId: group.id,
      userId: user.id,
      year,
      date,
      distributionId: !distribution ? null : distribution.id,
      amount: fee,
      operationId: membershipOperation.id,
    });

    return this.membershipRepo.save(cotis);
  }

  @Transactional()
  async deleteMembership(userId: number, groupId: number, year: number) {
    const membership = await this.getUserMembership(userId, groupId, year, true);
    if (!membership) return null;

    if (membership.operationId !== null) {
      const op = await this.paymentsService.findOneById(
        membership.operationId,
        true,
      );
      const relatedPayments = await this.paymentsService.getRelatedPayments(
        op,
        true,
      );
      await Promise.all(
        relatedPayments.map((p) => {
          return this.paymentsService.deleteOperation(p);
        }),
      );

      await this.paymentsService.deleteOperation(op);
      await this.paymentsService.updateUserBalance(
        membership.userId,
        membership.groupId,
      );
    }
    const deleteResult = await this.membershipRepo.delete({
      groupId: membership.groupId,
      userId: membership.userId,
      year: membership.year,
    });

    return checkDeleted(deleteResult)
      ? {
          userId: membership.userId,
          groupId: membership.groupId,
          year: membership.year,
        }
      : null;
  }

  /**
   * Return if this user has a valid membership for the current period
   */
  async hasValidMembership(
    userOrId: UserEntity | number,
    group: GroupEntity,
  ): Promise<boolean> {
    if (!group.membershipRenewalDate) {
      return false;
    }
    const userId = typeof userOrId === 'number' ? userOrId : userOrId.id;
    const membership = await this.getUserMembership(
      userId,
      group.id,
      this.getMembershipYear(group),
    );
    return !!membership;
  }

  /**
   * Get period name from year
   */
  getPeriodNameFromYear(group: GroupEntity, year: number): string {
    if (
      group.membershipRenewalDate &&
      new Date(group.membershipRenewalDate).getMonth() <= 1
    ) {
      return String(year);
    }
    return `${String(year)}-${String(year + 1)}`;
  }

  /**
   * Donne l'année de cotisation à partir d'une date
   *
   * Si la date de renouvellement est en janvier ou février, on note la cotisation avec l'année en cours,
   * sinon c'est "à cheval" donc on note la cotis avec l'année la plus ancienne (ex:2014 pour une cotis 2014-2015)
   */
  public getMembershipYear(group: GroupEntity, ofYear?: Date): number {
    const currentDate = ofYear || new Date();
    const year = currentDate.getFullYear();
    const membershipRenewalDateString = group.membershipRenewalDate;
    let membershipRenewalDate: Date;
    if (!membershipRenewalDateString) membershipRenewalDate = new Date();
    else membershipRenewalDate = new Date(membershipRenewalDateString);
    const renewalDate = new Date(
      year,
      membershipRenewalDate.getMonth(),
      membershipRenewalDate.getDate(),
      0,
      0,
      0,
    );

    if (currentDate.getTime() < renewalDate.getTime()) {
      return year - 1;
    }
    return year;
  }

  findUserIdsWithMembership(
    group: GroupEntity,
  ): Promise<Pick<MembershipEntity, 'userId'>[]> {
    return this.membershipRepo
      .createQueryBuilder('m')
      .select('m.userId as userId')
      .addFrom(UserGroupEntity, 'ug')
      .where(
        `m.userId = ug.userId AND ug.groupId = m.groupId and m.groupId = ${
          group.id
        } and m.year = ${this.getMembershipYear(group)}`,
      )
      .getRawMany<Pick<MembershipEntity, 'userId'>>();
  }

  private async getUsersIdsWithMembership(
    group: GroupEntity,
  ): Promise<Pick<MembershipEntity, 'userId'>[]> {
    return this.findUserIdsWithMembership(group);
  }

  async getUsersWithNoMembership(group: GroupEntity) {
    const membersIdsWithMembership = await this.getUsersIdsWithMembership(group);
    const usersWithNoMembership = await this.userGroupsService.findAllUsersOfGroupId(
      group.id,
      membersIdsWithMembership.map((m) => m.userId),
    );
    return usersWithNoMembership;
  }

  async getUsersWithMembership(group: GroupEntity): Promise<UserEntity[]>;

  async getUsersWithMembership(
    group: GroupEntity,
    getCount: boolean,
  ): Promise<number>;

  async getUsersWithMembership(
    group: GroupEntity,
    getCount?: boolean,
  ): Promise<UserEntity[] | number> {
    const membersIdsWithMembership = await this.getUsersIdsWithMembership(group);

    if (getCount) return membersIdsWithMembership.length;

    return this.userGroupsService.findByIds(
      membersIdsWithMembership.map((m) => m.userId),
    );
  }

  @Transactional()
  async update(
    membershipId: Pick<MembershipEntity, 'groupId' | 'userId' | 'year'>,
    partial: DeepPartial<MembershipEntity>,
  ) {
    return this.membershipRepo.update(
      {
        groupId: membershipId.groupId,
        userId: membershipId.userId,
        year: membershipId.year,
      },
      partial,
    );
  }
}
