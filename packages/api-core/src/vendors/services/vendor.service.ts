import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { resolve } from 'path';
import {
  DeepPartial,
  FindManyOptions,
  In,
  MoreThan,
  Not,
  Repository,
} from 'typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { GroupEntity } from '../../groups/entities/group.entity';
import { VariableNames, VariableService } from '../../tools/variable.service';
import { CatalogEntity } from '../entities/catalog.entity';
import { VendorDisabledReason, VendorEntity } from '../entities/vendor.entity';
import fs = require('fs');

/**
 * Vendor Service
 */
@Injectable()
export class VendorService {
  static PROFESSIONS: { id: number; name: string }[]; //cache

  constructor(
    @InjectRepository(VendorEntity)
    private readonly vendorsRepo: Repository<VendorEntity>,
    private readonly variableService: VariableService,
  ) {}

  findAll() {
    return this.vendorsRepo.find();
  }

  find(options?: FindManyOptions<VendorEntity>) {
    return this.vendorsRepo.find(options);
  }

  async findByIds(ids: number[]) {
    return this.vendorsRepo.findByIds(ids);
  }

  findNbVendors(afterId: number = -1) {
    return this.vendorsRepo.count({ where: { id: MoreThan(afterId) } });
  }

  findAllNotInIds(vendorIds: number[]) {
    return this.vendorsRepo.find({ where: { id: Not(In(vendorIds)) } });
  }

  getVendor(vendorIdOrEntity: number | VendorEntity) {
    if (typeof vendorIdOrEntity === 'number') {
      return this.findOne(vendorIdOrEntity);
    }
    return vendorIdOrEntity;
  }

  /**
   * get a vendor by id
   */
  async findOne(vendorId: number, lock = false) {
    return this.vendorsRepo.findOne(vendorId, {
      ...(lock ? { lock: { mode: 'pessimistic_write' } } : {}),
    });
  }

  async getVendorFormIdOrEntity(vendorIdOrEntity: number | VendorEntity) {
    return typeof vendorIdOrEntity === 'number'
      ? await this.findOne(vendorIdOrEntity)
      : vendorIdOrEntity;
  }

  /**
   * get vendor groups (vendors catalogs are linked to groups)
   * @param vendor
   */
  async getGroups(vendor: VendorEntity): Promise<Array<GroupEntity>> {
    return this.vendorsRepo
      .createQueryBuilder('v')
      .select('g.*')
      .distinct()
      .innerJoin(CatalogEntity, 'c', 'c.vendorId = v.id')
      .innerJoin(GroupEntity, 'g', 'g.id = c.groupId')
      .where({ id: vendor.id })
      .getRawMany<GroupEntity>();
  }

  async getByEmail(email: string) {
    return VendorEntity.find({ where: { email } });
  }

  async getFromCatalogs(
    catalogIds: number[],
  ): Promise<
    Array<
      Pick<
        VendorEntity,
        | 'id'
        | 'name'
        | 'city'
        | 'zipCode'
        | 'desc'
        | 'linkText'
        | 'linkUrl'
        | 'imageId'
      >
    >
  > {
    return this.vendorsRepo
      .createQueryBuilder('v')
      .select(
        'v.id, v.name, v.email, v.city, v.zipCode, v.desc, v.linkText, v.linkUrl, v.imageId',
      )
      .distinct()
      .addFrom(CatalogEntity, 'c')
      .where(
        `v.id = c.vendorId
        AND c.id IN (${catalogIds.length > 0 ? catalogIds : null})`,
      )
      .getRawMany();
  }

  async getFromCompanyNumber(companyNumber: string) {
    return this.vendorsRepo.find({ where: { companyNumber } });
  }

  /**
   * Deduplicate items by their id
   */
  deduplicate<T extends { id: number }>(items: Array<T>): Array<T> {
    const map = new Map<number, T>();

    items.forEach((i) => map.set(i.id, i));

    return [...map.values()];
  }

  getVendorProfessions(): { id: number; name: string }[] {
    if (VendorService.PROFESSIONS) return VendorService.PROFESSIONS;

    var json = JSON.parse(
      fs.readFileSync(
        resolve(__dirname, '../../../data/vendorProfessions.json'),
        'utf8',
      ),
    );
    VendorService.PROFESSIONS = json.professions;
    return json.professions;
  }

  getLegalStatuses(): { id: number; name: string }[] {
    return JSON.parse(
      fs.readFileSync(
        resolve(__dirname, '../../../data/categoriesJuridiques.json'),
        'utf8',
      ),
    );
  }

  getActivityCodes(): { id: number; name: string }[] {
    return JSON.parse(
      fs.readFileSync(resolve(__dirname, '../../../data/codesNAF.json'), 'utf8'),
    );
  }

  @Transactional()
  async update(vendor: DeepPartial<VendorEntity>) {
    return this.vendorsRepo.save(vendor);
  }

  @Transactional()
  async create(vendor: DeepPartial<VendorEntity>) {
    const tosVersion = await this.variableService.getInt(
      VariableNames.platformTermsOfServiceVersion,
    );
    return this.vendorsRepo.save({
      ...vendor,
      directory: true,
      betaFlags: 0,
      tosVersion,
    });
  }

  @Transactional()
  async ban(vendorId: number, reason: VendorDisabledReason) {
    const vendor = await this.findOne(vendorId, true);
    vendor.disabled = reason;
    return this.update(vendor);
  }

  @Transactional()
  async unban(vendorId: number) {
    const vendor = await this.findOne(vendorId, true);
    vendor.disabled = null;
    return this.update(vendor);
  }
}
