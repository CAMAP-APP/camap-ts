import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class VolunteerRole {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field(() => Int)
  groupId: number;

  @Field(() => Int, { nullable: true })
  catalogId?: number;
}
