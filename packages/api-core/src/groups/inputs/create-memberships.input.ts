import { InputType, Int, Field, PickType } from '@nestjs/graphql';
import { CreateMembershipInput } from './create-membership.input';

@InputType()
export class CreateMembershipsInput extends PickType(CreateMembershipInput, [
  'date',
  'distributionId',
  'groupId',
  'membershipFee',
  'paymentType',
  'year',
]) {
  @Field(() => [Int])
  userIds: number[];
}
