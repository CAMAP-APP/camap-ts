import { ObjectType, OmitType } from '@nestjs/graphql';
import { User } from './user.type';

@ObjectType()
export class InvitedUser extends OmitType(User, [
  'id',
  'nationality',
  'countryOfResidence',
  'birthDate',
  'notifications',
] as const) {}
