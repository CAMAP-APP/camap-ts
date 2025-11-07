import {
  BadRequestException,
  ForbiddenException,
  Inject,
  NotFoundException,
  UseGuards,
  forwardRef,
} from '@nestjs/common';
import { Args, Int, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { FilesService } from '../../files/file.service';
import { CatalogsService } from '../../vendors/services/catalogs.service';
import { VendorService } from '../../vendors/services/vendor.service';
import { GroupsService } from '../../groups/services/groups.service';
import { UserGroupsService } from '../../groups/services/user-groups.service';
import { UserEntity } from '../../users/models/user.entity';
import { EntityFileService } from '../entityFile.service';
import { EntityFileEntity } from '../models/entity-file.entity';
import { EntityFile } from '../models/entity-file.type';

@Resolver(() => EntityFile)
export class EntityFileResolver {
  constructor(
    private readonly filesService: FilesService,
    private readonly entityFileService: EntityFileService,
    @Inject(forwardRef(() => GroupsService))
    private readonly groupsService: GroupsService,
    @Inject(forwardRef(() => VendorService))
    private readonly vendorsService: VendorService,
    @Inject(forwardRef(() => CatalogsService))
    private readonly catalogsService: CatalogsService,
    @Inject(forwardRef(() => UserGroupsService))
    private readonly userGroupsService: UserGroupsService,
  ) {}

  @ResolveField(() => String)
  async url(@Parent() parent: EntityFile) {
    return this.filesService.getUrl(parent.fileId);
  }

  @ResolveField(() => String)
  async name(@Parent() parent: EntityFile) {
    return (await this.filesService.findOne(parent.fileId)).name;
  }

  @ResolveField(() => String)
  visibility(@Parent() parent: EntityFileEntity) {
    return parent.data;
  }

  @UseGuards(GqlAuthGuard)
  @Transactional()
  @Mutation(() => EntityFile)
  async createDocument(
    @Args({ name: 'entityType' }) entityType: string,
    @Args({ name: 'entityId', type: () => Int }) entityId: number,
    @Args({ name: 'base64EncodedFile' }) base64EncodedFile: string,
    @Args({ name: 'fileName' }) fileName: string,
    @Args({ name: 'name', nullable: true }) name: string | null,
    @Args({ name: 'visibility' }) visibility: string,
    @CurrentUser() currentUser: UserEntity,
  ): Promise<EntityFileEntity> {
    // Validate file is PDF
    if (!fileName.toLowerCase().endsWith('.pdf')) {
      throw new BadRequestException(
        'Le document n\'est pas au format pdf. Veuillez sélectionner un fichier au format pdf.',
      );
    }

    // Extract base64 data (remove data:application/pdf;base64, prefix if present)
    let fileData: string = base64EncodedFile;
    if (base64EncodedFile.includes(';base64,')) {
      fileData = base64EncodedFile.split(';base64,')[1];
    } else if (base64EncodedFile.startsWith('data:')) {
      fileData = base64EncodedFile.split(',')[1];
    }

    // Convert base64 to Buffer
    const fileBuffer = Buffer.from(fileData, 'base64');

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (fileBuffer.length > maxSize) {
      throw new BadRequestException(
        'Le document importé est trop volumineux. Il ne doit pas dépasser 10 Mo.',
      );
    }

    // Validate entity exists and user has permission
    let hasPermission = false;
    const documentName = name || fileName;
    
    let validVisibility = ['public'];

    switch (entityType) {
      case 'group':
        const group = await this.groupsService.findOne(entityId);
        if (!group) throw new NotFoundException('Group not found');
        hasPermission = await this.userGroupsService.isGroupAdmin(
          currentUser,
          entityId,
        );
        if (!hasPermission) {
          throw new ForbiddenException(
            'Vous n\'avez pas l\'autorisation de gérer ce groupe',
          );
        }
        validVisibility.push('members');
        break;

      case 'catalog':
        const catalog = await this.catalogsService.findOneById(entityId);
        if (!catalog) throw new NotFoundException('Catalog not found');
        hasPermission = await this.userGroupsService.canManageCatalog(
          currentUser,
          catalog,
        );
        if (!hasPermission) {
          throw new ForbiddenException(
            'Vous n\'avez pas l\'autorisation de gérer ce catalogue',
          );
        }
        validVisibility.push('members', 'subscribers');
        break;

      case 'vendor':
        const vendor = await this.vendorsService.findOne(entityId, true);
        if (!vendor) throw new NotFoundException('Vendor not found');
        // Check if user can manage vendor (super-admin, claimed vendor, or manages a catalog)
        if (currentUser.rights === 1) {
          hasPermission = true;
        } else if (vendor.userId === currentUser.id) {
          hasPermission = true;
        } else {
          // Check if user can manage a catalog of this vendor
          const catalogs = await this.catalogsService.findByVendor(vendor.id);
          const hasRights = await Promise.all(
            catalogs.map((c) => this.userGroupsService.canManageCatalog(currentUser, c)),
          );
          if (hasRights.includes(true)) {
            hasPermission = true;
          }
        }
        if (!hasPermission) {
          throw new ForbiddenException(
            'Vous n\'avez pas l\'autorisation de gérer ce fournisseur',
          );
        }
        break;

      default:
        throw new BadRequestException(`Invalid entity type: ${entityType}`);
    }

    // Validate visibility
    if (!validVisibility.includes(visibility)) {
      throw new BadRequestException(
        `Invalid visibility. Must be one of: ${validVisibility.join(', ')}`,
      );
    }

    // Create file
    const fileEntity = await this.filesService.createFromBytes(
      fileBuffer,
      documentName,
    );

    // Create entity file
    const entityFile = await this.entityFileService.updateOrCreate({
      entityType,
      entityId,
      documentType: 'document',
      fileId: fileEntity.id,
      data: visibility,
    } as EntityFileEntity);

    return entityFile;
  }

  @UseGuards(GqlAuthGuard)
  @Transactional()
  @Mutation(() => Int)
  async deleteDocument(
    @Args({ name: 'id', type: () => Int }) id: number,
    @CurrentUser() currentUser: UserEntity,
  ): Promise<number | null> {
    // Get the document
    const entityFile = await this.entityFileService.findOne(id);
    if (!entityFile) {
      throw new NotFoundException('Document not found');
    }

    // Validate entity exists and user has permission
    let hasPermission = false;

    switch (entityFile.entityType) {
      case 'group':
        const group = await this.groupsService.findOne(entityFile.entityId);
        if (!group) throw new NotFoundException('Group not found');
        hasPermission = await this.userGroupsService.isGroupAdmin(
          currentUser,
          entityFile.entityId,
        );
        if (!hasPermission) {
          throw new ForbiddenException(
            'Vous n\'avez pas l\'autorisation de gérer ce groupe',
          );
        }
        break;

      case 'catalog':
        const catalog = await this.catalogsService.findOneById(entityFile.entityId);
        if (!catalog) throw new NotFoundException('Catalog not found');
        hasPermission = await this.userGroupsService.canManageCatalog(
          currentUser,
          catalog,
        );
        if (!hasPermission) {
          throw new ForbiddenException(
            'Vous n\'avez pas l\'autorisation de gérer ce catalogue',
          );
        }
        break;

      case 'vendor':
        const vendor = await this.vendorsService.findOne(entityFile.entityId, true);
        if (!vendor) throw new NotFoundException('Vendor not found');
        // Check if user can manage vendor (super-admin, claimed vendor, or manages a catalog)
        if (currentUser.rights === 1) {
          hasPermission = true;
        } else if (vendor.userId === currentUser.id) {
          hasPermission = true;
        } else {
          // Check if user can manage a catalog of this vendor
          const catalogs = await this.catalogsService.findByVendor(vendor.id);
          const hasRights = await Promise.all(
            catalogs.map((c) => this.userGroupsService.canManageCatalog(currentUser, c)),
          );
          if (hasRights.includes(true)) {
            hasPermission = true;
          }
        }
        if (!hasPermission) {
          throw new ForbiddenException(
            'Vous n\'avez pas l\'autorisation de gérer ce fournisseur',
          );
        }
        break;

      default:
        throw new BadRequestException(`Invalid entity type: ${entityFile.entityType}`);
    }

    // Delete the file if it exists and is not used by other entity files
    if (entityFile.fileId) {
      // Check if other entity files reference this file
      const otherEntityFilesWithSameFile = await this.entityFileService.findByFileId(
        entityFile.fileId,
        id,
      );
      
      // If no other entity files reference this file, delete it
      if (otherEntityFilesWithSameFile.length === 0) {
        await this.filesService.delete(entityFile.fileId);
      }
    }

    // Delete the entity file
    const result = await this.entityFileService.delete(id);

    return result ?? -1;
  }
}

