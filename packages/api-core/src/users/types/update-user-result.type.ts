import {
  createUnionType,
  Field,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { UserErrorType } from '../user-errors';
import { User } from './user.type';

registerEnumType(UserErrorType, {
  name: 'UserErrorType',
});

@ObjectType()
class MailAlreadyInUseError {
  @Field(() => UserErrorType)
  type: UserErrorType;
}

export const UpdateUserResult = createUnionType({
  name: 'UpdateUserResult',
  types: () => [User, MailAlreadyInUseError],
  resolveType(value) {
    if (value.camaprErrorType) {
      switch (value.camaprErrorType) {
        case UserErrorType.MailAlreadyInUse:
          return MailAlreadyInUseError;
        default:
          return null;
      }
    }
    return User;
  },
});
