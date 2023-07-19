import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { roundPrice } from 'camap-common';
import { DeepPartial, In, Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { checkDeleted } from '../../common/utils';
import { GroupEntity } from '../../groups/entities/group.entity';
import { GroupsService } from '../../groups/services/groups.service';
import { UserGroupsService } from '../../groups/services/user-groups.service';
import { CsaSubscriptionsService } from '../../groups/services/csa-subscriptions.service';
import {
  OperationData,
  OperationEntity,
  PaymentOperationTypeData,
} from '../entities/operation.entity';
import {
  cashPaymentType,
  checkPaymentType,
  moneyPotPaymentType,
  onTheSpotCardTerminalPaymentType,
  onTheSpotPaymentType,
  PaymentContext,
  PaymentType,
  PaymentTypeId,
  transferPaymentType,
} from '../interfaces';
import { OperationType } from '../OperationType';
import { CsaSubscriptionEntity } from '../../groups/entities/csa-subscription.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(OperationEntity)
    private readonly operationRepo: Repository<OperationEntity>,
    @Inject(forwardRef(() => UserGroupsService))
    private readonly userGroupsService: UserGroupsService,
    @Inject(forwardRef(() => GroupsService))
    private readonly groupsService: GroupsService,
    @Inject(forwardRef(() => CsaSubscriptionsService))
    private readonly csasubscriptionsService: CsaSubscriptionsService,
    @InjectRepository(CsaSubscriptionEntity)
    private readonly subscriptionRepo: Repository<CsaSubscriptionEntity>,
  ) { }

  async findOneById(id: number, lock = false) {
    return this.operationRepo.findOne(id, {
      ...(lock ? { lock: { mode: 'pessimistic_write' } } : {}),
    });
  }

  async findPartialByUserId(
    userId: number,
  ): Promise<Pick<OperationEntity, 'id' | 'amount'>[]> {
    return this.operationRepo
      .createQueryBuilder('o')
      .select('o.id, o.amount, o.userId')
      .where(`o.userId = ${userId}`)
      .getRawMany();
  }

  /**
   *  Retuns an array of payment types depending on the use case
   */
  async getPaymentTypes(
    context: PaymentContext,
    groupIdOrEntity?: number | GroupEntity | undefined,
  ): Promise<PaymentType[]> {
    let group: GroupEntity;
    if (groupIdOrEntity) {
      if (typeof groupIdOrEntity === 'number') {
        group = await this.groupsService.findOne(groupIdOrEntity);
      } else {
        group = groupIdOrEntity;
      }
    }

    switch (context) {
      // every payment type
      case PaymentContext.PCAll: {
        const res: PaymentType[] = [
          cashPaymentType,
          checkPaymentType,
          transferPaymentType,
          moneyPotPaymentType,
          onTheSpotPaymentType,
          onTheSpotCardTerminalPaymentType,
        ];
        return res;
      }
      // when selecting wich payment types to enable
      case PaymentContext.PCGroupAdmin: {
        const allPaymentTypes = await this.getPaymentTypes(
          PaymentContext.PCAll,
          group,
        );
        // Exclude On the spot payment
        return allPaymentTypes.filter((pt) => pt.id !== 'onthespot');
      }
      // For the payment page
      case PaymentContext.PCPayment: {
        if (!group || !group.allowedPaymentsType) return [];
        const payments = await this.getPaymentTypes(PaymentContext.PCAll, group);
        // ontheSpot payment type replaces checks or cash
        let hasOnTheSpotPaymentTypes = false;
        const res = [];
        group.allowedPaymentsType.forEach((paymentTypeId) => {
          const found = payments.find((p) => p.id === paymentTypeId);
          if (found) {
            if (found.onTheSpot) {
              hasOnTheSpotPaymentTypes = true;
            } else {
              res.push(found);
            }
          }
        });
        if (hasOnTheSpotPaymentTypes) {
          res.push(onTheSpotPaymentType);
        }
        return res;
      }
      // For when a coordinator does a manual refund or adds manually a payment
      case PaymentContext.PCManualEntry: {
        // Exclude the MoneyPot payment
        const toExcludeTypes: PaymentTypeId[] = [moneyPotPaymentType.id];
        const groupAdminPaymentTypes = await this.getPaymentTypes(
          PaymentContext.PCGroupAdmin,
          group,
        );
        return groupAdminPaymentTypes.filter((p) => !toExcludeTypes.includes(p.id));
      }
      default:
        return [];
    }
  }

  // Get payment types wich are "on the spot"
  async getOnTheSpotPaymentTypes(): Promise<PaymentTypeId[]> {
    return (await this.getPaymentTypes(PaymentContext.PCAll))
      .filter((p) => p.onTheSpot)
      .map((p) => p.id);
  }

  /**
   * Returns all the payment types that are on the spot and that are allowed for this group
   */
  async getOnTheSpotAllowedPaymentTypes(groupId: number): Promise<PaymentTypeId[]> {
    const group = await this.groupsService.findOne(groupId);
    const onTheSpotPaymentTypes = await this.getOnTheSpotPaymentTypes();
    return onTheSpotPaymentTypes.filter((paymentType) =>
      group.allowedPaymentsType.includes(paymentType),
    );
  }

  /**
   * Record a new non-payment operation
   */
  @Transactional()
  async makeNonPaymentOperation(
    userId: number,
    groupId: number,
    type: OperationType,
    amount: number,
    name: string,
    date: Date,
    pending: boolean,
    data?: OperationData,
    subscriptionId?: number,
  ): Promise<OperationEntity> {
    return this.operationRepo.save({
      userId,
      groupId,
      name,
      amount,
      date,
      pending,
      type,
      data,
      subscriptionId,
    });
  }

  /**
   * Record a new payment operation
   */
  @Transactional()
  async makePaymentOperation({
    userId,
    groupId,
    type,
    amount,
    name,
    date = new Date(),
    pending = true,
    relation,
    remoteOpId,
  }: {
    userId: number;
    groupId: number;
    type: PaymentTypeId;
    amount: number;
    name: string;
    date?: Date;
    pending?: boolean;
    relation?: OperationEntity;
    remoteOpId?: string;
  }): Promise<OperationEntity> {
    if (!!relation) {
      const relatedPaymentOperations = await this.getRelatedPayments(relation);

      let relatedPaymentOperationToUpdate: OperationEntity;
      if (type === 'onthespot') {
        // If we already had an unpaid onTheSpot payment, let's reuse it.
        const onTheSpotPaymentTypes = await this.getOnTheSpotPaymentTypes();
        relatedPaymentOperationToUpdate = relatedPaymentOperations.find((o) => {
          const data = o.data as PaymentOperationTypeData;
          return (
            o.pending &&
            (data.type === PaymentTypeId.onthespot ||
              onTheSpotPaymentTypes.includes(data.type))
          );
        });
      }
      if (type === 'transfer') {
        // If we already had an unpaid transfer payment, let's reuse it.
        relatedPaymentOperationToUpdate = relatedPaymentOperations.find((o) => {
          const data = o.data as PaymentOperationTypeData;
          return o.pending && data.type === PaymentTypeId.transfer;
        });
      }

      if (relatedPaymentOperationToUpdate) {
        const newAmount = roundPrice(
          relatedPaymentOperationToUpdate.amount + amount,
        );
        await this.operationRepo.update(relatedPaymentOperationToUpdate.id, {
          amount: newAmount,
        });
        await this.updateUserBalance(userId, groupId);
        return {
          ...relatedPaymentOperationToUpdate,
          amount: newAmount,
        } as OperationEntity;
      }
    }

    let adaptedType = type;
    if (type === 'onthespot') {
      const onTheSpotAllowedPaymentTypes =
        await this.getOnTheSpotAllowedPaymentTypes(groupId);
      if (onTheSpotAllowedPaymentTypes.length === 1) {
        // There is only one on the spot payment type so we can directly set it here
        adaptedType = onTheSpotAllowedPaymentTypes[0];
      }
    }
    const data: PaymentOperationTypeData = { type: adaptedType };
    if (remoteOpId) data.remoteOpId = remoteOpId;

    const operationInput = this.operationRepo.create({
      userId,
      groupId,
      name,
      amount,
      date,
      pending,
      type: OperationType.Payment,
      raw_data: JSON.stringify(data),
    });
    if (relation) operationInput.relation = relation;

    const operation = await this.operationRepo.save(operationInput);

    await this.updateUserBalance(userId, groupId);

    return operation;
  }

  /**
   * update user balance
   */
  @Transactional()
  async updateUserBalance(userId: number, groupId: number) {
    const subs: CsaSubscriptionEntity = this.subscriptionRepo.findByUSerId(userId);
    const result: { balance: number } = await this.operationRepo
      .createQueryBuilder('operation')
      .select('SUM(amount) as balance')
      .addFrom(subs, 'sub')
      .where(
        'operation.userId = :userId AND operation.groupId = :groupId AND operation.subscriptionId = sub.id AND YEAR(sub.startDate) > 2022',
        {
          userId,
          groupId,
        },
      )
      .getRawOne();
    const balance = Math.round(result.balance * 100) / 100;
    return this.userGroupsService.update(userId, groupId, { balance });
  }

  /**
   * get payments linked to an order operation
   */
  async getRelatedPayments(
    operation: OperationEntity,
    lock = false,
  ): Promise<OperationEntity[]> {
    return this.operationRepo.find({
      where: {
        relationId: operation.id,
        type: OperationType.Payment,
      },
      ...(lock ? { lock: { mode: 'pessimistic_write' } } : {}),
    });
  }

  async getRelatedPaymentsFromManyOperations(
    operationIds: number[],
  ): Promise<OperationEntity[]> {
    return this.operationRepo.find({
      where: {
        relationId: In(operationIds),
        type: OperationType.Payment,
      },
    });
  }

  @Transactional()
  async deleteOperation(
    operation: Pick<OperationEntity, 'id'>,
  ): Promise<number | null> {
    const result = await this.operationRepo.delete(operation);
    return checkDeleted(result) ? operation.id : null;
  }

  @Transactional()
  async updateOperation(operation: DeepPartial<OperationEntity>) {
    return this.operationRepo.save(operation);
  }

  @Transactional()
  async updateOperations(
    ids: number[],
    partialOperation: DeepPartial<OperationEntity>,
  ) {
    return this.operationRepo.update(ids, partialOperation);
  }

  /**
   * Update a payment operation
   */
  @Transactional()
  async updatePaymentOperation(
    userId: number,
    groupId: number,
    operation: OperationEntity,
    amount: number,
  ): Promise<OperationEntity> {
    operation.amount += Math.abs(amount);
    const updatedOperation = await this.updateOperation(operation);
    this.updateUserBalance(userId, groupId);
    return updatedOperation;
  }

  @Transactional()
  async validatePayment(
    operation: OperationEntity,
    {
      onthespotType,
      skipUpdateBalance = false,
    }: { onthespotType?: PaymentTypeId; skipUpdateBalance?: boolean } = {},
  ) {
    operation.pending = false;
    if (onthespotType) {
      operation.data = { type: onthespotType } as PaymentOperationTypeData;
    }
    operation = await this.updateOperation(operation);

    if (!skipUpdateBalance) {
      await this.updateUserBalance(operation.userId, operation.groupId);
    }

    return operation;
  }
}
