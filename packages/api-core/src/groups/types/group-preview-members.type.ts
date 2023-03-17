import { Field, Float, ObjectType, PickType } from '@nestjs/graphql';
import { GroupPreview } from './group-preview.type';

// User with right membership can get only these infos
@ObjectType()
export class GroupPreviewMembers extends PickType(GroupPreview, ['name', 'id']) {
  @Field()
  hasMembership: boolean;

  @Field(() => Float, { nullable: true })
  membershipFee: number;
}
