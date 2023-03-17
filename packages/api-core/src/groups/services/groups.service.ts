/* eslint-disable no-bitwise */
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindManyOptions, Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { hasFlag } from '../../common/haxeCompat';
import { PlaceEntity } from '../../places/models/place.entity';
import { PlacesService } from '../../places/services/places.service';
import { DistributionsService } from '../../shop/services/distributions.service';
import { GroupEntity } from '../entities/group.entity';
import { GroupFlags } from '../types/interfaces';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(GroupEntity)
    private readonly groupsRepo: Repository<GroupEntity>,
    private readonly placesService: PlacesService,
    @Inject(forwardRef(() => DistributionsService))
    private readonly distributionsService: DistributionsService,
  ) {}

  lock(id: number) {
    return this.groupsRepo.findOne(id, {
      lock: { mode: 'pessimistic_write' },
    });
  }

  findOne(id: number) {
    return this.groupsRepo.findOne(id);
  }

  async find(options?: FindManyOptions<GroupEntity>) {
    return this.groupsRepo.find(options);
  }

  async findByIds(ids: number[]) {
    return this.groupsRepo.findByIds(ids);
  }

  hasCustomizedCategories(group: GroupEntity): boolean {
    const { flags } = group;
    return hasFlag(GroupFlags.CustomizedCategories, flags);
  }

  hasShow3rdCategoryLevel(group: GroupEntity): boolean {
    const { flags } = group;
    return hasFlag(GroupFlags.Show3rdCategoryLevel, flags);
  }

  hasPhoneRequired(group: GroupEntity): boolean {
    return hasFlag(GroupFlags.PhoneRequired, group.flags);
  }

  hasAddressRequired(group: GroupEntity): boolean {
    return hasFlag(GroupFlags.AddressRequired, group.flags);
  }

  @Transactional()
  async updateMany(ids: number[], partialGroup: DeepPartial<GroupEntity>) {
    return this.groupsRepo.update(ids, partialGroup);
  }

  @Transactional()
  async update(group: DeepPartial<GroupEntity>) {
    return this.groupsRepo.save(group);
  }

  /**
   * Find the most common delivery place
   */
  @Transactional()
  async getMainPlace(groupId: number): Promise<PlaceEntity | null> {
    let group = await this.findOne(groupId);

    let places = await this.placesService.findFromGroup(group.id);

    // Just 1 place
    if (places.length === 1) {
      const place = places[0];
      if (group.placeId !== place.id) {
        group = await this.lock(groupId);
        await this.update({
          id: group.id,
          placeId: place.id,
        });
      }
      return place;
    }

    // No places !
    if (places.length === 0) return null;

    // Many places
    const pids = places.map((p) => p.id);

    let mainPlaceId =
      await this.distributionsService.findPlaceIdWhereMostDistributionsTakePlace(
        pids,
      );

    if (!mainPlaceId) {
      mainPlaceId = places.pop().id;
    }

    const place = await this.placesService.findOne(mainPlaceId);
    if (group.placeId !== place.id) {
      group = await this.lock(groupId);
      await this.update({
        id: group.id,
        placeId: place.id,
      });
    }
    return place;
  }
}
