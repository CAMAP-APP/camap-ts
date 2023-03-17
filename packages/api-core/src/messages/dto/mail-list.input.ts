import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class MailListInput {
  @Field()
  type: string;

  @Field({ nullable: true })
  name?: string;
}
