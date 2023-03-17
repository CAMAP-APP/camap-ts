import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class DateIntervalInput {
  @Field()
  start: Date;

  @Field()
  end: Date;
}
