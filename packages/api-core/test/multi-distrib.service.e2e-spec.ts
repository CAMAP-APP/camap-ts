import { getRepositoryToken } from '@nestjs/typeorm';
import { addDays, addHours, addWeeks, setMilliseconds } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { Repository } from 'typeorm';
import { TZ_PARIS } from '../src/common/constants';
import { DatasetGenerators } from '../src/dev/dataset-generator';
import { GroupEntity } from '../src/groups/entities/group.entity';
import { DistributionEntity } from '../src/shop/entities/distribution.entity';
import {
  MultiDistribEntity,
  MultiDistribValidatedStatus,
} from '../src/shop/entities/multi-distrib.entity';
import { DistributionsService } from '../src/shop/services/distributions.service';
import {
  DistributionsServiceError,
  DistributionsServiceFailReason,
} from '../src/shop/services/distributions.service.error';
import { MultiDistribsService } from '../src/shop/services/multi-distribs.service';
import { cleanDB, closeTestApp, initTestApp, TestContextHelper } from './utils';

describe('MultiDistribsService (e2e)', () => {
  let testHelper: TestContextHelper;
  let service: MultiDistribsService;
  let distributionsService: DistributionsService;
  let multiDistribRepo: Repository<MultiDistribEntity>;
  let distributionRepo: Repository<DistributionEntity>;

  let generators: DatasetGenerators;

  beforeAll(async () => {
    testHelper = await initTestApp();

    await cleanDB(testHelper);

    service = testHelper.app.get<MultiDistribsService>(MultiDistribsService);
    distributionsService =
      testHelper.app.get<DistributionsService>(DistributionsService);
    multiDistribRepo = testHelper.app.get<Repository<MultiDistribEntity>>(
      getRepositoryToken(MultiDistribEntity),
    );
    distributionRepo = testHelper.app.get<Repository<DistributionEntity>>(
      getRepositoryToken(DistributionEntity),
    );

    generators = await testHelper.getGenerators();
  });

  afterAll(async () => {
    await closeTestApp(testHelper);
  });

  describe('createMultiDistrib', () => {
    let group: GroupEntity;

    beforeAll(async () => {
      group = await generators.genGroup({});
    });

    it('if there is an existing multiDistrib at the same place that starts the same day, should throw an error', async () => {
      const now = new Date();
      const distribStartDate = addWeeks(now, 1);

      const existingMultiDistrib = await multiDistribRepo.save({
        placeId: group.placeId,
        groupId: group.id,
        raw_distribStartDate: distribStartDate,
        raw_distribEndDate: now,
        raw_orderStartDate: now,
        raw_orderEndDate: now,
      });

      expect(existingMultiDistrib.raw_distribStartDate).toEqual(distribStartDate);

      await expect(
        service.createMultiDistrib({
          placeId: group.placeId,
          groupId: group.id,
          distribStartDate,
          distribEndDate: addHours(distribStartDate, 2),
          orderStartDate: addHours(now, 1),
          orderEndDate: addDays(now, 5),
        }),
      ).rejects.toMatchObject({
        name: DistributionsServiceError.NAME,
        reason:
          DistributionsServiceFailReason.MULTI_DISTRIB_ALREADY_EXISTS_FOR_THIS_PLACE_AND_DATE,
      });
    });

    it('if there are general volunteer roles, should add them to the multiDistrib and create the multidistrib and call checkMultiDistrib', async () => {
      const now = new Date();

      const role = await generators.genVolunteerRole({
        groupIdOrEntity: group,
        catalogIdOrEntity: null, // A general role is a role without a catalog
      });

      jest.spyOn(service, 'checkMultiDistrib');

      const multiDistrib = await service.createMultiDistrib({
        placeId: group.placeId,
        groupId: group.id,
        distribStartDate: addDays(now, 3),
        distribEndDate: addHours(now, 2),
        orderStartDate: addDays(now, 1),
        orderEndDate: addDays(now, 3),
      });

      expect(multiDistrib.volunteerRolesIds).toEqual([role.id]);

      expect(service.checkMultiDistrib).toHaveBeenCalledWith(multiDistrib);
    });
  });

  describe('updateMultiDistrib', () => {
    let group: GroupEntity;
    let multiDistribToUpdate: MultiDistribEntity;

    beforeAll(async () => {
      group = await generators.genGroup({});
    });

    beforeEach(async () => {
      if (multiDistribToUpdate) {
        await multiDistribRepo.delete(multiDistribToUpdate.id);
      }
      const now = setMilliseconds(new Date(), 0); // MySQL does not store milliseconds
      multiDistribToUpdate = await service.createMultiDistrib({
        placeId: group.placeId,
        groupId: group.id,
        distribStartDate: addDays(now, 3),
        distribEndDate: addHours(now, 2),
        orderStartDate: addDays(now, 1),
        orderEndDate: addDays(now, 3),
      });
    });

    it('if there is an existing multiDistrib at the same place that starts the same day, should throw an error', async () => {
      const now = new Date();
      const distribStartDate = addWeeks(now, 1);

      const existingMultiDistrib = await multiDistribRepo.save({
        placeId: group.placeId,
        groupId: group.id,
        raw_distribStartDate: distribStartDate,
        raw_distribEndDate: now,
        raw_orderStartDate: now,
        raw_orderEndDate: now,
      });

      expect(existingMultiDistrib.raw_distribStartDate).toEqual(distribStartDate);

      await expect(
        service.updateMultiDistrib(multiDistribToUpdate.id, {
          distribStartDate,
          distribEndDate: multiDistribToUpdate.distribEndDate,
          orderStartDate: multiDistribToUpdate.distribStartDate,
          orderEndDate: multiDistribToUpdate.orderEndDate,
        }),
      ).rejects.toMatchObject({
        name: DistributionsServiceError.NAME,
        reason:
          DistributionsServiceFailReason.MULTI_DISTRIB_ALREADY_EXISTS_FOR_THIS_PLACE_AND_DATE,
      });
    });

    it('if the multiDistrib is validated, should throw an error', async () => {
      await multiDistribRepo.update(multiDistribToUpdate.id, {
        validatedStatus: MultiDistribValidatedStatus.VALIDATED,
      });

      await expect(
        service.updateMultiDistrib(multiDistribToUpdate.id, {
          distribStartDate: addDays(multiDistribToUpdate.distribStartDate, 1),
          distribEndDate: multiDistribToUpdate.distribEndDate,
          orderStartDate: multiDistribToUpdate.distribStartDate,
          orderEndDate: multiDistribToUpdate.orderEndDate,
        }),
      ).rejects.toMatchObject({
        name: DistributionsServiceError.NAME,
        reason: DistributionsServiceFailReason.MULTI_DISTRIB_IS_ALREADY_VALIDATED,
      });

      await multiDistribRepo.update(multiDistribToUpdate.id, {
        validatedStatus: MultiDistribValidatedStatus.NOT_VALIDATED,
      });
    });

    it('should call checkMultiDistrib, update the multiDistrib and update the related distributions', async () => {
      jest.spyOn(service, 'checkMultiDistrib');
      // Create another place
      const newPlace = await generators.genPlace({ groupIdOrEntity: group });

      // Create a related distribution with same order start and end dates
      const catalog = await generators.genCatalog({ groupIdOrdEntity: group });
      let sameDatesDistribution = await distributionRepo.save(
        distributionRepo.create({
          catalogId: catalog.id,
          raw_date: multiDistribToUpdate.raw_distribStartDate,
          placeId: multiDistribToUpdate.placeId,
          raw_end: multiDistribToUpdate.raw_distribEndDate,
          multiDistribId: multiDistribToUpdate.id,
          raw_orderEndDate: multiDistribToUpdate.raw_orderEndDate,
          raw_orderStartDate: multiDistribToUpdate.raw_orderStartDate,
        }),
      );

      // Create a related distribution with different order start and end dates
      const catalog2 = await generators.genCatalog({ groupIdOrdEntity: group });
      let differentDatesDistribution = await distributionRepo.save(
        distributionRepo.create({
          catalogId: catalog2.id,
          raw_date: utcToZonedTime(multiDistribToUpdate.distribStartDate, TZ_PARIS),
          placeId: multiDistribToUpdate.placeId,
          raw_end: utcToZonedTime(multiDistribToUpdate.distribEndDate, TZ_PARIS),
          multiDistribId: multiDistribToUpdate.id,
          raw_orderEndDate: utcToZonedTime(
            addHours(multiDistribToUpdate.orderEndDate, 1),
            TZ_PARIS,
          ),
          raw_orderStartDate: utcToZonedTime(
            addHours(multiDistribToUpdate.orderStartDate, 1),
            TZ_PARIS,
          ),
        }),
      );

      const newDistribStartDate = addDays(multiDistribToUpdate.distribStartDate, 1);
      const newDistribEndDate = addDays(multiDistribToUpdate.distribEndDate, 1);
      const newOrderStartDate = addDays(multiDistribToUpdate.distribStartDate, 1);
      const newOrderEndDate = addDays(multiDistribToUpdate.orderEndDate, 1);

      const updatedMultiDistrib = await service.updateMultiDistrib(
        multiDistribToUpdate.id,
        {
          distribStartDate: utcToZonedTime(newDistribStartDate, TZ_PARIS),
          distribEndDate: utcToZonedTime(newDistribEndDate, TZ_PARIS),
          orderStartDate: utcToZonedTime(newOrderStartDate, TZ_PARIS),
          orderEndDate: utcToZonedTime(newOrderEndDate, TZ_PARIS),
          placeId: newPlace.id,
        },
      );

      expect(updatedMultiDistrib.distribStartDate).toEqual(newDistribStartDate);
      expect(updatedMultiDistrib.distribEndDate).toEqual(newDistribEndDate);
      expect(updatedMultiDistrib.orderStartDate).toEqual(newOrderStartDate);
      expect(updatedMultiDistrib.orderEndDate).toEqual(newOrderEndDate);
      expect(updatedMultiDistrib.placeId).toEqual(newPlace.id);

      expect(service.checkMultiDistrib).toHaveBeenCalledWith(updatedMultiDistrib);

      sameDatesDistribution = await distributionRepo.findOne(
        sameDatesDistribution.id,
      );
      differentDatesDistribution = await distributionRepo.findOne(
        differentDatesDistribution.id,
      );

      // Date and End are always updated
      expect(sameDatesDistribution.date).toEqual(
        updatedMultiDistrib.distribStartDate,
      );
      expect(sameDatesDistribution.end).toEqual(updatedMultiDistrib.distribEndDate);
      expect(differentDatesDistribution.date).toEqual(
        updatedMultiDistrib.distribStartDate,
      );
      expect(differentDatesDistribution.end).toEqual(
        updatedMultiDistrib.distribEndDate,
      );

      // Distribution with same order dates should have its order dates updated
      expect(sameDatesDistribution.orderStartDate).toEqual(
        updatedMultiDistrib.orderStartDate,
      );
      expect(sameDatesDistribution.orderEndDate).toEqual(
        updatedMultiDistrib.orderEndDate,
      );

      // Distribution with different order dates should have its order dates unchanged
      expect(differentDatesDistribution.orderStartDate).not.toEqual(
        updatedMultiDistrib.orderStartDate,
      );
      expect(differentDatesDistribution.orderEndDate).not.toEqual(
        updatedMultiDistrib.orderEndDate,
      );
    });

    it('if overrideDates is true, should update the related distributions even if dates were differents', async () => {
      // Create a related distribution
      const catalog = await generators.genCatalog({ groupIdOrdEntity: group });

      let distribution = await distributionRepo.save(
        distributionRepo.create({
          catalogId: catalog.id,
          raw_date: multiDistribToUpdate.distribStartDate,
          placeId: multiDistribToUpdate.placeId,
          raw_end: multiDistribToUpdate.distribEndDate,
          multiDistribId: multiDistribToUpdate.id,
          raw_orderEndDate: addHours(multiDistribToUpdate.orderEndDate, 1),
          raw_orderStartDate: addHours(multiDistribToUpdate.orderStartDate, 1),
        }),
      );

      const newDistribStartDate = addDays(multiDistribToUpdate.distribStartDate, 1);
      const newDistribEndDate = addDays(multiDistribToUpdate.distribEndDate, 1);
      const newOrderStartDate = addDays(multiDistribToUpdate.distribStartDate, 1);
      const newOrderEndDate = addDays(multiDistribToUpdate.orderEndDate, 1);

      const updatedMultiDistrib = await service.updateMultiDistrib(
        multiDistribToUpdate.id,
        {
          distribStartDate: newDistribStartDate,
          distribEndDate: newDistribEndDate,
          orderStartDate: newOrderStartDate,
          orderEndDate: newOrderEndDate,
          overrideDates: true,
        },
      );

      distribution = await distributionRepo.findOne(distribution.id);
      expect(distribution.orderStartDate).toEqual(
        updatedMultiDistrib.orderStartDate,
      );
      expect(distribution.orderEndDate).toEqual(updatedMultiDistrib.orderEndDate);
    });
  });

  describe('deleteMultiDistrib', () => {
    let group: GroupEntity;
    let multiDistrib: MultiDistribEntity;

    beforeAll(async () => {
      group = await generators.genGroup({});
      multiDistrib = await generators.genMultiDistrib({
        groupIdOrEntity: group,
      });
    });

    it('if the multiDistrib is validated, should throw an error', async () => {
      await multiDistribRepo.update(multiDistrib.id, {
        validatedStatus: MultiDistribValidatedStatus.VALIDATED,
      });
      multiDistrib = await multiDistribRepo.findOne(multiDistrib.id);

      await expect(service.deleteMultiDistrib(multiDistrib)).rejects.toMatchObject({
        name: DistributionsServiceError.NAME,
        reason: DistributionsServiceFailReason.MULTI_DISTRIB_IS_ALREADY_VALIDATED,
      });

      await multiDistribRepo.update(multiDistrib.id, {
        validatedStatus: MultiDistribValidatedStatus.NOT_VALIDATED,
      });
      multiDistrib = await multiDistribRepo.findOne(multiDistrib.id);
    });

    it('ok : should delete related distributions and the multiDistrib should have been deleted', async () => {
      const c1 = await generators.genCatalog({
        groupIdOrdEntity: group,
      });
      const d1 = await generators.genDistribution({
        catalogIdOrEntity: c1,
        multiDistribIdOrEntity: multiDistrib,
      });
      const c2 = await generators.genCatalog({
        groupIdOrdEntity: group,
      });
      const d2 = await generators.genDistribution({
        catalogIdOrEntity: c2,
        multiDistribIdOrEntity: multiDistrib,
      });

      jest.spyOn(distributionsService, 'cancelParticipation');

      await service.deleteMultiDistrib(multiDistrib);

      expect(distributionsService.cancelParticipation).toHaveBeenCalledTimes(2);
      await expect(distributionRepo.findOne(d1.id)).resolves.toBeUndefined();
      await expect(distributionRepo.findOne(d2.id)).resolves.toBeUndefined();

      await expect(
        multiDistribRepo.findOne(multiDistrib.id),
      ).resolves.toBeUndefined();
    });
  });
});
