import { Injectable, Scope } from '@nestjs/common';
import { NestDataLoader } from '../../common/dataloader';
import { UserEntity } from '../models/user.entity';
import { UsersService } from '../users.service';
import DataLoader = require('dataloader');

@Injectable({ scope: Scope.REQUEST })
export class UsersLoader implements NestDataLoader<UserEntity['id'], UserEntity> {
  constructor(private readonly service: UsersService) {}

  generateDataLoader() {
    return new DataLoader<UserEntity['id'], UserEntity>(
      async (userIds: number[]) => {
        const users = await this.service.findByIds(userIds);

        return userIds.map((id) => users.find((u) => u.id === id));
      },
    );
  }
}
