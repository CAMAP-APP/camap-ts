import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { MultiDistribValidatedStatus } from '../entities/multi-distrib.entity';

registerEnumType(MultiDistribValidatedStatus, {
  name: 'MultiDistribValidatedStatus',
});

@ObjectType()
export class MultiDistrib {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  placeId: number;

  @Field(() => Int)
  groupId: number;

  @Field(() => MultiDistribValidatedStatus)
  validatedStatus: MultiDistribValidatedStatus;

  @Field(() => Date)
  distribStartDate: Date;

  @Field(() => Date)
  distribEndDate: Date;

  @Field(() => Date)
  orderEndDate: Date;

  @Field(() => Boolean, { nullable: true })
  validated?: boolean;

  @Field(() => Int, { nullable: true })
  distributionCycleId?: number;
}
