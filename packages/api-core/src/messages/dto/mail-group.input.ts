import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class MailGroupInput {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;
}
