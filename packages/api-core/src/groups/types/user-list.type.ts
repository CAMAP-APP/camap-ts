import { Field, ObjectType } from '@nestjs/graphql';
import { UserListsType } from 'camap-common';

@ObjectType('UserList')
export class UserList {
  @Field(() => String)
  type: UserListsType;

  @Field({ nullable: true })
  count?: number;

  @Field({ nullable: true })
  data?: string;
}
