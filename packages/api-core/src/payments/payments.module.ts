import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupsModule } from '../groups/groups.module';
import { MailsModule } from '../mails/mails.module';
import { BasketEntity } from '../shop/entities/basket.entity';
import { UserOrderEntity } from '../shop/entities/user-order.entity';
import { ShopModule } from '../shop/shop.module';
import { ToolsModule } from '../tools/tools.module';
import { UsersModule } from '../users/users.module';
// import { PaymentsBridgeController } from './controllers/payments-bridge.controller';
import { OperationEntity } from './entities/operation.entity';
import { RelatedPaymentsLoader } from './loaders/operations.loader';
import { OperationResolver } from './resolvers/operation.resolver';
import { OperationsService } from './services/operations.service';
import { OrdersService } from './services/orders.service';
import { PaymentsService } from './services/payments.service';
import { CsaSubscriptionEntity } from '../groups/entities/csa-subscription.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([OperationEntity, UserOrderEntity, BasketEntity, CsaSubscriptionEntity]),
    ConfigModule,
    HttpModule,
    MailsModule,
    ToolsModule,
    forwardRef(() => GroupsModule),
    forwardRef(() => ShopModule),
    forwardRef(() => UsersModule),
  ],
  providers: [
    PaymentsService,
    OperationsService,
    OperationResolver,
    RelatedPaymentsLoader,
    OrdersService,
  ],
  exports: [PaymentsService, OperationsService, OrdersService],
})
export class PaymentsModule { }
