import { ObjectType } from '@nestjs/graphql';
import { RemoveUsersFromGroupError } from './remove-users-from-group-error.type';

@ObjectType('MoveBackToWaitingListError')
export class MoveBackToWaitingListError extends RemoveUsersFromGroupError {}
