import { Injectable, Scope } from '@nestjs/common';
import { NestDataLoader } from '../../common/dataloader';
import { DistributionEntity } from '../entities/distribution.entity';
import { MultiDistribEntity } from '../entities/multi-distrib.entity';
import { DistributionsService } from '../services/distributions.service';
import DataLoader = require('dataloader');

@Injectable({ scope: Scope.REQUEST })
export class DistributionsOfMultiDistribLoader
  implements NestDataLoader<MultiDistribEntity['id'], DistributionEntity[]>
{
  constructor(private readonly service: DistributionsService) {}

  generateDataLoader() {
    return new DataLoader<MultiDistribEntity['id'], DistributionEntity[]>(
      async (multiDistribIds: number[]) => {
        const distributions = await this.service.findAllDistributionsByMultiDistribs(
          multiDistribIds,
        );

        return multiDistribIds.map((mid) =>
          distributions.filter((d) => d.multiDistribId === mid),
        );
      },
    );
  }
}
