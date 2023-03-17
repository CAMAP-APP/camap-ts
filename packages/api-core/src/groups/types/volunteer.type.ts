import { Field, Int, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/types/user.type';
import { VolunteerRole } from './volunteer-role.type';

@ObjectType()
export class Volunteer {
  @Field(() => Int)
  multiDistribId: number;

  @Field(() => Int)
  userId: number;

  @Field(() => User)
  user: User;

  @Field(() => Int)
  volunteerRoleId: number;

  @Field(() => VolunteerRole)
  volunteerRole: VolunteerRole;
}
