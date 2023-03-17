import { Injectable, Scope } from '@nestjs/common';
import { NestDataLoader } from '../../common/dataloader';
import { PlaceEntity } from '../models/place.entity';
import { PlacesService } from '../services/places.service';
import DataLoader = require('dataloader');

@Injectable({ scope: Scope.REQUEST })
export class PlacesLoader implements NestDataLoader<PlaceEntity['id'], PlaceEntity> {
  constructor(private readonly service: PlacesService) {}

  generateDataLoader() {
    return new DataLoader<PlaceEntity['id'], PlaceEntity>(async (ids: number[]) => {
      const entities = await this.service.findByIds(ids);
      return ids.map((id) => entities.find((p) => p.id === id));
    });
  }
}
