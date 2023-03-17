import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { VendorDisabledReason } from '../entities/vendor.entity';
import { VendorImages } from './vendorImages.type';

registerEnumType(VendorDisabledReason, { name: 'VendorDisabledReason' });

@ObjectType()
export class Vendor {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field({ nullable: true })
  peopleName?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  zipCode?: string;

  @Field()
  city: string;

  @Field()
  cdate: Date;

  @Field({ nullable: true })
  address1?: string;

  @Field({ nullable: true })
  address2?: string;

  @Field(() => Int, { nullable: true })
  imageId?: number;

  @Field({ nullable: true })
  linkUrl?: string;

  @Field({ nullable: true })
  linkText?: string;

  @Field({ nullable: true })
  desc?: string;

  @Field({ nullable: true })
  longDesc?: string;

  @Field()
  images: VendorImages;

  @Field({ nullable: true })
  companyNumber?: string;

  @Field({ nullable: true })
  offCamap?: string;

  @Field({ nullable: true })
  vatNumber?: string;

  @Field(() => Int, { nullable: true })
  companyCapital?: number;

  @Field(() => Int, { nullable: true })
  legalStatus?: number;

  @Field({ nullable: true })
  country?: string;

  @Field(() => VendorDisabledReason, { nullable: true })
  disabled?: VendorDisabledReason;
}
