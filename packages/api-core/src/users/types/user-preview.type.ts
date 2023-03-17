import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserPreview {
  @Field(() => Int)
  id: number;

  @Field()
  firstName: string;

  @Field()
  lastName: string;
}
