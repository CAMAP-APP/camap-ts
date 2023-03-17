import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { VolunteerRoleEntity } from '../entities/volunteer-role.entity';
import { VolunteerEntity } from '../entities/volunteer.entity';

@Injectable()
export class VolunteersService {
  constructor(
    @InjectRepository(VolunteerEntity)
    private readonly volunteersRepo: Repository<VolunteerEntity>,
    @InjectRepository(VolunteerRoleEntity)
    private readonly volunteerRolesRepo: Repository<VolunteerRoleEntity>,
  ) {}

  async findByMultiDistribs(multiDistribIds: number[]) {
    return this.volunteersRepo.find({ multiDistribId: In(multiDistribIds) });
  }

  async findRolesFromIds(ids: number[]) {
    return this.volunteerRolesRepo.find({
      where: {
        id: In(ids),
      },
    });
  }

  async findRolesFromGroupId(groupId: number) {
    return this.volunteerRolesRepo.find({
      groupId,
    });
  }

  async findRolesFromCatalogId(catalogId: number) {
    return this.volunteerRolesRepo.find({
      catalogId,
    });
  }

  async userIsVolunteerOfMultiDistribs(multiDistribIds: number[], userId: number) {
    const vs = await this.volunteersRepo.find({
      multiDistribId: In(multiDistribIds),
      userId,
    });
    return vs && vs.length > 0;
  }
}
