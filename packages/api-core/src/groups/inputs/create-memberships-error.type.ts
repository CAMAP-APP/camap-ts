import { ObjectType } from '@nestjs/graphql';
import { RemoveUsersFromGroupError } from '../types/remove-users-from-group-error.type';

@ObjectType('CreateMembershipsResponseError')
export class CreateMembershipsResponseError extends RemoveUsersFromGroupError {}
