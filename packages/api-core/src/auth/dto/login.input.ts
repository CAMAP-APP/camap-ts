import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class LoginInput {
  @Field()
  readonly email: string;

  @Field()
  readonly password: string;

  @Field()
  readonly sid: string;
}
