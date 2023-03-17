import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class UpdateUserNotificationsInput {
  @Field(() => Int)
  userId: number;

  @Field({ nullable: true })
  controlKey?: string;

  @Field(() => Boolean, { nullable: true })
  hasEmailNotif4h?: boolean;

  @Field(() => Boolean, { nullable: true })
  hasEmailNotif24h?: boolean;

  @Field(() => Boolean, { nullable: true })
  hasEmailNotifOuverture?: boolean;
}
