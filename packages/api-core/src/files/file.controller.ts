import {
  Controller,
  Get,
  Injectable,
  NotFoundException,
  Param,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { Repository } from 'typeorm';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { FileEntity } from '../tools/models/file.entity';
import { UserEntity } from '../users/models/user.entity';
import { FilesService } from './file.service';
import sharp = require('sharp');

/**
 * File controller
 */
@Injectable()
@UseGuards(GqlAuthGuard)
@Controller('files')
export class FilesController {
  constructor(
    @InjectRepository(FileEntity) private readonly fileRepo: Repository<FileEntity>,
    private readonly filesService: FilesService,
  ) {}

  @Get('get/:id')
  async getFile(
    @Param('id') id: number,
    @Res() res: Response,
    @CurrentUser() currentUser: UserEntity,
  ) {
    if (!currentUser.isSuperAdmin()) {
      throw new UnauthorizedException();
    }
    const file = await this.fileRepo.findOne(id);
    if (!file) throw new NotFoundException();

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('<html><body><img src="data:image/*;base64,');
    res.write(file.data.toString('base64'));
    res.end('"/></body></html>');
  }

  @Get('compress/:id')
  async compressFile(
    @Param('id') id: number,
    @Res() res: Response,
    @CurrentUser() currentUser: UserEntity,
  ) {
    4;
    if (!currentUser.isSuperAdmin()) {
      throw new UnauthorizedException();
    }
    const file = await this.fileRepo.findOne(id);
    if (!file) throw new NotFoundException();

    // Compress file
    const extension = this.filesService.getExtension(file);
    try {
      let sharpped = sharp(file.data);
      if (extension.toLowerCase() === 'jpeg' || extension.toLowerCase() === 'jpg') {
        sharpped = sharpped.jpeg({ mozjpeg: true });
      } else {
        sharpped = sharpped.png({ quality: 80 });
      }
      const buffered = await sharpped
        .resize(null, 500, { withoutEnlargement: true })
        .toBuffer();

      await this.fileRepo.update(file.id, { data: buffered });

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.write('<html><body><img src="data:image/*;base64,');
      res.write(buffered.toString('base64'));
      res.end('"/></body></html>');
    } catch (e) {
      console.log('An error occured converting file', e);
      res.send('Not an image');
      return;
    }
  }

  @Get('compressAll/:page')
  async compressFiles(
    @Param('page') page: number,
    @Res() res: Response,
    @CurrentUser() currentUser: UserEntity,
  ) {
    if (!currentUser.isSuperAdmin()) {
      throw new UnauthorizedException();
    }
    if (!page) return 'No page';

    // We take files that have been created before the deployment date of this branch
    const files = await this.fileRepo.find({
      take: 500,
      skip: (page - 1) * 500,
    });

    const compressFilesData = await Promise.allSettled(
      files.map((f) => {
        try {
          const extension = this.filesService.getExtension(f);
          let sharpped = sharp(f.data);
          if (extension === 'jpeg' || extension === 'jpg') {
            sharpped = sharpped.jpeg({ mozjpeg: true });
          } else {
            sharpped = sharpped.png({ quality: 80 });
          }
          return sharpped.resize(null, 500, { withoutEnlargement: true }).toBuffer();
        } catch (e) {
          // This is probably not an image file
          return;
        }
      }),
    );

    let index = files.length - 1;
    while (compressFilesData.length > 0) {
      let compressedFileData = compressFilesData.pop();
      if (compressedFileData.status === 'fulfilled') {
        const file = files[index];
        try {
          await this.fileRepo.update(file.id, { data: compressedFileData.value });
          if (index === 0) {
            console.log(
              `Did compress files from ${files[0].id} to ${
                files[files.length - 1].id
              }`,
            );
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write('<html><body><img src="data:image/*;base64,');
            res.write(compressedFileData.value.toString('base64'));
            res.end('"/></body></html>');
          }
        } catch (e) {
          console.log('An error occured', file?.id, e);
        }
      }

      index -= 1;
    }
  }
}
