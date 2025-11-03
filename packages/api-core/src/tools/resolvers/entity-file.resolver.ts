import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { FilesService } from '../../files/file.service';
import { File } from '../../files/models/file.type';
import { EntityFile } from '../models/entity-file.type';

@Resolver(() => EntityFile)
export class EntityFileResolver {
  constructor(private readonly filesService: FilesService) {}

  @ResolveField(() => File, { nullable: true })
  async file(@Parent() parent: EntityFile): Promise<File | null> {
    if (!parent.fileId) return null;
    return this.filesService.findOneAndConvertToFile(parent.fileId);
  }
}

