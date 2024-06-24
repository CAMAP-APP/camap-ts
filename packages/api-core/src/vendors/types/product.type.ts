import { Field, Float, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { StockTracking, StockTrackingPerDistribution } from '../product.interface';

registerEnumType(StockTracking, { name: 'StockTracking' });
registerEnumType(StockTrackingPerDistribution, { name: 'StockTrackingPerDistribution' });

@ObjectType()
export class Product {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field(() => Float)
  qt: number;

  @Field(() => Int)
  unitType: number; // enum : Kg / L / g / units

  @Field(() => Float)
  vat: number; // VAT rate in percent

  @Field({ nullable: true })
  desc: string;

  @Field(() => Float, { nullable: true })
  stock: number; // if qantity can be float, stock should be float

  @Field(() => StockTracking)
  stockTracking: StockTracking;

  @Field(() => StockTrackingPerDistribution)
  stockTrackingPerDistrib: StockTrackingPerDistribution;

  @Field()
  organic: boolean;

  @Field()
  bulk: boolean; // (vrac) warn the customer this product is not packaged

  @Field()
  wholesale: boolean; // This product is a wholesale product (crate,bag,pallet)

  @Field()
  variablePrice: boolean; // Price can vary depending on weighting of the product

  @Field(() => Int, { nullable: true })
  imageId: number;

  @Field(() => Int)
  catalogId: number;

  @Field(() => String, { nullable: true })
  ref: string;

  @Field()
  multiWeight: boolean;

  @Field()
  active: boolean;
}
