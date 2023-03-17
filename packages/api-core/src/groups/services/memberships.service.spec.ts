import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OperationEntity } from '../../payments/entities/operation.entity';
import { PaymentsService } from '../../payments/services/payments.service';
import { UserEntity } from '../../users/models/user.entity';
import { GroupEntity } from '../entities/group.entity';
import { MembershipEntity } from '../entities/membership.entity';
import { UserGroupEntity } from '../entities/user-group.entity';
import { GroupsService } from './groups.service';
import { MembershipsService } from './memberships.service';
import { UserGroupsService } from './user-groups.service';

// should be place somewhere else to be available to all tests?
jest.mock('typeorm-transactional-cls-hooked', () => ({
  Transactional: () => () => ({}),
  BaseRepository: class {},
}));

const MEMBERSHIP_OPERATION_ID = 12;

describe('MembershipsService', () => {
  let service: MembershipsService;
  let repo: Repository<MembershipEntity>;

  const mockGroupService = {};
  const mockPaymentService = {
    findOneById: () => Promise.resolve(new OperationEntity()),
    getRelatedPayments: () => Promise.resolve([new OperationEntity()]),
    updateUserBalance: () => Promise.resolve([new UserGroupEntity()]),
    deleteOperation: () => true,
    makeNonPaymentOperation: () => {
      const m = new OperationEntity();
      m.id = MEMBERSHIP_OPERATION_ID;
      return m;
    },
    makePaymentOperation: () => Promise.resolve(new OperationEntity()),
    updateOperation: () => Promise.resolve(true),
  };
  const mockUserGroupService = {};

  beforeEach(async () => {
    // create a Test module which uses MembershipService

    const moduleRef = await Test.createTestingModule({
      providers: [
        MembershipsService,
        { provide: getRepositoryToken(MembershipEntity), useClass: Repository },
        { provide: GroupsService, useValue: mockGroupService },
        { provide: PaymentsService, useValue: mockPaymentService },
        { provide: UserGroupsService, useValue: mockUserGroupService },
      ],
    }).compile();

    service = moduleRef.get<MembershipsService>(MembershipsService);
    repo = moduleRef.get<Repository<MembershipEntity>>(
      getRepositoryToken(MembershipEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getMembershipYear and getPeriodNameFromYear', () => {
    const group: GroupEntity = {
      membershipRenewalDate: '2015-01-01',
    } as GroupEntity;

    expect(service.getMembershipYear(group, new Date(2015, 3, 3))).toBe(2015);
    expect(
      service.getPeriodNameFromYear(
        group,
        service.getMembershipYear(group, new Date(2015, 3, 3)),
      ),
    ).toBe('2015');

    expect(service.getMembershipYear(group, new Date(2014, 8, 8))).toBe(2014);
    expect(service.getMembershipYear(group, new Date(2013, 11, 12))).toBe(2013);

    // date of renewal is 1st of sept, year can be anything
    group.membershipRenewalDate = '2000-09-01';

    expect(service.getMembershipYear(group, new Date(2015, 3, 3))).toBe(2014);
    expect(service.getPeriodNameFromYear(group, 2014)).toBe('2014-2015');

    expect(service.getMembershipYear(group, new Date(2015, 8, 8))).toBe(2015);
    expect(service.getPeriodNameFromYear(group, 2015)).toBe('2015-2016');

    // day of renewal
    expect(service.getMembershipYear(group, new Date(2015, 8, 1))).toBe(2015);
  });

  describe('deleteMembership', () => {
    it('when membership exists', async () => {
      const membership = new MembershipEntity();
      membership.groupId = 12;
      membership.userId = 12;
      membership.year = 2021;

      jest.spyOn(service, 'getUserMembership').mockResolvedValueOnce(membership);
      jest.spyOn(repo, 'delete').mockResolvedValueOnce({ raw: '', affected: 1 });

      const result = await service.deleteMembership(12, 12, 2021);

      expect(result).toEqual({ userId: 12, groupId: 12, year: 2021 });
    });

    it('when membership does no exist', async () => {
      jest.spyOn(service, 'getUserMembership').mockResolvedValueOnce(undefined);

      const result = await service.deleteMembership(12, 12, 2021);

      expect(result).toBeNull();
    });
  });

  describe('createMembership', () => {
    describe('when membershipFee parameter is not set', () => {
      it('and group.membershipFee is not set, should throw an error', async () => {
        await expect(
          service.createMembership(
            new UserEntity(),
            new GroupEntity(),
            new Date(),
            2021,
          ),
        ).rejects.toThrow();
      });

      it('and group.membershipFee is set, should create membership', async () => {
        const membership = new MembershipEntity();
        jest.spyOn(repo, 'create').mockResolvedValueOnce(membership as never);
        jest.spyOn(repo, 'save').mockResolvedValueOnce(membership);

        const group = new GroupEntity();
        group.membershipFee = 500;
        const result = await service.createMembership(
          new UserEntity(),
          group,
          new Date(),
          2021,
        );

        expect(result).toEqual(membership);
      });
    });

    describe('when group is CSA', () => {
      let membership: MembershipEntity;

      beforeEach(() => {
        membership = new MembershipEntity();
        membership.operationId = MEMBERSHIP_OPERATION_ID;
        jest.spyOn(repo, 'create').mockResolvedValue(membership as never);
        jest.spyOn(repo, 'save').mockResolvedValue(membership);
      });

      it('should create membership with an operationId set to the membership operation', async () => {
        const results = await service.createMembership(
          new UserEntity(),
          new GroupEntity(),
          new Date(),
          2021,
          500,
        );
        expect(results).toEqual(membership);
        expect(results.operationId).toEqual(MEMBERSHIP_OPERATION_ID);
      });
    });
  });
});
