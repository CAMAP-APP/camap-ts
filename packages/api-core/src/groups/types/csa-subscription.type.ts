import { Field, Int, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/types/user.type';
import { Catalog } from '../../vendors/types/catalog.type';

@ObjectType()
export class CsaSubscriptionType {
  @Field(() => Int)
  id: number;

  @Field()
  startDate: Date;

  @Field()
  endDate: Date;

  // @Field(() => Float, { nullable: true })
  // balance?: number;

  @Field(() => Int)
  userId: number;

  @Field(() => User)
  user: User;

  @Field(() => Int)
  catalogId: number;

  @Field(() => Catalog)
  catalog: Catalog;

  @Field(() => Int, { nullable: true })
  userId2?: number;

  @Field(() => User, { nullable: true })
  user2?: User;

  @Field({ nullable: true })
  absentDistribIds?: string;
}
