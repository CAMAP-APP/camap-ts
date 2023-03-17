import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PermalinkEntity } from './models/permalink.entity';

@Injectable()
export class PermalinkService {
  constructor(@InjectRepository(PermalinkEntity) private readonly permalinkRepo: Repository<PermalinkEntity>) {}

  /**
		Get from entity
	* */
  getByEntity(id: number, type: string) {
    return this.permalinkRepo.findOne({ entityId: id, entityType: type });
  }

  /**
		Get vendors parmalink
	* */
  async findVendorsPermakink(vendordIds: number[]): Promise<Pick<PermalinkEntity, 'link' | 'entityId'>[]> {
    return this.permalinkRepo
      .createQueryBuilder('p')
      .select(['p.link', 'p.entityId'])
      .where(`p.entityId IN(${vendordIds}) AND p.entityType = 'vendor'`)
      .getMany();
  }
}
