import { Injectable, Scope } from '@nestjs/common';
import { NestDataLoader } from '../../common/dataloader';
import { DistributionCycleEntity } from '../entities/distribution-cycle.entity';
import { DistributionCyclesService } from '../services/distribution-cycles.service';
import DataLoader = require('dataloader');

@Injectable({ scope: Scope.REQUEST })
export class DistributionCyclesLoader
  implements NestDataLoader<DistributionCycleEntity['id'], DistributionCycleEntity>
{
  constructor(private readonly service: DistributionCyclesService) {}

  generateDataLoader() {
    return new DataLoader<DistributionCycleEntity['id'], DistributionCycleEntity>(
      async (ids: number[]) => {
        const distributionCycles = await this.service.findCycleByIds(ids);

        return ids.map((id) => distributionCycles.find((c) => c.id === id));
      },
    );
  }
}
