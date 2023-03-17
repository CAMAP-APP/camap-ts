import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class File {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field()
  data: string;

  @Field({ nullable: true })
  cDate?: Date;
}
