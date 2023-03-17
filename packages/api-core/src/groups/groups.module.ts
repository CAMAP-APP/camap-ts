import { forwardRef, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WaitingListEntity } from '../entities/waiting-list.entity';
import { FilesModule } from '../files/files.module';
import { MailsModule } from '../mails/mails.module';
import { OperationEntity } from '../payments/entities/operation.entity';
import { PaymentsModule } from '../payments/payments.module';
import { PlacesModule } from '../places/places.module';
import { UserOrderEntity } from '../shop/entities/user-order.entity';
import { ShopModule } from '../shop/shop.module';
import { ToolsModule } from '../tools/tools.module';
import { UsersModule } from '../users/users.module';
import { VendorsModule } from '../vendors/vendors.module';
import { CsaSubscriptionEntity } from './entities/csa-subscription.entity';
import { GroupEntity } from './entities/group.entity';
import { MembershipEntity } from './entities/membership.entity';
import { UserGroupEntity } from './entities/user-group.entity';
import { VolunteerRoleEntity } from './entities/volunteer-role.entity';
import { VolunteerEntity } from './entities/volunteer.entity';
import { GroupsLoader } from './loaders/groups.loader';
import { VolunteersOfMultiDistribLoader } from './loaders/volunteers.loader';
import { CsaSubscriptionsResolver } from './resolvers/csa-subscriptions.resolver';
import { GroupPreviewCatalogssResolver } from './resolvers/group-previews-catalogs.resolver';
import { GroupPreviewMembersResolver } from './resolvers/group-previews-members.resolver';
import { GroupPreviewsResolver } from './resolvers/group-previews.resolver';
import { GroupsResolver } from './resolvers/groups.resolver';
import { MembershipsResolver } from './resolvers/memberships.resolver';
import { UserGroupsResolver } from './resolvers/userGroups.resolver';
import { UserListsResolver } from './resolvers/userLists.resolver';
import { WaitingListsResolver } from './resolvers/waitingLists.resolver';
import { CsaSubscriptionsService } from './services/csa-subscriptions.service';
import { GroupsService } from './services/groups.service';
import { MembershipsService } from './services/memberships.service';
import { UserGroupsService } from './services/user-groups.service';
import { VolunteersService } from './services/volunteers.service';
import { WaitingListsService } from './services/waitingLists.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GroupEntity,
      UserGroupEntity,
      MembershipEntity,
      WaitingListEntity,
      CsaSubscriptionEntity,
      VolunteerRoleEntity,
      VolunteerEntity,
      OperationEntity,
      UserOrderEntity,
    ]),
    DiscoveryModule,
    MailsModule,
    PlacesModule,
    VendorsModule,
    ToolsModule,
    forwardRef(() => PaymentsModule),
    forwardRef(() => UsersModule),
    forwardRef(() => ShopModule),
    forwardRef(() => FilesModule),
  ],
  providers: [
    GroupsService,
    UserGroupsService,
    MembershipsService,
    WaitingListsService,
    CsaSubscriptionsService,
    GroupsResolver,
    GroupPreviewsResolver,
    GroupPreviewMembersResolver,
    GroupPreviewCatalogssResolver,
    MembershipsResolver,
    WaitingListsResolver,
    UserListsResolver,
    CsaSubscriptionsResolver,
    VolunteersService,
    GroupsLoader,
    UserGroupsResolver,
    VolunteersOfMultiDistribLoader,
  ],
  exports: [
    GroupsService,
    UserGroupsService,
    MembershipsService,
    WaitingListsService,
    CsaSubscriptionsService,
    VolunteersService,
    GroupsLoader,
    VolunteersOfMultiDistribLoader,
  ],
})
export class GroupsModule {}
