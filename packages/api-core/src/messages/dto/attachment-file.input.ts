import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class AttachmentFileInput {
  @Field()
  contentType: string;

  @Field()
  filename: string;

  @Field()
  content: string;

  @Field()
  encoding: string;

  @Field({ nullable: true })
  cid?: string;
}
