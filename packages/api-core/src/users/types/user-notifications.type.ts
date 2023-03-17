import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class UserNotifications {
  @Field(() => Boolean)
  hasEmailNotif4h: boolean;

  @Field(() => Boolean)
  hasEmailNotif24h: boolean;

  @Field(() => Boolean)
  hasEmailNotifOuverture: boolean;
}
