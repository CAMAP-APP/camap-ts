import { Field, Int, ObjectType, PickType } from '@nestjs/graphql';
import { Place } from '../../places/types/place.type';
import { GroupPreview } from './group-preview.type';

@ObjectType()
export class GroupPreviewMap extends PickType(GroupPreview, ['name', 'id']) {
  @Field(() => String, { nullable: true })
  image?: string;

  @Field(() => Int)
  placeId: number;

  @Field(() => Place)
  place: Place;
}
