import { Field, ObjectType } from '@nestjs/graphql';
import { CsaSubscriptionType } from '../../groups/types/csa-subscription.type';
import { Catalog } from '../../vendors/types/catalog.type';
import { Distribution } from './distribution.type';

@ObjectType()
export class AttendanceClassicContract {
  @Field(() => Catalog)
  catalog: Catalog;

  @Field(() => [CsaSubscriptionType])
  subscriptions: CsaSubscriptionType[];

  @Field(() => [Distribution])
  distributions: Distribution[];
}
