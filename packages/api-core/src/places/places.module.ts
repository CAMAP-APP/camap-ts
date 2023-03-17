import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlacesLoader } from './loaders/place.loader';
import { PlaceEntity } from './models/place.entity';
import { PlacesResolver } from './resolvers/places.resolver';
import { PlacesService } from './services/places.service';

@Module({
  imports: [TypeOrmModule.forFeature([PlaceEntity])],
  providers: [PlacesService, PlacesResolver, PlacesLoader],
  exports: [PlacesService, PlacesLoader],
})
export class PlacesModule {}
