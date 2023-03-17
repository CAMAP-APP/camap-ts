import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class RegisterInput {
  @Field()
  readonly email: string;

  @Field()
  readonly password: string;

  @Field()
  readonly sid: string;

  @Field()
  readonly firstName: string;

  @Field()
  readonly lastName: string;

  @Field({ nullable: true })
  readonly phone?: string;

  @Field({ nullable: true })
  readonly address1?: string;

  @Field({ nullable: true })
  readonly zipCode?: string;

  @Field({ nullable: true })
  readonly city?: string;

  @Field()
  readonly tos: boolean;

  @Field()
  readonly confirmPassword: string;

  @Field(() => Int, { nullable: true })
  readonly invitedGroupId?: number;

  @Field({ nullable: true })
  readonly email2?: string;

  @Field({ nullable: true })
  readonly firstName2?: string;

  @Field({ nullable: true })
  readonly lastName2?: string;

  @Field({ nullable: true })
  readonly phone2?: string;
}
