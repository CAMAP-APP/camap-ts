import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { User } from '../../users/types/user.type';
import { Group } from './group.type';

@ObjectType()
export class Membership {
  @Field() id: string;

  @Field(() => Int) userId: number;

  @Field(() => Int) groupId: number;

  @Field(() => User, { nullable: true }) user: User;

  @Field(() => Group, { nullable: true }) group: Group;

  @Field() date: Date;

  @Field(() => Float) amount: number;

  @Field(() => Int, { nullable: true }) distributionId: number;

  @Field(() => Int, { nullable: true }) operationId: number;

  @Field(() => Int) year: number;

  @Field() name: string; // Readable period name from getPeriodNameFromYear
}
