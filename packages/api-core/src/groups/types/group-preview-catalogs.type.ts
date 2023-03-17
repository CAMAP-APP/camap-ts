import { ObjectType, PickType } from '@nestjs/graphql';
import { GroupPreview } from './group-preview.type';

// User with right catalogAdmin can get only these infos
@ObjectType()
export class GroupPreviewCatalogs extends PickType(GroupPreview, [
  'name',
  'id',
  'flags',
]) {}
