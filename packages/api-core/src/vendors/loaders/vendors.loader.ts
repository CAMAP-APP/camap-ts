import { Injectable, Scope } from '@nestjs/common';
import { NestDataLoader } from '../../common/dataloader';
import { VendorEntity } from '../entities/vendor.entity';
import { VendorService } from '../services/vendor.service';
import DataLoader = require('dataloader');

@Injectable({ scope: Scope.REQUEST })
export class VendorsLoader
  implements NestDataLoader<VendorEntity['id'], VendorEntity>
{
  constructor(private readonly service: VendorService) {}

  generateDataLoader() {
    return new DataLoader<VendorEntity['id'], VendorEntity>(
      async (ids: number[]) => {
        const entities = await this.service.findByIds(ids);
        return ids.map((id) => entities.find((f) => f.id === id));
      },
    );
  }
}
