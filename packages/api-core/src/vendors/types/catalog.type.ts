import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { EntityFile } from '../../tools/models/entity-file.type';
import { CsaSubscriptionType } from '../../groups/types/csa-subscription.type';
import { Group } from '../../groups/types/group.type';
import { User } from '../../users/types/user.type';
import { CatalogType } from '../catalog.interface';
import { Product } from './product.type';
import { Vendor } from './vendor.type';

registerEnumType(CatalogType, { name: 'CatalogType' });

@ObjectType()
export class Catalog {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field(() => CatalogType)
  type: CatalogType;

  @Field(() => Int)
  groupId: number;

  @Field()
  startDate: Date;

  @Field()
  endDate: Date;

  @Field(() => Vendor, { nullable: true })
  vendor?: Vendor;

  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => [Product])
  products: Product[];

  @Field(() => Group)
  group: Group;

  @Field(() => [CsaSubscriptionType])
  subscriptions: CsaSubscriptionType[];

  @Field(() => Int)
  subscriptionsCount: number;

  @Field(() => [EntityFile])
  documents: EntityFile[];
}
