import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesModule } from '../files/files.module';
import { GroupsModule } from '../groups/groups.module';
import { MailsModule } from '../mails/mails.module';
import { PaymentsModule } from '../payments/payments.module';
import { DistributionEntity } from '../shop/entities/distribution.entity';
import { ShopModule } from '../shop/shop.module';
import { ToolsModule } from '../tools/tools.module';
import { UsersModule } from '../users/users.module';
import { CatalogEntity } from './entities/catalog.entity';
import { ProductEntity } from './entities/product.entity';
import { VendorEntity } from './entities/vendor.entity';
import { CatalogsLoader } from './loaders/catalogs.loader';
import { ProductsLoader } from './loaders/products.loader';
import { VendorsLoader } from './loaders/vendors.loader';
import { CatalogsResolver } from './resolvers/catalogs.resolver';
import { ProductsResolver } from './resolvers/products.resolver';
import { VendorsResolver } from './resolvers/vendors.resolver';
import { CatalogsService } from './services/catalogs.service';
import { ProductsService } from './services/products.service';
import { VendorService } from './services/vendor.service';
import { ProductDistributionStockEntity } from './entities/productDistributionStock.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VendorEntity,
      CatalogEntity,
      ProductEntity,
      DistributionEntity,
      ProductDistributionStockEntity,
    ]),
    ToolsModule,
    forwardRef(() => FilesModule),
    forwardRef(() => GroupsModule),
    forwardRef(() => UsersModule),
    forwardRef(() => ShopModule),
    forwardRef(() => PaymentsModule),
    MailsModule,
  ],
  providers: [
    CatalogsLoader,
    VendorsLoader,
    ProductsLoader,
    VendorService,
    VendorsResolver,
    CatalogsResolver,
    CatalogsService,
    ProductsService,
    ProductsResolver,
  ],
  exports: [
    VendorService,
    CatalogsService,
    ProductsService,
    ProductsLoader,
    CatalogsLoader,
    VendorsLoader,
  ],
})
export class VendorsModule {}
