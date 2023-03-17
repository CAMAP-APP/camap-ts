import { Field, ObjectType } from '@nestjs/graphql';
import { Distribution } from '../../shop/types/distribution.type';
import { Vendor } from './vendor.type';

@ObjectType()
export class InitVendorPage {
  @Field(() => Vendor)
  vendor: Vendor;

  @Field(() => [Distribution])
  nextDistributions: Distribution[];
}
