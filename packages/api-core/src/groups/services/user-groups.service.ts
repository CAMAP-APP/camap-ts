import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeepPartial,
  FindConditions,
  FindManyOptions,
  FindOneOptions,
  In,
  IsNull,
  Not,
  Repository,
} from 'typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { OrdersService } from '../../payments/services/orders.service';
import { UserEntity } from '../../users/models/user.entity';
import { UsersService } from '../../users/users.service';
import { CatalogEntity } from '../../vendors/entities/catalog.entity';
import { ProductsService } from '../../vendors/services/products.service';
import { GroupEntity } from '../entities/group.entity';
import { UserGroupEntity } from '../entities/user-group.entity';

export enum UserRight {
  groupAdmin = 'GroupAdmin',
  messages = 'Messages',
  members = 'Membership',
  catalogAdmin = 'ContractAdmin',
}

@Injectable()
export class UserGroupsService {
  constructor(
    @InjectRepository(UserGroupEntity)
    private readonly userGroupsRepo: Repository<UserGroupEntity>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
    private readonly ordersService: OrdersService,
  ) { }

  get(
    userOrId: UserEntity | number,
    groupId: number,
  ): Promise<UserGroupEntity | null> {
    const userId = typeof userOrId === 'number' ? userOrId : userOrId.id;

    return this.userGroupsRepo.findOne({ where: { userId, groupId } });
  }

  async getOrCreate(userId: number, groupId: number): Promise<UserGroupEntity> {
    const userGroup = await this.get(userId, groupId);
    if (userGroup) return userGroup;

    return this.create(userId, groupId);
  }

  async findAllUsersOfGroupId(
    groupId: number,
    exceptUserIds: number[] = [],
    sort = false,
  ) {
    const whereCondition: FindConditions<UserGroupEntity> = { groupId };
    if (exceptUserIds.length) {
      whereCondition.userId = Not(In(exceptUserIds));
    }
    const userGroups = await this.userGroupsRepo.find({
      where: whereCondition,
      relations: ['user'],
    });
    const users = await Promise.all(userGroups.map((ug) => ug.user));
    return !sort
      ? users
      : users.sort((a, b) => {
        const nameA = a.lastName.toUpperCase();
        const nameB = b.lastName.toUpperCase();
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      });
  }

  async findByIds(ids: number[]) {
    return this.usersService.findByIds(ids);
  }

  find(options: FindManyOptions<UserGroupEntity>) {
    return this.userGroupsRepo.find(options);
  }

  async count(findOption: FindOneOptions<UserGroupEntity>) {
    return this.userGroupsRepo.count(findOption);
  }
  async isGroupAdmin(
    user: UserEntity,
    groupOrId: GroupEntity | number,
  ): Promise<boolean> {
    // super-admin
    if (user.rights === 1) return true;

    const groupId = typeof groupOrId === 'number' ? groupOrId : groupOrId.id;

    return this.hasRight(user, groupId, UserRight.groupAdmin);
  }

  async isGroupMember(user: UserEntity, groupOrId: GroupEntity | number) {
    // super-admin
    if (user.rights === 1) return true;

    const groupId = typeof groupOrId === 'number' ? groupOrId : groupOrId.id;
    const ug = await this.get(user, groupId);
    if (!ug) return false;
    return Boolean(ug);
  }

  async canManageAllCatalogs(user: UserEntity, groupId: number): Promise<boolean> {
    return this.hasRight(user, groupId, UserRight.catalogAdmin);
  }

  async canManageMessages(user: UserEntity, groupId: number): Promise<boolean> {
    return this.hasRight(user, groupId, UserRight.messages);
  }

  async canManageMembers(
    user: UserEntity,
    groupOrId: GroupEntity | number,
  ): Promise<boolean> {
    const groupId = typeof groupOrId === 'number' ? groupOrId : groupOrId.id;
    return this.hasRight(user, groupId, UserRight.members);
  }

  async canManageCatalog(
    user: UserEntity,
    catalog: CatalogEntity,
  ): Promise<boolean> {
    // super-admin
    if (user.rights === 1) return true;

    const ug = await this.get(user, catalog.groupId);
    if (!ug || !ug.rights) return false;

    const catalogRights = ug.rights.filter(
      (r) => r.right === UserRight.catalogAdmin,
    );
    let hasRight = false;
    catalogRights.forEach((catalogRight) => {
      if (
        !catalogRight.params ||
        catalogRight.params.includes(catalog.id.toString())
      ) {
        hasRight = true;
      }
    });
    return hasRight;
  }

  private async hasRight(
    user: UserEntity,
    groupId: number,
    right: UserRight,
  ): Promise<boolean> {
    // super-admin
    if (user.rights === 1) return true;

    const ug = await this.get(user, groupId);
    if (!ug || !ug.rights) return false;
    return Boolean(ug.rights.find((r) => r.right === right));
  }

  async getNumberOfMembers(groupId: number) {
    return this.userGroupsRepo.count({ groupId });
  }

  async getNumberOfNewUsers(groupId: number) {
    const userGroups = await this.userGroupsRepo.find({ groupId });
    const userIds = userGroups.map((ug) => ug.userId);
    const r = await this.usersService.count({
      where: {
        ldate: IsNull(),
        id: In(userIds),
      },
      order: { lastName: 'ASC' },
    });
    return r;
  }

