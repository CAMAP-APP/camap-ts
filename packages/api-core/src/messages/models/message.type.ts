// eslint-disable-next-line max-classes-per-file
import { createUnionType, Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class EmbeddedImageAttachment {
  @Field()
  cid: string;

  @Field()
  content: string;

  @Field({ nullable: true })
  contentType?: string;

  @Field({ nullable: true })
  filename?: string;
}

@ObjectType()
export class OtherAttachment {
  @Field()
  fileName: string;

  /** Empty string when the file bytes were not stored (legacy messages). */
  @Field()
  content: string;

  @Field({ nullable: true })
  contentType?: string;

  @Field({ nullable: true })
  encoding?: string;
}

export const AttachmentUnion = createUnionType({
  name: 'AttachmentUnion',
  types: () => [EmbeddedImageAttachment, OtherAttachment],
  resolveType(value) {
    if ('cid' in value) {
      return EmbeddedImageAttachment;
    }
    if ('fileName' in value) {
      return OtherAttachment;
    }
    return null;
  },
});

@ObjectType()
export class Message {
  @Field(() => Int)
  id: number;

  @Field()
  title: string;

  @Field()
  body: string;

  @Field()
  date: Date;

  @Field(() => Int, { nullable: true })
  amapId: number;

  @Field(() => Int)
  senderId: number;

  @Field(() => [String])
  recipients: string[];

  @Field({ nullable: true })
  recipientListId: string;

  @Field(() => [AttachmentUnion], { nullable: true })
  attachments: (EmbeddedImageAttachment | OtherAttachment)[];

  @Field()
  slateContent: string;
}
