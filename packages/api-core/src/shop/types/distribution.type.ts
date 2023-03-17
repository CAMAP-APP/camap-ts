import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Place } from '../../places/types/place.type';
import { Catalog } from '../../vendors/types/catalog.type';
import { MultiDistrib } from './multi-distrib.type';
import { UserOrder } from './user-order.type';

@ObjectType()
export class Distribution {
  @Field(() => Int)
  id: number;

  @Field(() => Date)
  date: Date;

  @Field(() => Int)
  catalogId: number;

  @Field(() => Catalog)
  catalog: Catalog;

  @Field(() => Date)
  orderEndDate: Date;

  @Field(() => Date)
  orderStartDate: Date;

  @Field()
  place: Place;

  @Field(() => [UserOrder])
  userOrders: UserOrder[];

  @Field(() => MultiDistrib)
  multiDistrib: MultiDistrib;
}
