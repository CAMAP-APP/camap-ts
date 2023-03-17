import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { addSeconds } from 'date-fns';
import { LessThan, Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { checkDeleted } from '../common/utils';
import { CacheEntity } from './models/cache.entity';

@Injectable()
export class CacheService {
  constructor(
    @InjectRepository(CacheEntity)
    private readonly cacheRepo: Repository<CacheEntity>,
  ) {}

  async get(id: string) {
    const cache = await this.cacheRepo.findOne(id);
    if (!cache) return null;
    if (cache.expire.getTime() < new Date().getTime()) {
      await this.cacheRepo.delete({ name: id });
      return null;
    }
    try {
      return JSON.parse(cache.value);
    } catch {
      return cache.value;
    }
  }

  /**
   * Set a value for key $id.
   * Create the entity if it does not exist,
   * update it otherwise.
   */
  async set(id: string, value: string, expireInSeconds: number) {
    const now = new Date();
    return this.cacheRepo.save({
      name: id,
      value: value,
      expire: addSeconds(now, expireInSeconds),
      cdate: now,
    });
  }

  /**
   * Delete a value for key $id
   */
  async destroy(id: string) {
    const result = await this.cacheRepo.delete({ name: id });
    return checkDeleted(result) ? id : null;
  }

  @Transactional()
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async cleanCache() {
    const now = new Date();
    this.cacheRepo.delete({ expire: LessThan(now) });
  }

  static PREFIXES = {
    invitation: 'invitation',
    ipBan: 'ip-ban',
    changePassword: 'chp',
    productsExcerpt: 'productsExcerpt',
  };
}
