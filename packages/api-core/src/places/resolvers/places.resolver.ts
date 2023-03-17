import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { Place } from '../types/place.type';
import { PlacesService } from '../services/places.service';

@Resolver(() => Place)
export class PlacesResolver {
  constructor(private readonly placesService: PlacesService) {}

  @Query(() => Place)
  place(@Args({ name: 'id', type: () => Int }) id: number) {
    return this.placesService.findOne(id);
  }
}
