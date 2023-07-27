import { ForbiddenException, NotFoundException, UseGuards } from '@nestjs/common';
import {
  Args,
  Float,
  Int,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Loader } from '../../common/decorators/dataloder.decorator';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { FilesService } from '../../files/file.service';
import { PaymentsService } from '../../payments/services/payments.service';
import { PlaceEntity } from '../../places/models/place.entity';
import { PlacesService } from '../../places/services/places.service';
import { UserEntity } from '../../users/models/user.entity';
import { GroupEntity } from '../entities/group.entity';
import { GroupsLoader } from '../loaders/groups.loader';
import { GroupsService } from '../services/groups.service';
import { UserGroupsService } from '../services/user-groups.service';
import { GroupPreviewMap } from '../types/group-preview-map.type';
import { GroupPreview } from '../types/group-preview.type';
import DataLoader = require('dataloader');

@Resolver(() => GroupPreview)
export class GroupPreviewsResolver {
  constructor(
    private readonly groupsService: GroupsService,
    private readonly placesService: PlacesService,
    private readonly filesService: FilesService,
    private readonly paymentsService: PaymentsService,
    private readonly userGroupsService: UserGroupsService,
  ) { }

  /** */
  @Query(() => GroupPreview, { name: 'groupPreview' })
  async get(
    @Args({ name: 'id', type: () => Int }) id: number,
    @Loader(GroupsLoader) groupLoader: DataLoader<number, GroupEntity>,
  ) {
    const group = await groupLoader.load(id);

    if (!group) {
      throw new NotFoundException();
    }

    return group.getPreview();
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [GroupPreview], { name: 'groupPreviews' })
  async getAll() {
    return this.groupsService.find();
  }

  @Query(() => [GroupPreview], { name: 'groupPreviews2' })
  async getAll2() {
    return this.groupsService.find();
  }

  /*
   * Request by zone : http://localhost/api/group/map?minLat=42.8115217450979&maxLat=51.04139389812637=&minLng=-18.369140624999996&maxLng=23.13720703125
   * Request by location : http://localhost/api/group/map?lat=48.85&lng=2.32
   */
  @Query(() => [GroupPreviewMap])
  async getGroupsOnMap(
    @Args({ name: 'lat', type: () => Float, nullable: true }) lat: number,
    @Args({ name: 'lng', type: () => Float, nullable: true }) lng: number,
    @Args({ name: 'minLat', type: () => Float, nullable: true }) minLat: number,
    @Args({ name: 'minLng', type: () => Float, nullable: true }) minLng: number,
    @Args({ name: 'maxLat', type: () => Float, nullable: true }) maxLat: number,
    @Args({ name: 'maxLng', type: () => Float, nullable: true }) maxLng: number,
  ) {
    let places = new Array<PlaceEntity>();
    if (
      minLat !== undefined &&
      maxLat !== undefined &&
      minLng !== undefined &&
      maxLng !== undefined
    ) {
      if (maxLat - minLat > 18) {
        // Zone is too large
      } else if (maxLng - minLng > 22) {
        // Zone is too large
      } else {
        // Request by zone
        places = await this.placesService.findInZone(minLat, maxLat, minLng, maxLng);
      }
    } else if (lat !== undefined && lng !== undefined) {
      // Request by location
      places = await this.placesService.find10ClosestPlacesfromCoordinates(lat, lng);
    } else {
      throw new ForbiddenException('Please provide parameters');
    }

    const groups = await Promise.all(
      places.map((p) => this.groupsService.findOne(p.groupId)),
    );

    return groups.map((g, index) => {
      const place = places[index];
      return {
        ...g,
        image: this.filesService.getUrl(g.imageId),
        placeId: place.id,
        place,
      };
    });
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [GroupPreview])
  async myGroups(@CurrentUser() currentUser: UserEntity) {
    let usersGroups = await this.userGroupsService.find({
      where: { userId: currentUser.id },
    });

    return Promise.all(
      usersGroups.map((ug) => this.groupsService.findOne(ug.groupId)),
    );
  }

  /**
   *
   */
  @ResolveField(() => Boolean)
  async hasPhoneRequired(@Parent() group: GroupEntity) {
    return this.groupsService.hasPhoneRequired(group);
  }

  @ResolveField(() => Boolean)
  async hasAddressRequired(@Parent() group: GroupEntity) {
    return this.groupsService.hasAddressRequired(group);
  }
}
