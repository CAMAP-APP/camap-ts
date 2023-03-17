import { Injectable } from '@nestjs/common';
import { OperationEntity } from '../entities/operation.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class OperationsService {
  constructor(
    @InjectRepository(OperationEntity)
    private readonly operationsRepo: Repository<OperationEntity>,
  ) {}

  findBySubscriptionId(subscriptionId: number) {
    return this.operationsRepo.find({ where: { subscriptionId } });
  }
}
