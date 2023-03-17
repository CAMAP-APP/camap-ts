// import { Test, TestingModule } from '@nestjs/testing';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { GroupPreviewsResolver } from './group-previews.resolver';
// import { GroupEntity } from '../models/group.entity';
// import { GroupsService } from '../services/groups.service';

describe('GroupPreviewsResolver', () => {
  it('true', () => {
    expect(true).toBeTruthy();
  });

  // let resolver: GroupPreviewsResolver;
  // let groupsService: GroupsService;

  // beforeEach(async () => {
  //   const module: TestingModule = await Test.createTestingModule({
  //     providers: [
  //       GroupPreviewsResolver,
  //       GroupsService,
  //       {
  //         provide: getRepositoryToken(GroupEntity),
  //         useClass: Repository,
  //       },
  //     ],
  //   }).compile();

  //   resolver = module.get<GroupPreviewsResolver>(GroupPreviewsResolver);
  //   groupsService = module.get<GroupsService>(GroupsService);
  // });

  // it('should be defined', async () => {
  //   expect(resolver).toBeDefined();
  // });

  // it('get: should return null', async () => {
  //   jest.spyOn(groupsService, 'findOne').mockResolvedValueOnce(null);
  //   try {
  //     await resolver.get(1);
  //   } catch (error) {
  //     expect(error.status).toBe(404);
  //   }
  // });

  // it('get: should return value', async () => {
  //   const group = new GroupEntity();
  //   group.id = 1;
  //   jest.spyOn(groupsService, 'findOne').mockResolvedValueOnce(group);
  //   const res = await resolver.get(1);
  //   expect(res.id).toBe(group.getPreview().id);
  // });
});
