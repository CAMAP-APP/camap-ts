import { Field, ObjectType } from '@nestjs/graphql';
import { UserPreview } from './user-preview.type';
import { UserNotifications } from './user-notifications.type';

@ObjectType()
export class User extends UserPreview {
  @Field()
  email: string;

  @Field({ nullable: true })
  address1?: string;

  @Field({ nullable: true })
  address2?: string;

  @Field({ nullable: true })
  zipCode?: string;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  nationality?: string;

  @Field({ nullable: true })
  countryOfResidence?: string;

  @Field({ nullable: true })
  birthDate?: Date;

  @Field({ nullable: true })
  email2?: string;

  @Field({ nullable: true })
  firstName2?: string;

  @Field({ nullable: true })
  lastName2?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  phone2?: string;

  @Field(() => UserNotifications)
  notifications: UserNotifications;
}
