import { Field, Int, ObjectType } from '@nestjs/graphql';
import { PaymentTypeId } from '../../payments/interfaces';
import { GroupDisabledReason } from '../entities/group.entity';

@ObjectType()
export class GroupPreview {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field(() => [PaymentTypeId], { nullable: true })
  allowedPaymentsType?: PaymentTypeId[];

  @Field()
  currencyCode: String;

  @Field(() => Int)
  flags: number;

  @Field(() => Int)
  betaFlags: number;

  @Field({ nullable: true })
  iban?: string;

  @Field({ nullable: true })
  extUrl?: string;

  @Field(() => GroupDisabledReason, { nullable: true })
  disabled?: GroupDisabledReason;
}
