import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupsModule } from '../groups/groups.module';
import { MailsModule } from '../mails/mails.module';
import { OperationEntity } from '../payments/entities/operation.entity';
import { PaymentsModule } from '../payments/payments.module';
import { PlacesModule } from '../places/places.module';
import { ToolsModule } from '../tools/tools.module';
import { UsersModule } from '../users/users.module';
import { ProductEntity } from '../vendors/entities/product.entity';
import { VendorsModule } from '../vendors/vendors.module';
import { BasketEntity } from './entities/basket.entity';
import { DistributionCycleEntity } from './entities/distribution-cycle.entity';
import { DistributionEntity } from './entities/distribution.entity';
import { MultiDistribEntity } from './entities/multi-distrib.entity';
import { UserOrderEntity } from './entities/user-order.entity';
import { DistributionCyclesLoader } from './loaders/distributionCycles.loader';
import { DistributionsOfMultiDistribLoader } from './loaders/distributions.loader';
import { MultiDistribsLoader } from './loaders/multiDistribs.loader';
import { AttendanceListResolver } from './resolvers/attendance-list.resolver';
import { DistributionCyclesResolver } from './resolvers/distribution-cycles.resolver';
import { DistributionsResolver } from './resolvers/distributions.resolver';
import { MultiDistribsResolver } from './resolvers/multi-distribs.resolver';
import { OrdersResolver } from './resolvers/orders.resolver';
import { DistributionCyclesService } from './services/distribution-cycles.service';
import { DistributionsService } from './services/distributions.service';
import { MultiDistribsService } from './services/multi-distribs.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserOrderEntity,
      MultiDistribEntity,
      DistributionEntity,
      DistributionCycleEntity,
      BasketEntity,
      OperationEntity,
      ProductEntity,
    ]),
    HttpModule,
    PlacesModule,
    forwardRef(() => VendorsModule),
    forwardRef(() => GroupsModule),
    forwardRef(() => PaymentsModule),
    forwardRef(() => UsersModule),
    MailsModule,
    ToolsModule,
  ],
  providers: [
    DistributionsService,
    MultiDistribsService,
    DistributionCyclesService,
    DistributionsResolver,
    MultiDistribsResolver,
    AttendanceListResolver,
    DistributionCyclesResolver,
    DistributionsOfMultiDistribLoader,
    MultiDistribsLoader,
    DistributionCyclesLoader,
    OrdersResolver,
  ],
  exports: [MultiDistribsService, DistributionsService],
})
export class ShopModule { }
