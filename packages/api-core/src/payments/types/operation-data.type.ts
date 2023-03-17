import { createUnionType, Field, Int, ObjectType } from '@nestjs/graphql';
import { PaymentTypeId } from '../interfaces';

@ObjectType()
export class PaymentOperationTypeData {
  @Field(() => PaymentTypeId)
  type: PaymentTypeId;

  @Field({ nullable: true })
  remoteOpId?: string;
}

@ObjectType()
export class OrderOperationTypeData {
  @Field(() => Int)
  basketId: number;
}

@ObjectType()
export class SubscriptionTotalOperationTypeData {
  @Field(() => Int)
  subscriptionId: number;
}

@ObjectType()
export class MembershipOperationTypeData {
  @Field(() => Int)
  year: number;
}

export const OperationDataUnion = createUnionType({
  name: 'OperationDataUnion',
  types: () => [
    PaymentOperationTypeData,
    OrderOperationTypeData,
    SubscriptionTotalOperationTypeData,
    MembershipOperationTypeData,
  ],
  resolveType(value) {
    if ('type' in value) {
      return PaymentOperationTypeData;
    }
    if ('basketId' in value) {
      return OrderOperationTypeData;
    }
    if ('subscriptionId' in value) {
      return SubscriptionTotalOperationTypeData;
    }
    if ('year' in value) {
      return MembershipOperationTypeData;
    }
    return null;
  },
});
