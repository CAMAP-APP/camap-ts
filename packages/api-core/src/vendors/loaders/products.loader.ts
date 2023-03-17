import { Injectable, Scope } from '@nestjs/common';
import { NestDataLoader } from '../../common/dataloader';
import { ProductEntity } from '../entities/product.entity';
import { ProductsService } from '../services/products.service';
import DataLoader = require('dataloader');

@Injectable({ scope: Scope.REQUEST })
export class ProductsLoader implements NestDataLoader<number, ProductEntity> {
  constructor(private readonly service: ProductsService) {}

  generateDataLoader() {
    return new DataLoader<number, ProductEntity>(async (ids: number[]) => {
      const entities = await this.service.findByIds(ids);
      return ids.map((id) => entities.find((f) => f.id === id));
    });
  }
}
