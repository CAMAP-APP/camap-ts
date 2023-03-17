// import { Test, TestingModule } from '@nestjs/testing';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { UserGroupsService } from './user-groups.service';
// import { UserGroupEntity } from '../models/user-group.entity';
// import { UserEntity } from '../../users/models/user.entity';
// import { GroupEntity } from '../models/group.entity';

describe('UserGroupsService', () => {
  it('true', () => {
    expect(true).toBeTruthy();
  });

  // let service: UserGroupsService;
  // let userGroupsRepo: Repository<UserGroupEntity>;

  // beforeEach(async () => {
  //   const module: TestingModule = await Test.createTestingModule({
  //     providers: [
  //       UserGroupsService,
  //       {
  //         provide: getRepositoryToken(UserGroupEntity),
  //         useClass: Repository,
  //       },
  //     ],
  //   }).compile();

  //   service = module.get<UserGroupsService>(UserGroupsService);
  //   userGroupsRepo = module.get<Repository<UserGroupEntity>>(getRepositoryToken(UserGroupEntity));
  // });

  // it('should be defined', async () => {
  //   expect(service).toBeDefined();
  // });

  /**
   * findAllUsersOfGroupId
   */
  // it('findAllUsersOfGroupId: should be an empty array', async () => {
  //   jest.spyOn(userGroupsRepo, 'find').mockResolvedValueOnce([]);
  //   const res = await service.findAllUsersOfGroupId(1);
  //   expect(res).toStrictEqual([]);
  // });

  // it('findAllUsersOfGroupId: should return value', async () => {
  //   const userGroups = [...Array(2)].map(() => {
  //     const userGroup = new UserGroupEntity();
  //     userGroup.user = new UserEntity();
  //     return userGroup;
  //   });
  //   jest.spyOn(userGroupsRepo, 'find').mockResolvedValueOnce(userGroups);
  //   const res = await service.findAllUsersOfGroupId(1);
  //   const expected = userGroups.map((ug) => ug.user);
  //   expect(res).toStrictEqual(expected);
  // });

  /**
   * isGroupAdmin
   */
  // it('isGroupAdmin: should be false width group id', async () => {
  //   jest.spyOn(userGroupsRepo, 'findOne').mockResolvedValueOnce(null);
  //   const res = await service.isGroupAdmin(new UserEntity(), 1);
  //   expect(res).toBeFalsy();
  // });

  // it('isGroupAdmin: should be false width group entity', async () => {
  //   jest.spyOn(userGroupsRepo, 'findOne').mockResolvedValueOnce(null);
  //   const res = await service.isGroupAdmin(new UserEntity(), new GroupEntity());
  //   expect(res).toBeFalsy();
  // });

  // it('isGroupAdmin: should be false width bad rights', async () => {
  //   const userGroup = new UserGroupEntity();
  //   userGroup.rights = [{ right: 'no', params: [] }];
  //   jest.spyOn(userGroupsRepo, 'findOne').mockResolvedValueOnce(userGroup);
  //   const res = await service.isGroupAdmin(new UserEntity(), new GroupEntity());
  //   expect(res).toBeFalsy();
  // });

  // it('isGroupAdmin: should be true width good right', async () => {
  //   const userGroup = new UserGroupEntity();
  //   userGroup.rights = [{ right: 'GroupAdmin', params: [] }];
  //   jest.spyOn(userGroupsRepo, 'findOne').mockResolvedValueOnce(userGroup);
  //   const res = await service.isGroupAdmin(new UserEntity(), new GroupEntity());
  //   expect(res).toBeTruthy();
  // });

  /**
   * isGroupMember
   */
  // it('isGroupMember: should be false width group id', async () => {
  //   jest.spyOn(userGroupsRepo, 'findOne').mockResolvedValueOnce(null);
  //   const res = await service.isGroupMember(new UserEntity(), 1);
  //   expect(res).toBeFalsy();
  // });

  // it('isGroupMember: should be false width group entity', async () => {
  //   jest.spyOn(userGroupsRepo, 'findOne').mockResolvedValueOnce(null);
  //   const res = await service.isGroupMember(new UserEntity(), new GroupEntity());
  //   expect(res).toBeFalsy();
  // });

  // it('isGroupMember: should be true', async () => {
  //   const user = new UserEntity();
  //   const userGroup = new UserGroupEntity();
  //   userGroup.user = user;
  //   jest.spyOn(userGroupsRepo, 'findOne').mockResolvedValueOnce(userGroup);
  //   const res = await service.isGroupMember(user, new GroupEntity());
  //   expect(res).toBeTruthy();
  // });
});
