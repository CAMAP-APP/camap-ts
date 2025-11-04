import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindConditions, Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { checkDeleted } from '../common/utils';
import { EntityFileEntity } from './models/entity-file.entity';

@Injectable()
export class EntityFileService {
  constructor(
    @InjectRepository(EntityFileEntity)
    private readonly entityfileRepo: Repository<EntityFileEntity>,
  ) {}

  /**
		Get files linked to an entity
	* */
  getByEntity(id: number, type: string, documentType?: string, lock = false) {
    const findConditions: FindConditions<EntityFileEntity> = {
      entityId: id,
      entityType: type,
    };
    if (documentType) findConditions.documentType = documentType;

    return this.entityfileRepo.findOne(findConditions, {
      ...(lock ? { lock: { mode: 'pessimistic_write' } } : {}),
    });
  }

  /**
		Get all documents linked to an entity
	* */
  getAllByEntity(id: number, type: string, documentType?: string) {
    const findConditions: FindConditions<EntityFileEntity> = {
      entityId: id,
      entityType: type,
    };
    if (documentType) findConditions.documentType = documentType;

    return this.entityfileRepo.find({ where: findConditions, relations: ['file'] });
  }

  /**
		Get vendors portrait
	* */
  async findVendorsPortrait(
    vendorIds: number[],
  ): Promise<Pick<EntityFileEntity, 'fileId' | 'entityId'>[]> {
    return this.entityfileRepo
      .createQueryBuilder('e')
      .select(['e.fileId', 'e.entityId'])
      .where(
        `e.entityId IN(${vendorIds}) AND e.entityType = 'vendor' AND e.documentType = 'portrait'`,
      )
      .getMany();
  }

  async findVendorImages(
    vendorId: number,
  ): Promise<Pick<EntityFileEntity, 'fileId' | 'entityId' | 'documentType'>[]> {
    return this.entityfileRepo
      .createQueryBuilder('e')
      .select(['fileId', 'entityId, documentType'])
      .where(
        `e.entityId = ${vendorId} AND e.entityType = 'vendor' 
        AND (e.documentType = 'portrait' 
          OR e.documentType = 'banner' 
          OR e.documentType = 'logo' 
          OR e.documentType = 'farm1' 
          OR e.documentType = 'farm2' 
          OR e.documentType = 'farm3'
          OR e.documentType = 'farm4')`,
      )
      .getRawMany<Pick<EntityFileEntity, 'fileId' | 'entityId' | 'documentType'>>();
  }

  @Transactional()
  async updateOrCreate(entityFile: DeepPartial<EntityFileEntity>) {
    return this.entityfileRepo.save(entityFile);
  }

  async findOne(id: number) {
    return this.entityfileRepo.findOne(id);
  }

  @Transactional()
  async delete(id: number) {
    const result = await this.entityfileRepo.delete({ id });
    return checkDeleted(result) ? id : null;
  }

  async findByFileId(fileId: number, excludeId?: number) {
    const query = this.entityfileRepo
      .createQueryBuilder('ef')
      .where('ef.fileId = :fileId', { fileId });
    
    if (excludeId) {
      query.andWhere('ef.id != :excludeId', { excludeId });
    }
    
    return query.getMany();
  }
}
