import { Field, Int, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/types/user.type';

@ObjectType()
export class WaitingList {
  @Field(() => Int)
  amapId: number;

  @Field(() => Int)
  userId: number;

  @Field(() => Date)
  date: Date;

  @Field()
  message: string;

  @Field(() => User)
  user: User;
}
