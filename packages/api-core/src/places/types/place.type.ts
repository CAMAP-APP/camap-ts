import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Group } from '../../groups/types/group.type';
// import { Group } from '../../groups/models/group.type';
// import { Distribution } from '../../distributions/models/distribution.type';

@ObjectType()
export class Place {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field()
  city: string;

  @Field()
  zipCode: string;

  /**
   * =========
   * RELATIONS
   * =========
   */
  @Field(() => Group)
  group: Group;

  // @Field(() => [Group])
  // groups: Group[];

  // @Field(() => [Distribution])
  // distributions: Distribution[];

  //   @Field(() => [])
  //   distributionCycles: [];

  //   @Field(() => [])
  //   multiDistribs: [];

  /**
   * OPTIONALS
   */
  @Field({ nullable: true })
  address1?: string;

  @Field({ nullable: true })
  address2?: string;

  @Field({ nullable: true })
  country?: string;

  @Field({ nullable: true })
  lat?: number;

  @Field({ nullable: true })
  lng?: number;
}
