import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Theme } from 'camap-common';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import DEFAULT_THEME from './defaultTheme';
import { VariableEntity } from './models/variable.entity';

export enum VariableNames {
  tosVersion = 'tosVersion', // Terms Of Service (for users)
  platformTermsOfServiceVersion = 'platformtermsofservice', // Platform Terms Of Service (for vendors)
  ipBlacklist = 'IPBlacklist',
  defaultShowcaseGroupIds = 'defaultShowcaseGroupIds',
}

@Injectable()
export class VariableService {
  static THEME: Theme; //cache

  constructor(
    @InjectRepository(VariableEntity)
    private readonly variableRepo: Repository<VariableEntity>,
    private readonly configService: ConfigService,
  ) {}

  findOneByKey(key: string, lock = false) {
    return this.variableRepo.findOne(key, {
      ...(lock ? { lock: { mode: 'pessimistic_write' } } : {}),
    });
  }

  /**
   * Get a variable (as string) by key
   */
  async get(key: VariableNames): Promise<string | null> {
    const v = await this.variableRepo.findOne(key);
    if (!v) return null;
    return v.value;
  }

  /**
   * Get a variable (as number) by key
   */
  async getInt(key: VariableNames): Promise<number | null> {
    const i = await this.variableRepo.findOne(key);
    if (i === null) return null;
    return parseInt(i.value, 10);
  }

  @Transactional()
  async set(key: string, value: string) {
    let v = await this.variableRepo.findOne(key);
    if (v == null) {
      v = new VariableEntity();
      v.name = key;
    }
    v.value = value;
    this.variableRepo.save(v);

    return v;
  }

  async getTheme(): Promise<Theme> {
    if (VariableService.THEME) return VariableService.THEME;

    const host = this.configService.get('CAMAP_HOST');

    let theme = DEFAULT_THEME(host);

    VariableService.THEME = theme;
    return theme;
  }
}
