import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { DistributionCycleEntity } from '../entities/distribution-cycle.entity';

@Injectable()
export class DistributionCyclesService {
  constructor(
    @InjectRepository(DistributionCycleEntity)
    private readonly distributionCycleRepo: Repository<DistributionCycleEntity>,
  ) {}

  async findCycleById(id: number) {
    return this.distributionCycleRepo.findOne(id);
  }

  async findCycleByIds(ids: number[]) {
    return this.distributionCycleRepo.findByIds(ids);
  }

  async findCurrentCyclesByGroupId(groupId: number) {
    return this.distributionCycleRepo.find({
      groupId,
      raw_endDate: MoreThan(new Date()),
    });
  }
}
