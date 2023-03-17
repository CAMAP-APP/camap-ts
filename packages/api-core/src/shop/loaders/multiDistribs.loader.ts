import { Injectable, Scope } from '@nestjs/common';
import { NestDataLoader } from '../../common/dataloader';
import { MultiDistribEntity } from '../entities/multi-distrib.entity';
import { MultiDistribsService } from '../services/multi-distribs.service';
import DataLoader = require('dataloader');

@Injectable({ scope: Scope.REQUEST })
export class MultiDistribsLoader
  implements NestDataLoader<MultiDistribEntity['id'], MultiDistribEntity>
{
  constructor(private readonly service: MultiDistribsService) {}

  generateDataLoader() {
    return new DataLoader<MultiDistribEntity['id'], MultiDistribEntity>(
      async (multiDistribIds: number[]) => {
        const multidistribs = await this.service.findMultiDistribsByIds(
          multiDistribIds,
        );

        return multiDistribIds.map((id) => multidistribs.find((md) => md.id === id));
      },
    );
  }
}
