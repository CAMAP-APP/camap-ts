import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { BasketStatus } from '../entities/basket.entity';
import { MultiDistrib } from './multi-distrib.type';

registerEnumType(BasketStatus, { name: 'BasketStatus' });

@ObjectType()
export class Basket {
  @Field(() => Int)
  id: number;

  @Field(() => Date)
  cdate: Date;

  @Field(() => Int)
  num: number;

  @Field()
  total: number;

  @Field(() => BasketStatus)
  status: BasketStatus;

  @Field(() => Int)
  multiDistribId: number;

  @Field(() => MultiDistrib)
  multiDistrib: MultiDistrib;

  @Field(() => Int, { nullable: true })
  userId?: number;
}