  async getNewUsers(groupId: number) {
    const userGroups = await this.userGroupsRepo.find({ groupId });

    const userIds = userGroups.map((ug) => ug.userId);
    return this.usersService.findByIds(userIds, {
      where: {
        ldate: IsNull(),
      },
      order: { lastName: 'ASC' },
    });
  }

  async findAllAdminsOfGroup(group: GroupEntity): Promise<UserEntity[]>;

  async findAllAdminsOfGroup(group: GroupEntity, getCount: boolean): Promise<number>;

  async findAllAdminsOfGroup(
    group: GroupEntity,
    getCount?: boolean,
  ): Promise<UserEntity[] | number> {
    const admins: UserEntity[] = [];
    const adminIds: Set<number> = new Set([]);

    const userGroups = await this.userGroupsRepo.find({
      where: { groupId: group.id, rights: Not(IsNull()) },
    });

    if (userGroups.length) {
      userGroups.forEach((ug) => {
        if (ug.rights !== null && ug.rights.length) {
          adminIds.add(ug.userId);
        }
      });
    }

    admins.push(
      ...(await Promise.all(
        [...adminIds].map((id) => this.usersService.findOne(id)),
      )),
    );

    return getCount ? adminIds.size : admins;
  }

  async findUsersWithGroupAdminRightInGroup(
    group: Pick<GroupEntity, 'id'>,
  ): Promise<UserEntity[]> {
    const userGroupsWithRights = await this.find({
      where: {
        groupId: group.id,
        rights: Not(IsNull()),
      },
    });
    const adminUserGroups = userGroupsWithRights.filter(
      (ug) => ug.rights && !!ug.rights.find((r) => r.right === UserRight.groupAdmin),
    );

    return Promise.all(
      adminUserGroups.map((ug) => this.usersService.findOne(ug.userId)),
    );
  }

  async findGroupsWithGroupAdminRightOfUser(userId: number): Promise<GroupEntity[]> {
    const userGroupsWithRights = await this.find({
      where: {
        userId,
        rights: Not(IsNull()),
      },
    });
    const adminUserGroups = userGroupsWithRights.filter(
      (ug) => ug.rights && !!ug.rights.find((r) => r.right === UserRight.groupAdmin),
    );

    return Promise.all(adminUserGroups.map((ug) => ug.group));
  }

  async getUsersInCatalog(groupId: number, catalogId: number): Promise<UserEntity[]>;

  async getUsersInCatalog(
    groupId: number,
    catalogId: number,
    getCount: boolean,
  ): Promise<number>;

  async getUsersInCatalog(
    groupId: number,
    catalogId: number,
    getCount?: boolean,
  ): Promise<UserEntity[] | number> {
    const products = await this.productsService.findByCatalogId(catalogId);
    const productsIds = products.map((p) => p.id);
    const usersWithOrderInCatalog =
      await this.ordersService.findUserOrdersByProductIds(productsIds);
    const members = await this.findAllUsersOfGroupId(groupId);
    const usersInCatalogsIds: Set<number> = new Set([]);
    usersWithOrderInCatalog.forEach((order) => {
      const isUser1Member = members.findIndex((m) => m.id === order.userId) !== -1;
      if (isUser1Member) usersInCatalogsIds.add(order.userId);
      const isUser2Member = members.findIndex((m) => m.id === order.userId2) !== -1;
      if (isUser2Member) usersInCatalogsIds.add(order.userId2);
    });

    if (getCount) return usersInCatalogsIds.size;

    const usersInCatalogs = await Promise.all(
      [...usersInCatalogsIds].map((id) => this.usersService.findOne(id)),
    );

    return usersInCatalogs;
  }

  async getUsersInDistribution(distributionId: number): Promise<UserEntity[]>;

  async getUsersInDistribution(
    distributionId: number,
    getCount: boolean,
  ): Promise<number>;

  async getUsersInDistribution(
    distributionId: number,
    getCount?: boolean,
  ): Promise<UserEntity[] | number> {
    const userOrdersInDistribution =
      await this.ordersService.findUserOrdersByDistributionIds([distributionId]);
    const userIds = userOrdersInDistribution.reduce((acc, uo) => {
      acc.add(uo.userId);
      if (uo.userId2) acc.add(uo.userId2);
      return acc;
    }, new Set<number>());

    if (getCount) {
      return userIds.size;
    }

    return Promise.all([...userIds].map((uId) => this.usersService.findOne(uId)));
  }

  @Transactional()
  async create(userId: number, groupId: number): Promise<UserGroupEntity> {
    return this.userGroupsRepo.save({
      userId,
      groupId,
    });
  }

  @Transactional()
  async delete(userGroup: UserGroupEntity) {
    await this.userGroupsRepo.delete({
      groupId: userGroup.groupId,
      userId: userGroup.userId,
    });
    return userGroup;
  }

  @Transactional()
  async update(
    userId: number,
    groupId: number,
    userGroup: DeepPartial<UserGroupEntity>,
  ) {
    return this.userGroupsRepo.update({ userId, groupId }, userGroup);
  }

  userGroupEntityIsAGroupAdmin(userGroup: UserGroupEntity) {
    if (!userGroup.rights) return false;
    if (userGroup.rights.find((r) => r.right === UserRight.groupAdmin)) return true;
    return false;
  }
}
