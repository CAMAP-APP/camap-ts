import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class VendorProfession {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;
}
