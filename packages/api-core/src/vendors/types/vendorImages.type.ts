import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class VendorImages {
  @Field({ nullable: true })
  portrait?: string;

  @Field({ nullable: true })
  logo?: string;

  @Field({ nullable: true })
  banner?: string;

  @Field({ nullable: true })
  farm1?: string;

  @Field({ nullable: true })
  farm2?: string;

  @Field({ nullable: true })
  farm3?: string;

  @Field({ nullable: true })
  farm4?: string;
}
