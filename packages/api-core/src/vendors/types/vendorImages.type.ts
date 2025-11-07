import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class VendorImage {
  @Field()
  id: number;

  @Field({ nullable: true })
  name?: string;

  @Field()
  url: string;
}
