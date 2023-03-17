import { Injectable, Scope } from '@nestjs/common';
import { NestDataLoader } from '../../common/dataloader';
import { MultiDistribEntity } from '../../shop/entities/multi-distrib.entity';
import { VolunteerEntity } from '../entities/volunteer.entity';
import { VolunteersService } from '../services/volunteers.service';
import DataLoader = require('dataloader');

@Injectable({ scope: Scope.REQUEST })
export class VolunteersOfMultiDistribLoader
  implements NestDataLoader<MultiDistribEntity['id'], VolunteerEntity[]>
{
  constructor(private readonly service: VolunteersService) {}

  generateDataLoader() {
    return new DataLoader<MultiDistribEntity['id'], VolunteerEntity[]>(
      async (multiDistribIds: number[]) => {
        const volunteers = await this.service.findByMultiDistribs(multiDistribIds);

        return multiDistribIds.map((mid) =>
          volunteers.filter((v) => v.multiDistribId === mid),
        );
      },
    );
  }
}
