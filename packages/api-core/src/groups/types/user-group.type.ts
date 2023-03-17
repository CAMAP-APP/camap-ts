import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('UserGroup')
export class UserGroup {
  @Field(() => Int)
  groupId: number;

  @Field(() => Int)
  userId: number;

  @Field(() => Float)
  balance: number;
}
