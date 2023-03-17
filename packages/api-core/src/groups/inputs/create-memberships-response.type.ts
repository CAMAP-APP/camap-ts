import { Field, ObjectType } from '@nestjs/graphql';
import { Membership } from '../types/membership.type';
import { CreateMembershipsResponseError } from './create-memberships-error.type';

@ObjectType('CreateMembershipsResponse')
export class CreateMembershipsResponse {
  @Field(() => [Membership])
  success: Membership[];

  @Field(() => [CreateMembershipsResponseError])
  errors: [CreateMembershipsResponseError];
}
