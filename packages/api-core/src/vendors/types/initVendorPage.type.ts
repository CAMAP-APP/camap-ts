import { Field, ObjectType } from '@nestjs/graphql';
import { Distribution } from '../../shop/types/distribution.type';
import { Vendor } from './vendor.type';
import { Group } from 'src/groups/types/group.type';

@ObjectType()
export class InitVendorPageDistribution {
  @Field(() => Group)
  group: Group;

  @Field(() => [Distribution])
  distributions: Distribution[]
}

@ObjectType()
export class InitVendorPage {
  @Field(() => Vendor)
  vendor: Vendor;

  @Field(() => [InitVendorPageDistribution])
  nextDistributions: InitVendorPageDistribution[];
}
