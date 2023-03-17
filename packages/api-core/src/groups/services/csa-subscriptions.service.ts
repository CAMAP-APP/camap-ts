import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { computeUserOrdersAmount } from 'camap-common';
import { DeepPartial, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { OperationEntity } from '../../payments/entities/operation.entity';
import { OperationType } from '../../payments/OperationType';
import { OperationsService } from '../../payments/services/operations.service';
import { PaymentsService } from '../../payments/services/payments.service';
import { UserOrderEntity } from '../../shop/entities/user-order.entity';
import { CsaSubscriptionEntity } from '../entities/csa-subscription.entity';
import { UserGroupEntity } from '../entities/user-group.entity';

@Injectable()
export class CsaSubscriptionsService {
  constructor(
    @InjectRepository(CsaSubscriptionEntity)
    private readonly subscriptionsRepo: Repository<CsaSubscriptionEntity>,
    private readonly operationsService: OperationsService,
    @InjectRepository(OperationEntity)
    private readonly operationRepo: Repository<OperationEntity>,
    @InjectRepository(UserOrderEntity)
    private readonly ordersRepo: Repository<UserOrderEntity>,
    private readonly paymentService: PaymentsService,
  ) {}

  async findOneById(id: number) {
    return this.subscriptionsRepo.findOne(id);
  }

  findByCatalogId(catalogId: number) {
    return this.subscriptionsRepo.find({
      where: {
        catalogId,
      },
    });
  }

  findByUserId(userId: number) {
    return this.subscriptionsRepo.find({ userId });
  }

  findByCatalogIdInRange(catalogId: number, { from, to }: { from: Date; to: Date }) {
    return this.subscriptionsRepo.find({
      where: {
        catalogId,
        startDate: LessThanOrEqual(to),
        endDate: MoreThanOrEqual(from),
      },
    });
  }

  findOneByCatalogAndUserInDate(
    catalogId: number,
    userId: number,
    startDate: Date,
    endDate: Date,
  ) {
    return this.subscriptionsRepo.findOne({
      where: {
        userId,
        catalogId,
        startDate: LessThanOrEqual(startDate),
        endDate: MoreThanOrEqual(endDate),
      },
    });
  }

  async getActives(groupId: number, activeContractsId: number[]) {
    return this.subscriptionsRepo
      .createQueryBuilder('s')
      .select('s.*')
      .addFrom(UserGroupEntity, 'ug')
      .where(
        `(s.userId = ug.userId OR s.userId2 = ug.userId) 
      AND ug.groupId = ${groupId}
      AND s.catalogId IN (${activeContractsId.length > 0 ? activeContractsId : null})
      AND s.endDate > NOW()
      AND s.startDate < NOW()`,
      )
      .getRawMany<CsaSubscriptionEntity>();
  }

  @Transactional()
  async update(
    idOrIds: number | number[],
    partial: DeepPartial<CsaSubscriptionEntity>,
  ) {
    return this.subscriptionsRepo.update(idOrIds, partial);
  }

  async isPaid(subscription: CsaSubscriptionEntity): Promise<boolean> {
    return (await this.getBalance(subscription)) >= 0;
  }

  /**
    Get subscription balance
  **/
  async getBalance(subscription: CsaSubscriptionEntity): Promise<number> {
    return (
      (await this.getPaymentsTotal(subscription)) -
      (await this.getTotalPrice(subscription))
    );
  }

  /**
    Get total of payment operations linked to this subscription
  **/
  async getPaymentsTotal(subscription: CsaSubscriptionEntity): Promise<number> {
    const operations = await this.operationsService.findBySubscriptionId(
      subscription.id,
    );
    const paymentOperations = operations.filter(
      (o) => o.type === OperationType.Payment,
    );
    return paymentOperations.reduce((acc, o) => (acc += o.amount), 0);
  }

  /**
    Get total cost of subscription orders
  **/
  async getTotalPrice(subscription: CsaSubscriptionEntity): Promise<number> {
    const orders = await this.findUserOrdersBySubscription(subscription.id);
    return computeUserOrdersAmount(orders);
  }

  async findSubscriptionTotalOperation(userId: number, subscriptionId: number) {
    return this.operationRepo.findOne({
      userId,
      subscriptionId,
      type: OperationType.SubscriptionTotal,
    });
  }

  @Transactional()
  async createOrUpdateTotalOperation(
    subscription: CsaSubscriptionEntity,
  ): Promise<OperationEntity> {
    const totalOperation = await this.findSubscriptionTotalOperation(
      subscription.userId,
      subscription.id,
    );

    const now = new Date();
    const currentTotalPrice = await this.getTotalPrice(subscription);

    if (!totalOperation) {
      totalOperation.subscription = subscription;
      totalOperation.pending = false;

      const catalog = await subscription.catalog;
      await this.operationRepo.save({
        userId: subscription.userId,
        groupId: catalog.groupId,
        name: 'Total Commandes',
        amount: -currentTotalPrice,
        date: now,
        pending: false,
        type: OperationType.SubscriptionTotal,
        subscriptionId: subscription.id,
      });
    } else {
      await this.operationRepo.update(totalOperation.id, {
        amount: -currentTotalPrice,
        date: now,
      });
    }

    await this.paymentService.updateUserBalance(
      totalOperation.userId,
      totalOperation.groupId,
    );

    return totalOperation;
  }

  async findUserOrdersBySubscription(subscriptionId: number) {
    return this.ordersRepo.find({ subscriptionId });
  }
}
