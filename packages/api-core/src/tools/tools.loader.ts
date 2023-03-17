import { Injectable, Scope } from '@nestjs/common';
import { NestDataLoader } from '../common/dataloader';
import { Vendor } from '../vendors/types/vendor.type';
import { EntityFileService } from './entityFile.service';
import { EntityFileEntity } from './models/entity-file.entity';
import { PermalinkEntity } from './models/permalink.entity';
import { PermalinkService } from './permalink.service';
import DataLoader = require('dataloader');

@Injectable({ scope: Scope.REQUEST })
export class VendorPagesLoader
  implements NestDataLoader<Vendor, Pick<PermalinkEntity, 'link' | 'entityId'>>
{
  constructor(private readonly permalinkService: PermalinkService) {}

  generateDataLoader() {
    return new DataLoader<Vendor, Pick<PermalinkEntity, 'link' | 'entityId'>>(
      async (vendors: Vendor[]) => {
        const permalinks = await this.permalinkService.findVendorsPermakink(
          vendors.map((v) => v.id),
        );

        return vendors.map((v) => permalinks.find((p) => p.entityId === v.id));
      },
    );
  }
}

@Injectable({ scope: Scope.REQUEST })
export class VendorPortraitsLoader
  implements NestDataLoader<Vendor, Pick<EntityFileEntity, 'fileId' | 'entityId'>>
{
  constructor(private readonly entityFileService: EntityFileService) {}

  generateDataLoader() {
    return new DataLoader<Vendor, Pick<EntityFileEntity, 'fileId' | 'entityId'>>(
      async (vendors: Vendor[]) => {
        const entityFiles = await this.entityFileService.findVendorsPortrait(
          vendors.map((v) => v.id),
        );

        return vendors.map((v) => entityFiles.find((e) => e.entityId === v.id));
      },
    );
  }
}
