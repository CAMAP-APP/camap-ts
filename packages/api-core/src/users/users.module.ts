import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupsModule } from '../groups/groups.module';
import { MailsModule } from '../mails/mails.module';
import { PaymentsModule } from '../payments/payments.module';
import { ShopModule } from '../shop/shop.module';
import { SessionEntity } from '../tools/models/session.entity';
import { ToolsModule } from '../tools/tools.module';
import { VendorsModule } from '../vendors/vendors.module';
import { UsersLoader } from './loaders/users.loader';
import { UserEntity } from './models/user.entity';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, SessionEntity]),
    ToolsModule,
    MailsModule,
    forwardRef(() => PaymentsModule),
    forwardRef(() => ShopModule),
    forwardRef(() => GroupsModule),
    forwardRef(() => VendorsModule),
  ],
  providers: [UsersService, UsersResolver, UsersLoader],
  exports: [UsersService, UsersLoader],
})
export class UsersModule {}
