// eslint-disable-next-line max-classes-per-file
import { createUnionType, Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class EmbeddedImageAttachment {
  @Field()
  cid: string;

  @Field()
  content: string;
}

@ObjectType()
export class OtherAttachment {
  @Field()
  fileName: string;
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
