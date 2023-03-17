import { Field, Int, ObjectType } from '@nestjs/graphql';
import { DistributionCycleType } from '../entities/distribution-cycle.entity';

@ObjectType()
export class DistributionCycle {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  groupId: number;

  @Field(() => Int)
  placeId: number;

  @Field(() => DistributionCycleType)
  cycleType: DistributionCycleType;

  @Field(() => Date)
  startDate: Date;

  @Field(() => Date)
  endDate: Date;

  @Field(() => Date)
  startHour: Date;

  @Field(() => Date)
  endHour: Date;

  @Field(() => Int)
  daysBeforeOrderStart: number;

  @Field(() => Date)
  openingHour: Date;

  @Field(() => Int)
  daysBeforeOrderEnd: number;

  @Field(() => Date)
  closingHour: Date;
}
