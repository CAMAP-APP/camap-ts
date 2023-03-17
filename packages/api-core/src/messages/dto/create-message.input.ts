import { Field, InputType } from '@nestjs/graphql';
import { AttachmentFileInput } from './attachment-file.input';
import { MailGroupInput } from './mail-group.input';
import { MailListInput } from './mail-list.input';
import { MailUserInput } from './mail-user.input';

@InputType()
export class CreateMessageInput {
  @Field()
  title: string;

  @Field()
  htmlBody: string;

  @Field()
  senderName: string;

  @Field()
  senderEmail: string;

  @Field(() => [MailUserInput])
  recipients: MailUserInput[];

  @Field(() => MailGroupInput)
  group: MailGroupInput;

  @Field(() => MailListInput)
  list: MailListInput;

  @Field(() => [AttachmentFileInput], { nullable: true })
  attachments: AttachmentFileInput[];

  @Field()
  slateContent: string;
}
