import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { CacheService } from './cache.service';
import { CrontabService } from './crontab.service';
import { CryptoService } from './crypto.service';
import { EntityFileService } from './entityFile.service';
import { CacheEntity } from './models/cache.entity';
import { EntityFileEntity } from './models/entity-file.entity';
import { PermalinkEntity } from './models/permalink.entity';
import { VariableEntity } from './models/variable.entity';
import { PermalinkService } from './permalink.service';
import { ToolsController } from './tools.controller';
import { VendorPagesLoader, VendorPortraitsLoader } from './tools.loader';
import { VariableService } from './variable.service';

/**
 * Various tools used in Camap. (mostly sugoi stuff)
 *
 * - Variable : get and set values in DB, like in a registry table
 * - Maintain
 * - Cache : get and set values in DB, in a key-value store fashion, with expiry dates
 * - File
 * - EntityFile
 *
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      VariableEntity,
      PermalinkEntity,
      EntityFileEntity,
      CacheEntity,
    ]),
    HttpModule,
    forwardRef(() => UsersModule),
  ],
  providers: [
    VariableService,
    PermalinkService,
    EntityFileService,
    CacheService,
    CrontabService,
    CryptoService,
    VendorPagesLoader,
    VendorPortraitsLoader,
  ],
  exports: [
    PermalinkService,
    EntityFileService,
    VariableService,
    CacheService,
    CryptoService,
    VendorPagesLoader,
    VendorPortraitsLoader,
  ],
  controllers: [ToolsController],
})
export class ToolsModule {}
