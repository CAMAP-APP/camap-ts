import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from '../tools/models/file.entity';
import { UsersModule } from '../users/users.module';
import { FilesController } from './file.controller';
import { FilesService } from './file.service';

@Module({
  imports: [TypeOrmModule.forFeature([FileEntity]), forwardRef(() => UsersModule)],
  providers: [FilesService],
  exports: [FilesService],
  controllers: [FilesController],
})
export class FilesModule { }
