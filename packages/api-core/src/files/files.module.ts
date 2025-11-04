import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from '../tools/models/file.entity';
import { UsersModule } from '../users/users.module';
import { FilesController } from './file.controller';
import { FilesService } from './file.service';
import { EntityFileService } from 'src/tools/entityFile.service';
import { EntityFileEntity } from 'src/tools/models/entity-file.entity';
import { GroupsModule } from 'src/groups/groups.module';
import { VendorsModule } from 'src/vendors/vendors.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileEntity, EntityFileEntity]),
    forwardRef(() => GroupsModule),
    forwardRef(() => VendorsModule),
    forwardRef(() => UsersModule)
  ],
  providers: [FilesService, EntityFileService],
  exports: [FilesService, EntityFileService],
  controllers: [FilesController],
})
export class FilesModule { }
