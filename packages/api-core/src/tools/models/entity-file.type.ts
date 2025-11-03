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

  @Field({ nullable: true })
  data: string | null;

  @Field(() => File, { nullable: true })
  file?: File;
}

