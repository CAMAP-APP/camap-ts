import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class BufferedJsonMail {
  @Field(() => Int)
  id: number;
}
