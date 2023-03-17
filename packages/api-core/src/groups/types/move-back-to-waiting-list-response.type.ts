import { Field, ObjectType } from '@nestjs/graphql';
import { MoveBackToWaitingListError } from './move-back-to-waiting-list-error.type';
import { WaitingList } from './waitingList.type';

@ObjectType('MoveBackToWaitingListResponse')
export class MoveBackToWaitingListResponse {
  @Field(() => [WaitingList])
  success: WaitingList[];

  @Field(() => [MoveBackToWaitingListError])
  errors: [MoveBackToWaitingListError];
}
