import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MembershipAvailableYears {
  @Field() name: string;

  @Field(() => Int) id: number;
}
