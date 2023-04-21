import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';


@ObjectType()
export class MultiDistrib {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  placeId: number;

  @Field(() => Int)
  groupId: number;

  @Field(() => Date)
  distribStartDate: Date;

  @Field(() => Date)
  distribEndDate: Date;

  @Field(() => Date)
  orderEndDate: Date;

  @Field(() => Int, { nullable: true })
  distributionCycleId?: number;
}
