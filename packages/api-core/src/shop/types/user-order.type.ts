import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserOrder {
  @Field(() => Int) id: number;

  @Field(() => Float) quantity: number;

  @Field(() => Float) productPrice: number;

  @Field(() => Int) productId: number;

  @Field(() => Int) userId: number;

  @Field(() => Int) distributionId: number;

  @Field(() => Int, { nullable: true }) subscriptionId?: number;
}
