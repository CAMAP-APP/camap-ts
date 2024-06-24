import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { Product } from './product.type';
import { Distribution } from '../../shop/types/distribution.type';

@ObjectType()
export class ProductDistributionStock {
  @Field(() => Int)
  id: number;

  @Field(() => Float)
  stockPerDistribution: number;

  @Field(() => Int)
  frequencyRatio: number;

  @Field(() => Int)
  productId: number;

  @Field(() => Product)
  product: Product;

  @Field(() => Int)
  startDistributionId: number;

  @Field(() => Distribution)
  startDistribution: Distribution;

  @Field(() => Int)
  endDistributionId: number;

  @Field(() => Distribution)
  endDistribution: Distribution;
}
