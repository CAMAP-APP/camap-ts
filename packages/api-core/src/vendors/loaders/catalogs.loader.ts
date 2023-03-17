import { Injectable, Scope } from '@nestjs/common';
import { NestDataLoader } from '../../common/dataloader';
import { CatalogEntity } from '../entities/catalog.entity';
import { CatalogsService } from '../services/catalogs.service';
import DataLoader = require('dataloader');

@Injectable({ scope: Scope.REQUEST })
export class CatalogsLoader implements NestDataLoader<number, CatalogEntity> {
  constructor(private readonly service: CatalogsService) {}

  generateDataLoader() {
    return new DataLoader<number, CatalogEntity>(async (ids: number[]) => {
      const entities = await this.service.findByIds(ids);
      return ids.map((id) => entities.find((f) => f.id === id));
    });
  }
}
