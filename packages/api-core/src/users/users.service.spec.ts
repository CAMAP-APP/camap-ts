import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  addDays,
  setHours,
  setMilliseconds,
  setMinutes,
  setSeconds,
  subYears,
} from 'date-fns';
import { Repository } from 'typeorm';
import { CsaSubscriptionsService } from '../groups/services/csa-subscriptions.service';
import { GroupsService } from '../groups/services/groups.service';
import { MembershipsService } from '../groups/services/memberships.service';
import { UserGroupsService } from '../groups/services/user-groups.service';
import { MailsService } from '../mails/mails.service';
import { OrdersService } from '../payments/services/orders.service';
import { PaymentsService } from '../payments/services/payments.service';
import { CryptoService } from '../tools/crypto.service';
import { SessionEntity } from '../tools/models/session.entity';
import { VariableService } from '../tools/variable.service';
import { CatalogsService } from '../vendors/services/catalogs.service';
import { ProductsService } from '../vendors/services/products.service';
import { VendorService } from '../vendors/services/vendor.service';
import { UserEntity } from './models/user.entity';
import { UsersService } from './users.service';

// should be place somewhere else to be available to all tests?
jest.mock('typeorm-transactional-cls-hooked', () => ({
  Transactional: () => () => ({}),
  BaseRepository: class {},
}));

const DELETED_USER = new UserEntity();
DELETED_USER.id = 2;

