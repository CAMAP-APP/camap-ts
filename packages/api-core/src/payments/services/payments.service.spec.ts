import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { roundPrice } from 'camap-common';
import { Repository } from 'typeorm';
import { GroupsService } from '../../groups/services/groups.service';
import { UserGroupsService } from '../../groups/services/user-groups.service';
import { OperationEntity } from '../entities/operation.entity';
import { PaymentTypeId } from '../interfaces';
import { OperationType } from '../OperationType';
import { PaymentsService } from './payments.service';

// should be place somewhere else to be available to all tests?
jest.mock('typeorm-transactional-cls-hooked', () => ({
  Transactional: () => () => ({}),
  BaseRepository: class {},
}));

describe('PaymentsService', () => {
  let service: PaymentsService;
  let repo: Repository<OperationEntity>;

  const mockUserGroupService = {};

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: getRepositoryToken(OperationEntity), useClass: Repository },
        { provide: GroupsService, useValue: {} },
        { provide: UserGroupsService, useValue: mockUserGroupService },
      ],
    }).compile();

    service = moduleRef.get<PaymentsService>(PaymentsService);
    repo = moduleRef.get<Repository<OperationEntity>>(
      getRepositoryToken(OperationEntity),
    );
    // console.log('Did get repo', repo);
  });

  describe('makePaymentOperation', () => {
    it('should create operation and update user balance', async () => {
      const operation = new OperationEntity();
      jest.spyOn(repo, 'create').mockResolvedValueOnce(operation as never);
      jest.spyOn(repo, 'save').mockResolvedValueOnce(operation);
      jest.spyOn(service, 'updateUserBalance').mockResolvedValueOnce(undefined);

      const params = {
        type: PaymentTypeId.transfer,
        userId: 1,
        groupId: 1,
        name: '',
        amount: 2,
      };
      const result = await service.makePaymentOperation(params);

      expect(result).toEqual(operation);
      expect(repo.create).toHaveBeenCalledWith({
        userId: params.userId,
        groupId: params.groupId,
        name: params.name,
        amount: params.amount,
        pending: true,
        date: expect.anything(),
        type: OperationType.Payment,
        raw_data: JSON.stringify({ type: params.type }),
      });
      expect(service.updateUserBalance).toHaveBeenCalled();
    });

    it('if the type is onthespot and the group only have one onthespot payment type, should create operation with this type', async () => {
      const operation = new OperationEntity();
      jest.spyOn(repo, 'create').mockResolvedValueOnce(operation as never);
      jest.spyOn(repo, 'save').mockResolvedValueOnce(operation);
      jest.spyOn(service, 'updateUserBalance').mockResolvedValueOnce(undefined);
      jest
        .spyOn(service, 'getOnTheSpotAllowedPaymentTypes')
        .mockResolvedValueOnce([PaymentTypeId.cash]);

      const params = {
        type: PaymentTypeId.onthespot,
        userId: 1,
        groupId: 1,
        name: '',
        amount: 2,
      };
      const result = await service.makePaymentOperation(params);

      expect(result).toEqual(operation);

      expect(service.updateUserBalance).toHaveBeenCalled();
      expect(repo.create).toHaveBeenCalledWith({
        userId: params.userId,
        groupId: params.groupId,
        name: params.name,
        amount: params.amount,
        pending: true,
        date: expect.anything(),
        type: OperationType.Payment,
        raw_data: JSON.stringify({ type: PaymentTypeId.cash }),
      });
    });

    it('if the type is onthespot and the group has many onthespot payment types, should create operation with onthespot type', async () => {
      const operation = new OperationEntity();
      jest.spyOn(repo, 'create').mockResolvedValueOnce(operation as never);
      jest.spyOn(repo, 'save').mockResolvedValueOnce(operation);
      jest.spyOn(service, 'updateUserBalance').mockResolvedValueOnce(undefined);
      jest
        .spyOn(service, 'getOnTheSpotAllowedPaymentTypes')
        .mockResolvedValueOnce([PaymentTypeId.cash, PaymentTypeId.cardTerminal]);

      const params = {
        type: PaymentTypeId.onthespot,
        userId: 1,
        groupId: 1,
        name: '',
        amount: 2,
      };
      const result = await service.makePaymentOperation(params);

      expect(result).toEqual(operation);

      expect(service.updateUserBalance).toHaveBeenCalled();
      expect(repo.create).toHaveBeenCalledWith({
        userId: params.userId,
        groupId: params.groupId,
        name: params.name,
        amount: params.amount,
        pending: true,
        date: expect.anything(),
        type: OperationType.Payment,
        raw_data: JSON.stringify({ type: PaymentTypeId.onthespot }),
      });
    });

    describe('with a relation', () => {
      beforeEach(() => {
        jest
          .spyOn(repo, 'update')
          .mockResolvedValueOnce({ raw: {}, generatedMaps: [] });
      });

      it('if there is an unpaid onTheSpot payment, should update it and not create a new one', async () => {
        const existingPayment = {
          pending: true,
          data: { type: PaymentTypeId.onthespot },
          amount: 2,
          id: 1,
        };
        jest
          .spyOn(service, 'getRelatedPayments')
          .mockResolvedValueOnce([existingPayment as OperationEntity]);
        jest.spyOn(service, 'updateUserBalance').mockResolvedValueOnce(undefined);

        jest.spyOn(repo, 'save');

        const params = {
          type: PaymentTypeId.onthespot,
          userId: 1,
          groupId: 1,
          name: '',
          amount: 2,
          relation: new OperationEntity(),
        };
        await service.makePaymentOperation(params);

        expect(service.updateUserBalance).toHaveBeenCalled();
        expect(repo.save).not.toHaveBeenCalled();

        expect(repo.update).toHaveBeenCalledWith(existingPayment.id, {
          amount: roundPrice(existingPayment.amount + params.amount),
        });
      });

      it('if there is an unpaid cash (or other onTheSpot) payment, should update it and not create a new one', async () => {
        const existingPayment = {
          pending: true,
          data: { type: PaymentTypeId.cash },
          amount: 2,
          id: 1,
        };
        jest
          .spyOn(service, 'getRelatedPayments')
          .mockResolvedValueOnce([existingPayment as OperationEntity]);
        jest.spyOn(service, 'updateUserBalance').mockResolvedValueOnce(undefined);

        jest.spyOn(repo, 'save');

        const params = {
          type: PaymentTypeId.onthespot,
          userId: 1,
          groupId: 1,
          name: '',
          amount: 2,
          relation: new OperationEntity(),
        };
        await service.makePaymentOperation(params);

        expect(service.updateUserBalance).toHaveBeenCalled();
        expect(repo.save).not.toHaveBeenCalled();

        expect(repo.update).toHaveBeenCalledWith(existingPayment.id, {
          amount: roundPrice(existingPayment.amount + params.amount),
        });
      });

      it('if there is an paid onTheSpot or transfer payment, should create a new one', async () => {
        const existingPayment = new OperationEntity();
        existingPayment.pending = false;
        existingPayment.data = { type: PaymentTypeId.onthespot };
        const existingPayment2 = new OperationEntity();
        existingPayment2.pending = false;
        existingPayment2.data = { type: PaymentTypeId.transfer };
        jest
          .spyOn(service, 'getRelatedPayments')
          .mockResolvedValueOnce([existingPayment, existingPayment2]);
        jest.spyOn(repo, 'create').mockResolvedValueOnce(existingPayment as never);
        jest.spyOn(repo, 'save').mockResolvedValueOnce(existingPayment);
        jest.spyOn(service, 'updateUserBalance').mockResolvedValueOnce(undefined);
        jest
          .spyOn(service, 'getOnTheSpotAllowedPaymentTypes')
          .mockResolvedValueOnce([PaymentTypeId.cash, PaymentTypeId.cardTerminal]);

        const params = {
          type: PaymentTypeId.onthespot,
          userId: 1,
          groupId: 1,
          name: '',
          amount: 2,
          relation: new OperationEntity(),
        };
        const result = await service.makePaymentOperation(params);

        expect(result).toEqual(existingPayment);

        expect(service.updateUserBalance).toHaveBeenCalled();
        expect(repo.create).toHaveBeenCalled();
        expect(repo.save).toHaveBeenCalled();
      });

      it('if there is an unpaid transfer payment, should update it and not create a new one', async () => {
        const existingPayment = {
          pending: true,
          data: { type: PaymentTypeId.transfer },
          amount: 2,
          id: 1,
        };
        jest
          .spyOn(service, 'getRelatedPayments')
          .mockResolvedValueOnce([existingPayment as OperationEntity]);
        jest.spyOn(service, 'updateUserBalance').mockResolvedValueOnce(undefined);
        jest.spyOn(service, 'updateOperation').mockResolvedValueOnce(undefined);

        jest.spyOn(repo, 'save');

        const params = {
          type: PaymentTypeId.transfer,
          userId: 1,
          groupId: 1,
          name: '',
          amount: 2,
          relation: new OperationEntity(),
        };
        await service.makePaymentOperation(params);

        expect(service.updateUserBalance).toHaveBeenCalled();
        expect(repo.save).not.toHaveBeenCalled();

        expect(repo.update).toHaveBeenCalledWith(existingPayment.id, {
          amount: roundPrice(existingPayment.amount + params.amount),
        });
      });

      it('if there is an unpaid transfer payment and another type is passes, should create a new one', async () => {
        const existingPayment = {
          pending: true,
          data: { type: PaymentTypeId.transfer },
          amount: 2,
        };
        jest
          .spyOn(service, 'getRelatedPayments')
          .mockResolvedValueOnce([existingPayment as OperationEntity]);
        jest.spyOn(repo, 'create').mockResolvedValueOnce(existingPayment as never);
        jest
          .spyOn(repo, 'save')
          .mockResolvedValueOnce(existingPayment as OperationEntity);
        jest.spyOn(service, 'updateUserBalance').mockResolvedValueOnce(undefined);
        jest
          .spyOn(service, 'getOnTheSpotAllowedPaymentTypes')
          .mockResolvedValueOnce([PaymentTypeId.cash, PaymentTypeId.cardTerminal]);

        const params = {
          type: PaymentTypeId.onthespot,
          userId: 1,
          groupId: 1,
          name: '',
          amount: 2,
          relation: new OperationEntity(),
        };
        const result = await service.makePaymentOperation(params);

        expect(result).toEqual(existingPayment);

        expect(service.updateUserBalance).toHaveBeenCalled();
        expect(repo.create).toHaveBeenCalled();
        expect(repo.save).toHaveBeenCalled();
      });
    });
  });
});
