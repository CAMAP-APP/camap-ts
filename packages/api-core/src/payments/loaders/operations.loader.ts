import { Injectable, Scope } from '@nestjs/common';
import { NestDataLoader } from '../../common/dataloader';
import { OperationEntity } from '../entities/operation.entity';
import { PaymentsService } from '../services/payments.service';
import DataLoader = require('dataloader');

@Injectable({ scope: Scope.REQUEST })
export class RelatedPaymentsLoader
  implements NestDataLoader<OperationEntity['id'], OperationEntity[]>
{
  constructor(private readonly service: PaymentsService) {}

  generateDataLoader() {
    return new DataLoader<OperationEntity['id'], OperationEntity[]>(
      async (operationIds: number[]) => {
        const relatedPayments =
          await this.service.getRelatedPaymentsFromManyOperations(operationIds);
        return operationIds.map((id) =>
          relatedPayments.filter((o) => o.relationId === id),
        );
      },
    );
  }
}