describe('UsersService', () => {
  let service: UsersService;

  const mockGroupService = {
    find: jest.fn(),
    updateMany: jest.fn(),
  };

  const mockPaymentService = {
    updateOperations: jest.fn(),
    findPartialByUserId: jest.fn(),
    deleteOperation: jest.fn(),
  };
  const mockService = {};

  const mockCatalogService = {
    findByContact: jest.fn(),
    update: jest.fn(),
  };

  const mockOrdersService = {
    attributeBasketsToDeletedUser: jest.fn(),
    findPartialUserOrdersByUserId: jest.fn(),
    findPartialUserOrdersByUserId2: jest.fn(),
  };

  const mockMembershipService = {
    getActiveMembershipsForUser: jest.fn(),
    findByUserId: jest.fn(),
    update: jest.fn(),
  };

  const mockMailService = {
    createBufferedJsonMail: jest.fn(),
  };

  const mockVendorService = {
    find: jest.fn(),
  };

  const mockUserGroupsService = {
    find: jest.fn(),
  };

  const mockCsaSubscriptionService = {
    findByUserId: jest.fn(),
  };

  const themeName = 'test';
  const mockVariableService = {
    getTheme: () => ({
      name: themeName,
    }),
  };

  let getRawManySpy = jest.fn().mockReturnValue([]);
  let streamSpy = () => ({
    on: (type: string, callback: (chunk: any) => void) => {
      if (type !== 'data') return;
      const users = getRawManySpy();
      if (users && users.length) {
        callback(users.pop());
      }
    },
  });
  const mockRepository = jest.fn(() => ({
    delete: jest.fn(() => ({ raw: '', affected: 1 })),
    createQueryBuilder: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawMany: getRawManySpy,
      stream: streamSpy,
    })),
  }))();

  beforeEach(async () => {
    // create a Test module which uses UserService

    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(UserEntity), useValue: mockRepository },
        { provide: getRepositoryToken(SessionEntity), useClass: Repository },
        { provide: GroupsService, useValue: mockGroupService },
        { provide: ProductsService, useValue: mockService },
        { provide: CryptoService, useValue: mockService },
        { provide: MailsService, useValue: mockMailService },
        { provide: CatalogsService, useValue: mockCatalogService },
        { provide: OrdersService, useValue: mockOrdersService },
        { provide: PaymentsService, useValue: mockPaymentService },
        { provide: UserGroupsService, useValue: mockUserGroupsService },
        { provide: MembershipsService, useValue: mockMembershipService },
        { provide: VendorService, useValue: mockVendorService },
        { provide: CsaSubscriptionsService, useValue: mockCsaSubscriptionService },
        { provide: VariableService, useValue: mockVariableService },
      ],
    }).compile();

    service = moduleRef.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('delete', () => {
    let user: UserEntity;
    beforeEach(() => {
      user = new UserEntity();
      user.id = 1;

      jest.spyOn(service, 'findOneByEmail').mockResolvedValue(DELETED_USER);
    });

    it('When deleting a user that is a contact of a catalog, should update catalog to the DeletedUser', async () => {
      jest
        .spyOn(mockCatalogService, 'findByContact')
        .mockResolvedValue([{ id: 1, userId: user.id }]);

      const result = await service.delete(user);

      expect(mockCatalogService.update).toHaveBeenCalledWith([1], {
        userId: DELETED_USER.id,
      });
      expect(result).toEqual(user.id);
    });

    it('When deleting a user that is a contact of a group, should update group to the DeletedUser', async () => {
      jest
        .spyOn(mockGroupService, 'find')
        .mockResolvedValue([{ id: 1, userId: user.id }]);

      const result = await service.delete(user);

      expect(mockGroupService.updateMany).toHaveBeenCalledWith([1], {
        userId: DELETED_USER.id,
      });
      expect(result).toEqual(user.id);
    });

    it('When deleting a user, should update all operations linked to this user to the DeletedUser and delete all operations with amount=0', async () => {
      jest.spyOn(mockPaymentService, 'findPartialByUserId').mockResolvedValue([
        { id: 1, userId: user.id, amount: 6 },
        { id: 1, userId: user.id, amount: 0 },
      ]);

      const result = await service.delete(user);

      expect(mockPaymentService.updateOperations).toHaveBeenCalledWith([1], {
        userId: DELETED_USER.id,
      });
      expect(mockPaymentService.deleteOperation).toHaveBeenCalledTimes(1);
      expect(result).toEqual(user.id);
    });
  });

  describe('cleanUsers', () => {
    beforeEach(() => {
      jest
        .spyOn(mockMembershipService, 'getActiveMembershipsForUser')
        .mockResolvedValue(undefined);
      jest.spyOn(service, 'delete').mockResolvedValue(1);
      jest.spyOn(service, 'findOneByEmail').mockResolvedValue(DELETED_USER);
    });

    it('If there is no user to warn nor to deleten, Should not send any email', async () => {
      getRawManySpy = jest.fn().mockReturnValue([]);

      await service.cleanUsers();

      expect(mockMailService.createBufferedJsonMail).toHaveBeenCalledTimes(0);
      expect(service.delete).toHaveBeenCalledTimes(0);
    });

    it('If there are users to warn, Should warn them', async () => {
      let now = new Date();
      // Get now to be at midnight today
      now = setHours(now, 0);
      now = setMinutes(now, 0);
      now = setSeconds(now, 0);
      now = setMilliseconds(now, 0);
      let twoYearsAgo = subYears(now, 2);
      const thirdWarningDate = addDays(twoYearsAgo, 3);

      const user = new UserEntity();
      getRawManySpy = jest
        .fn()
        .mockReturnValueOnce([{ ...user, ldate: thirdWarningDate }]) // Warn user
        .mockReturnValueOnce([]);
      mockMailService.createBufferedJsonMail.mockClear();

      await service.cleanUsers();

      expect(mockMailService.createBufferedJsonMail).toHaveBeenCalledWith(
        'deletionWarning.twig',
        expect.anything(),
        `Votre compte ${themeName} va être supprimé dans 3 jours.`,
        [user].map((u) => ({
          email: u.email,
          firstName: u.firstName,
          lastName: u.lastName,
          id: u.id,
        })),
      );

      expect(service.delete).toHaveBeenCalledTimes(0);
    });

    it('If there are users to delete with NO orders in less than 2 years, Should delete them them', (done) => {
      const user2 = new UserEntity();
      getRawManySpy = jest.fn().mockReturnValueOnce([]);
      streamSpy = jest.fn().mockReturnValueOnce({
        on: async (type: string, callback: (chunk: any) => Promise<void>) => {
          if (type !== 'data') return;
          await callback(user2);
          expect(service.delete).toHaveBeenCalledWith(user2, DELETED_USER);

          done();
        },
      });

      jest
        .spyOn(mockOrdersService, 'findPartialUserOrdersByUserId')
        .mockResolvedValue([]);
      jest
        .spyOn(mockOrdersService, 'findPartialUserOrdersByUserId2')
        .mockResolvedValue([]);

      service.cleanUsers();
    });

    it('If there are users to delete with orders in less than 2 years, Should NOT delete them', async () => {
      const user = new UserEntity();
      const user2 = new UserEntity();
      getRawManySpy = jest.fn().mockReturnValueOnce([user, user2]);
      streamSpy = jest.fn().mockReturnValueOnce({
        on: async (_: string, callback: (chunk: any) => Promise<void>) => {
          await callback(user);
          await callback(user2);
        },
      });

      jest
        .spyOn(mockOrdersService, 'findPartialUserOrdersByUserId')
        .mockResolvedValue([{ id: 1, date: new Date() }, undefined]);
      jest
        .spyOn(mockOrdersService, 'findPartialUserOrdersByUserId2')
        .mockResolvedValue([undefined, { id: 2, date: new Date() }]);

      await service.cleanUsers();

      expect(service.delete).not.toHaveBeenCalled();
    });

    it('If there are users to delete with an active membership, Should NOT delete them', async () => {
      const user = new UserEntity();
      const user2 = new UserEntity();
      getRawManySpy = jest.fn().mockReturnValueOnce([user, user2]);
      streamSpy = jest.fn().mockReturnValueOnce({
        on: async (_: string, callback: (chunk: any) => Promise<void>) => {
          await callback(user);
          await callback(user2);
        },
      });
      jest
        .spyOn(mockMembershipService, 'getActiveMembershipsForUser')
        .mockResolvedValueOnce({ id: 1 })
        .mockResolvedValueOnce({ id: 2 });

      await service.cleanUsers();

      expect(service.delete).not.toHaveBeenCalled();
    });
  });
});
