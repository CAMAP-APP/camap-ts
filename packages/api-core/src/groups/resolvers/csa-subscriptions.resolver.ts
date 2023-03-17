import { InternalServerErrorException } from '@nestjs/common';
import { Float, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { OperationEntity } from '../../payments/entities/operation.entity';
import { OperationsService } from '../../payments/services/operations.service';
import { CsaSubscriptionType } from '../types/csa-subscription.type';
import { User } from '../../users/types/user.type';
import { UsersService } from '../../users/users.service';

@Resolver(() => CsaSubscriptionType)
export class CsaSubscriptionsResolver {
  constructor(
    private readonly operationsService: OperationsService,
    private readonly usersService: UsersService,
  ) {}

  @ResolveField(() => Float)
  async balance(
    @Parent()
    subscription: CsaSubscriptionType & { operations?: Promise<OperationEntity[]> },
  ) {
    let operations: OperationEntity[];
    if (subscription.operations) {
      operations = await subscription.operations;
    } else {
      operations = await this.operationsService.findBySubscriptionId(
        subscription.id,
      );
    }

    if (!operations) {
      throw new InternalServerErrorException();
    }

    return operations.reduce((acc, ope) => acc + ope.amount, 0);
  }

  @ResolveField(() => User)
  async user(
    @Parent()
    subscription: any,
  ) {
    if (subscription.user) {
      let user = await subscription.user;
      if (user) {
        return user;
      }
    }
    return this.usersService.findOne(subscription.userId);
  }

  @ResolveField(() => User, { nullable: true })
  async user2(
    @Parent()
    subscription: any,
  ) {
    if (subscription.user2) {
      let user = await subscription.user2;
      if (user) {
        return user;
      }
    }
    if (!subscription.userId2) {
      return null;
    }
    return this.usersService.findOne(subscription.userId2);
  }
}
