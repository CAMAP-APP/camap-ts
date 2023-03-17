import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class MailUserInput {
  @Field()
  email: string;

  @Field(() => Int, { nullable: true })
  id?: number;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;
}
