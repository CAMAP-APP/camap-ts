import { ForbiddenException, NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Int, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Loader } from '../../common/decorators/dataloder.decorator';
import { TransactionalMutation } from '../../common/decorators/transactional-mutation.decorator';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { UserGroupsService } from '../../groups/services/user-groups.service';
import { CryptoService } from '../../tools/crypto.service';
import { UserEntity } from '../../users/models/user.entity';
import { OperationEntity } from '../entities/operation.entity';
import { PaymentTypeId } from '../interfaces';
import { RelatedPaymentsLoader } from '../loaders/operations.loader';
import { PaymentsService } from '../services/payments.service';
import { OperationDataUnion } from '../types/operation-data.type';
import { Operation } from '../types/operation.type';
import DataLoader = require('dataloader');

@UseGuards(GqlAuthGuard)
@Resolver(() => Operation)
export class OperationResolver {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly userGroupsService: UserGroupsService,
    private readonly cryptoService: CryptoService,
  ) {}

  @TransactionalMutation(() => Operation)
  async validateOperation(
    @Args({ name: 'id', type: () => Int }) id: number,
    @CurrentUser() currentUser: UserEntity,
    @Args({ name: 'type', type: () => PaymentTypeId, nullable: true })
    type?: PaymentTypeId,
  ) {
    let operation = await this.checkAndGetOperation(id, currentUser);

    return this.paymentsService.validatePayment(operation, { onthespotType: type });
  }

  @TransactionalMutation(() => Int, { nullable: true })
  async deleteOperation(
    @Args({ name: 'id', type: () => Int }) id: number,
    @CurrentUser() currentUser: UserEntity,
  ) {
    const operation = await this.checkAndGetOperation(id, currentUser);

    const result = await this.paymentsService.deleteOperation({ id: operation.id });

    await this.paymentsService.updateUserBalance(
      operation.userId,
      operation.groupId,
    );

    return result;
  }

  @ResolveField(() => OperationDataUnion, { nullable: true })
  data(@Parent() parent: OperationEntity) {
    if (!parent.raw_data) return null;

    return JSON.parse(parent.raw_data);
  }

  @ResolveField(() => [Operation])
  relatedPayments(
    @Parent() parent: OperationEntity,
    @Loader(RelatedPaymentsLoader)
    relatedPaymentsLoader: DataLoader<Operation['id'], Operation[]>,
  ) {
    return relatedPaymentsLoader.load(parent.id);
  }

  /**
   * HELPERS
   */
  private async checkAndGetOperation(operationId: number, currentUser?: UserEntity) {
    let operation = await this.paymentsService.findOneById(operationId, true);
    const canManageAllCatalogs =
      !operation || (await this.checkRight(currentUser, operation.groupId));
    if (!canManageAllCatalogs) {
      throw new ForbiddenException(
        'You do not have the authorization to manage all catalogs of this group',
      );
    }
    if (!operation) {
      throw new NotFoundException();
    }

    return operation;
  }

  private async checkRight(user: UserEntity, groupId: number, doThrow = false) {
    const canManageAllCatalogs = await this.userGroupsService.canManageAllCatalogs(
      user,
      groupId,
    );
    if (!canManageAllCatalogs && doThrow) {
      throw new ForbiddenException(
        'You do not have the authorization to manage all catalogs of this group',
      );
    }

    return canManageAllCatalogs;
  }
}
