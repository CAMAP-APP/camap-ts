import { Field, Float, ObjectType } from '@nestjs/graphql';
import { MultiDistrib } from '../../shop/types/multi-distrib.type';
import { MembershipAvailableYears } from './membershipAvailableYears.type';

@ObjectType()
export class MembershipFormData {
  @Field(() => [MembershipAvailableYears])
  availableYears: MembershipAvailableYears[];

  @Field(() => Float, { nullable: true }) membershipFee: number;

  @Field(() => [MultiDistrib]) distributions: MultiDistrib[];
}
