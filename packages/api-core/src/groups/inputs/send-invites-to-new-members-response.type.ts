import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('SendInvitesToNewMembersResponse')
export class SendInvitesToNewMembersResponse {
  @Field(() => [String])
  withoutAccounts: string[]; // The Cache's name

  @Field(() => [Int])
  withAccounts: number[]; // The User's id
}
