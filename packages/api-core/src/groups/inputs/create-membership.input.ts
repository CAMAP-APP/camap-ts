import { InputType, Int, Float, Field, registerEnumType } from '@nestjs/graphql';
import { PaymentTypeId } from '../../payments/interfaces';

@InputType()
export class CreateMembershipInput {
  @Field(() => Int)
  userId: number;

  @Field(() => Int)
  groupId: number;

  @Field(() => Int, { nullable: true })
  year: number;

  @Field()
  date: Date;

  @Field(() => PaymentTypeId, { nullable: true })
  paymentType: PaymentTypeId;

  @Field(() => Int, { nullable: true })
  distributionId: number;

  @Field(() => Float, { nullable: true })
  membershipFee: number;
}
