import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { checkDeleted } from '../common/utils';
import { SessionEntity } from '../tools/models/session.entity';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessionRepo: Repository<SessionEntity>,
  ) {}

  async getLastOfUser(userId: number) {
    return this.sessionRepo.findOne({ uid: userId });
  }

  async getBySid(sid: string) {
    return this.sessionRepo.findOne({ sid });
  }

  async update(session: DeepPartial<SessionEntity>) {
    return this.sessionRepo.save(session);
  }

  @Transactional()
  async delete(sid?: string) {
    if (!sid) return null;
    const result = await this.sessionRepo.delete({ sid });
    return checkDeleted(result) ? sid : null;
  }
}
