import { Field, ObjectType } from '@nestjs/graphql';
import { UserGroup } from './user-group.type';
import { RemoveUsersFromGroupError } from './remove-users-from-group-error.type';

@ObjectType('RemoveUsersFromGroupResponse')
export class RemoveUsersFromGroupResponse {
  @Field(() => [UserGroup])
  success: UserGroup[];

  @Field(() => [RemoveUsersFromGroupError])
  errors: [RemoveUsersFromGroupError];
}
