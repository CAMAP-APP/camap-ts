import { Field, Float, ObjectType, registerEnumType } from '@nestjs/graphql';
import { PaymentTypeId } from '../../payments/interfaces';
import { User } from '../../users/types/user.type';
import { GroupDisabledReason } from '../entities/group.entity';
import { GroupPreview } from './group-preview.type';

registerEnumType(PaymentTypeId, { name: 'PaymentTypeId' });
registerEnumType(GroupDisabledReason, { name: 'GroupDisabledReason' });

@ObjectType('Group')
export class Group extends GroupPreview {
  @Field(() => [User], { nullable: true })
  users?: User[];

  @Field(() => User, { nullable: true })
  user?: User;

  @Field()
  hasMembership: boolean;

  @Field(() => Float, { nullable: true })
  membershipFee: number;

  @Field(() => [PaymentTypeId], { nullable: true })
  allowedPaymentsType?: PaymentTypeId[];

  @Field()
  currencyCode: String;

  @Field({ nullable: true })
  txtDistrib?: string;
}
