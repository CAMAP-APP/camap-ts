import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, Repository } from 'typeorm';
import { PlaceEntity } from '../models/place.entity';

@Injectable()
export class PlacesService {
  constructor(
    @InjectRepository(PlaceEntity)
    private readonly placesRepo: Repository<PlaceEntity>,
  ) {}

  findOne(id: number) {
    return this.placesRepo.findOne(id);
  }

  async findByIds(ids: number[]) {
    return this.placesRepo.findByIds(ids);
  }

  findInZone(
    minLat: number,
    maxLat: number,
    minLng: number,
    maxLng: number,
  ): Promise<PlaceEntity[]> {
    return this.placesRepo
      .createQueryBuilder('p')
      .select('p.*')
      .where(
        `p.lat > ${minLat} and p.lat < ${maxLat} and p.lng > ${minLng} and p.lng < ${maxLng}`,
      )
      .limit(200)
      .getRawMany<PlaceEntity>();
  }

  async find10ClosestPlacesfromCoordinates(
    lat: number,
    lng: number,
  ): Promise<PlaceEntity[]> {
    return getConnection()
      .createQueryBuilder()
      .select('*')
      .from((qb) => {
        const subQuery = qb
          .subQuery()
          .select(`p.*,SQRT( POW(p.lat-${lat},2) + POW(p.lng-${lng},2) ) as dist`)
          .from(PlaceEntity, 'p')
          .where('p.lat is not null')
          .orderBy('dist')
          .limit(10);
        return subQuery;
      }, 'closestGroups')
      .where('dist < 2')
      .getRawMany<PlaceEntity>();
  }

  async findFromGroup(groupId: number) {
    return this.placesRepo.find({ where: { groupId } });
  }
}
