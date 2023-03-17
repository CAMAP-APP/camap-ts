import { Field, Float, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { OperationType } from '../OperationType';
import {
  MembershipOperationTypeData,
  OperationDataUnion,
  OrderOperationTypeData,
  PaymentOperationTypeData,
  SubscriptionTotalOperationTypeData,
} from './operation-data.type';

registerEnumType(OperationType, { name: 'OperationType' });

@ObjectType('Operation')
export class Operation {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field()
  date: Date;

  @Field(() => Float)
  amount: number;

  @Field()
  pending: boolean;

  @Field(() => Int, { nullable: true })
  relationId?: number;

  @Field(() => OperationType)
  type: OperationType;

  @Field(() => OperationDataUnion, { nullable: true })
  data?:
    | PaymentOperationTypeData
    | OrderOperationTypeData
    | SubscriptionTotalOperationTypeData
    | MembershipOperationTypeData;
}
