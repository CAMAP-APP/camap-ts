import { Field, Int, ObjectType } from '@nestjs/graphql';
import { File } from '../../files/models/file.type';

@ObjectType()
export class EntityFile {
  @Field(() => Int)
  id: number;

  @Field()
  entityType: string;

  @Field()
  documentType: string;

  @Field(() => Int)
  entityId: number;

  @Field(() => Int)
  fileId: number;

  @Field(() => String)
  visibility: string | null;

  @Field(() => String)
  url: string;

  @Field(() => String, { nullable: true })
  name: string | null;
}