import { Injectable, Scope } from '@nestjs/common';
import { NestDataLoader } from '../../common/dataloader';
import { GroupEntity } from '../entities/group.entity';
import { GroupsService } from '../services/groups.service';
import DataLoader = require('dataloader');

@Injectable({ scope: Scope.REQUEST })
export class GroupsLoader implements NestDataLoader<number, GroupEntity> {
  constructor(private readonly service: GroupsService) {}

  generateDataLoader() {
    return new DataLoader<number, GroupEntity>(async (ids: number[]) => {
      const entities = await this.service.findByIds(ids);
      return ids.map((id) => entities.find((f) => f.id === id));
    });
  }
}
