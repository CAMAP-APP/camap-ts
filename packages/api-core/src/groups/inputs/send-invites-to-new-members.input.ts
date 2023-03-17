import { InputType, OmitType } from '@nestjs/graphql';
import { User } from '../../users/types/user.type';

@InputType()
export class SendInvitesToNewMembersInput extends OmitType(
  User,
  ['id', 'notifications'] as const,
  InputType,
) {}
