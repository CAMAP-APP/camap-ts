import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { addDays, subDays } from 'date-fns';
import { GroupsService } from '../../groups/services/groups.service';
import { UserGroupsService } from '../../groups/services/user-groups.service';
import { VolunteersService } from '../../groups/services/volunteers.service';
import { MailsService } from '../../mails/mails.service';
import { PaymentsService } from '../../payments/services/payments.service';
import { VendorService } from '../../vendors/services/vendor.service';
import { BasketEntity, BasketStatus } from '../entities/basket.entity';
import { DistributionEntity } from '../entities/distribution.entity';
import { MultiDistribEntity } from '../entities/multi-distrib.entity';
import { DistributionsService } from './distributions.service';
import { MultiDistribsService } from './multi-distribs.service';

// should be place somewhere else to be available to all tests?
jest.mock('typeorm-transactional-cls-hooked', () => ({
  Transactional: () => () => ({}),
  BaseRepository: class {},
}));

const FAKE_BASKET = {
  id: 1,
  status: BasketStatus.CONFIRMED,
} as BasketEntity;

describe('MultiDistribsService', () => {
  let service: MultiDistribsService;
  let distributionsService: DistributionsService;

  const mockGroupsService = {
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
  };

  const mockPaymentsService = {
    findPaymentsByBasketId: jest.fn(),
    validatePayment: jest.fn(),
    getOnTheSpotAllowedPaymentTypes: jest.fn(),
  };

  const mockMailsService = {
    createBufferedJsonMail: jest.fn(),
  };

  const mockUserGroupsService = {
    findUsersWithGroupAdminRightInGroup: jest.fn(),
  };

  let getRawManySpy = jest.fn().mockReturnValue([]);
  const mockRepository = jest.fn(() => ({
    save: jest.fn().mockReturnThis(),
    createQueryBuilder: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      setLock: jest.fn().mockReturnThis(),
      getRawMany: getRawManySpy,
    })),
  }))();

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        MultiDistribsService,
        {
          provide: getRepositoryToken(MultiDistribEntity),
          useValue: mockRepository,
        },
        {
          provide: DistributionsService,
          useValue: {
            getDistributions: jest.fn(),
          },
        },
        { provide: UserGroupsService, useValue: mockUserGroupsService },
        { provide: MailsService, useValue: mockMailsService },
        { provide: VendorService, useValue: {} },
        { provide: VolunteersService, useValue: {} },
        { provide: GroupsService, useValue: mockGroupsService },
        { provide: PaymentsService, useValue: mockPaymentsService },
      ],
    }).compile();

    service = moduleRef.get<MultiDistribsService>(MultiDistribsService);
    distributionsService = moduleRef.get<DistributionsService>(DistributionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOrdersEndDate', () => {
    it('when includingExceptions is false, should return orderEndDate', async () => {
      const multiDistrib = new MultiDistribEntity();
      multiDistrib.raw_orderEndDate = new Date();

      expect(await service.getOrdersEndDate(multiDistrib)).toEqual(
        multiDistrib.raw_orderEndDate,
      );
    });

    it('when includingExceptions is true, should return latest order end date of distributions', async () => {
      const multiDistrib = new MultiDistribEntity();
      multiDistrib.raw_orderEndDate = new Date();
      const d1 = new DistributionEntity();
      d1.raw_orderEndDate = subDays(new Date(), 1);
      const d2 = new DistributionEntity();
      d2.raw_orderEndDate = addDays(new Date(), 1);
      jest
        .spyOn(distributionsService, 'getDistributions')
        .mockResolvedValueOnce([d1, d2]);

      expect(
        await service.getOrdersEndDate(multiDistrib, { includingExceptions: true }),
      ).toEqual(d2.raw_orderEndDate);
    });
  });

  describe('getOrdersStartDate', () => {
    it('when includingExceptions is false, should return orderStartDate', async () => {
      const multiDistrib = new MultiDistribEntity();
      multiDistrib.raw_orderStartDate = new Date();

      expect(await service.getOrdersStartDate(multiDistrib)).toEqual(
        multiDistrib.raw_orderStartDate,
      );
    });

    it('when includingExceptions is true, should return earliest order start date of distributions', async () => {
      const multiDistrib = new MultiDistribEntity();
      multiDistrib.raw_orderStartDate = new Date();
      const d1 = new DistributionEntity();
      d1.raw_orderStartDate = subDays(new Date(), 1);
      const d2 = new DistributionEntity();
      d2.raw_orderStartDate = addDays(new Date(), 1);
      jest
        .spyOn(distributionsService, 'getDistributions')
        .mockResolvedValueOnce([d1, d2]);

      expect(
        await service.getOrdersStartDate(multiDistrib, {
          includingExceptions: true,
        }),
      ).toEqual(d1.raw_orderStartDate);
    });
  });
});
