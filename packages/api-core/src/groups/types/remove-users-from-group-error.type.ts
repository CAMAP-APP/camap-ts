import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('RemoveUsersFromGroupError')
export class RemoveUsersFromGroupError {
  @Field(() => Int)
  userId: number;

  @Field()
  message: string;
}
