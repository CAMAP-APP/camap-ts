import { NotFoundException, UnauthorizedException, UseGuards } from '@nestjs/common';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  format,
  isAfter,
  isSameDay,
  parseISO,
  setHours,
  setMilliseconds,
  setMinutes,
  setSeconds,
  subMilliseconds,
  subMonths,
  subYears,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  In,
  Repository,
} from 'typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { DB_DATE_FORMAT } from '../common/constants';
import { setFlag, unsetFlag } from '../common/haxeCompat';
import { checkDeleted, convertAllEmptyStringsToNull } from '../common/utils';
import { CsaSubscriptionsService } from '../groups/services/csa-subscriptions.service';
import { GroupsService } from '../groups/services/groups.service';
import { MembershipsService } from '../groups/services/memberships.service';
import { UserGroupsService } from '../groups/services/user-groups.service';
import { MailsService } from '../mails/mails.service';
import { OrdersService } from '../payments/services/orders.service';
import { PaymentsService } from '../payments/services/payments.service';
import { UserOrderEntity } from '../shop/entities/user-order.entity';
import { CryptoService } from '../tools/crypto.service';
import { SessionEntity } from '../tools/models/session.entity';
import { VariableService } from '../tools/variable.service';
import { CatalogEntity } from '../vendors/entities/catalog.entity';
import { CatalogsService } from '../vendors/services/catalogs.service';
import { ProductsService } from '../vendors/services/products.service';
import { UserFlags } from './models/user-flags';
import { UserEntity } from './models/user.entity';
import { UpdateUserMailAlreadyInUse, UserNotFound } from './user-errors';

@Injectable()
export class UsersService {
  private readonly cronLogger = new Logger('UsersService CRON');

  constructor(
    @InjectRepository(UserEntity) private readonly usersRepo: Repository<UserEntity>,
    @InjectRepository(SessionEntity)
    private readonly sessionRepo: Repository<SessionEntity>,
    private readonly productsService: ProductsService,
    @Inject(forwardRef(() => OrdersService))
    private readonly ordersService: OrdersService,
    @Inject(forwardRef(() => UserGroupsService))
    private readonly userGroupsService: UserGroupsService,
    private readonly cryptoService: CryptoService,
    private readonly mailsService: MailsService,
    @Inject(forwardRef(() => CatalogsService))
    private readonly catalogsService: CatalogsService,
    @Inject(forwardRef(() => GroupsService))
    private readonly groupsService: GroupsService,
    @Inject(forwardRef(() => PaymentsService))
    private readonly paymentsService: PaymentsService,
    @Inject(forwardRef(() => MembershipsService))
    private readonly membershipsService: MembershipsService,
    @Inject(forwardRef(() => CsaSubscriptionsService))
    private readonly csaSubscriptionService: CsaSubscriptionsService,
    private readonly variableService: VariableService,
  ) { }

  async lock(id: number) {
    return this.usersRepo.findOne(id, {
      lock: { mode: 'pessimistic_write' },
    });
  }

  async find(options?: FindManyOptions<UserEntity>) {
    return this.usersRepo.find(options);
  }

  async findOne(id: number) {
    return this.usersRepo.findOne(id);
  }

  async findOneByEmail(
    email: string,
    lock = false,
  ): Promise<Pick<UserEntity, 'id' | 'email' | 'pass' | 'pass2'>> {
    return this.usersRepo.findOne({
      select: ['id', 'pass', 'pass2', 'email'],
      where: [{ email }, { email2: email }],
      ...(lock ? { lock: { mode: 'pessimistic_write' } } : {}),
    });
  }

  async findByEmails(emails: string[]) {
    return this.usersRepo.find({
      where: [{ email: In(emails) }, { email2: In(emails) }],
    });
  }

  async findOneBySid(sid: string): Promise<UserEntity> {
    const session = await this.sessionRepo.findOne({ where: { sid } });
    return session ? session.user : null;
  }

  async findByIds(ids: number[], options?: FindManyOptions<UserEntity>) {
    return this.usersRepo.findByIds(ids, options);
  }

  async count(findOption: FindOneOptions<UserEntity>) {
    return this.usersRepo.count(findOption);
  }

  @Transactional()
  async update(user: DeepPartial<UserEntity>) {
    // options?: { skipGroupLegalReprValidation?: boolean }
    // if (!options || !options.skipGroupLegalReprValidation) {
    //   const isAGroupLegalRepr = await this.groupsService.userIsAGroupLegalRepr(user.id);
    //   if (isAGroupLegalRepr) {
    //     try {
    //       await groupLegalReprSchema.validate(user);
    //     } catch (error) {
    //       throw new ValidationException(error);
    //     }
    //   }
    // }
    const sameMailUser = user.email && (await this.findOneByEmail(user.email));
    const sameMailUser2 = user.email2 && (await this.findOneByEmail(user.email2));
    if (
      (sameMailUser && sameMailUser.id !== user.id) ||
      (!!user.email2 && !!user.email && user.email2 === user.email) ||
      (sameMailUser2 && sameMailUser2.id !== user.id)
    ) {
      throw new UpdateUserMailAlreadyInUse();
    }
    return this.usersRepo.save(convertAllEmptyStringsToNull(user));
  }

  @Transactional()
  async updateNotifications(
    idOrEntity: number | UserEntity,
    {
      hasEmailNotif4h,
      hasEmailNotif24h,
      hasEmailNotifOuverture,
    }: {
      hasEmailNotif4h?: boolean;
      hasEmailNotif24h?: boolean;
      hasEmailNotifOuverture?: boolean;
    },
  ) {
    const user =
      typeof idOrEntity === 'number' ? await this.findOne(idOrEntity) : idOrEntity;
    if (!user) {
      throw new UserNotFound(
        typeof idOrEntity === 'number' ? idOrEntity : idOrEntity.id,
      );
    }
    await this.lock(user.id);
    if (hasEmailNotif4h !== undefined) {
      user.flags = hasEmailNotif4h
        ? setFlag(UserFlags.HasEmailNotif4h, user.flags)
        : unsetFlag(UserFlags.HasEmailNotif4h, user.flags);
    }
    if (hasEmailNotif24h !== undefined) {
      user.flags = hasEmailNotif24h
        ? setFlag(UserFlags.HasEmailNotif24h, user.flags)
        : unsetFlag(UserFlags.HasEmailNotif24h, user.flags);
    }
    if (hasEmailNotifOuverture !== undefined) {
      user.flags = hasEmailNotifOuverture
        ? setFlag(UserFlags.HasEmailNotifOuverture, user.flags)
        : unsetFlag(UserFlags.HasEmailNotifOuverture, user.flags);
    }
    return this.usersRepo.save(user);
  }

  async getUserIfRefreshTokenMatches(
    refreshToken: string,
    userId: number,
  ): Promise<UserEntity | undefined> {
    const user = await this.findOne(userId);

    const isRefreshTokenMatching = await this.cryptoService.bcryptCompare(
      refreshToken,
      user.currentRefreshToken,
    );

    if (!isRefreshTokenMatching) return;

    return user;
  }

  @Transactional()
  async setCurrentRefreshToken(refreshToken: string, userId: number) {
    await this.lock(userId);
    const currentHashedRefreshToken = await this.cryptoService.bcrypt(refreshToken);
    await this.usersRepo.update(userId, {
      currentRefreshToken: currentHashedRefreshToken,
      ldate: new Date(),
    });
  }

  @Transactional()
  async removeRefreshToken(userId: number) {
    await this.lock(userId);
    return this.usersRepo.update(userId, {
      currentRefreshToken: null,
    });
  }

  private async getUsersIdFromUserOrders(
    userOrders: UserOrderEntity[],
    groupId: number,
  ): Promise<number[]> {
    const members = await this.userGroupsService.findAllUsersOfGroupId(groupId);
    const usersIds: Set<number> = new Set([]);

    userOrders.forEach((order) => {
      // Filter out non-members
      const isUser1Member = members.findIndex((m) => m.id === order.userId) !== -1;
      const isUser2Member = members.findIndex((m) => m.id === order.userId2) !== -1;

      if (isUser1Member) usersIds.add(order.userId);
      if (isUser2Member) usersIds.add(order.userId2);
    });

    return [...usersIds];
  }

  private async getUsersIdWithOrdersInActiveCatalogs(
    groupId: number,
    activeCatalogs?: CatalogEntity[],
  ): Promise<number[]> {
    const products = await this.productsService.getFromActiveCatalogsInGroup(
      groupId,
      activeCatalogs,
    );
    const productsId = products.map((p) => p.id);
    const usersOrders = productsId.length
      ? await this.ordersService.findUserOrdersByProductIds(productsId)
      : [];

    return this.getUsersIdFromUserOrders(usersOrders, groupId);
  }

  async getUsersWithOrdersInActiveCatalogs(groupId: number): Promise<UserEntity[]>;

  async getUsersWithOrdersInActiveCatalogs(
    groupId: number,
    getCount: boolean,
  ): Promise<number>;

  async getUsersWithOrdersInActiveCatalogs(
    groupId: number,
    getCount?: boolean,
  ): Promise<UserEntity[] | number> {
    const usersIdWithOrders = await this.getUsersIdWithOrdersInActiveCatalogs(
      groupId,
    );

    if (getCount) return usersIdWithOrders.length;

    return this.findByIds(usersIdWithOrders);
  }

  async getUsersWithoutOrdersInActiveCatalogs(
    groupId: number,
    activeCatalogs?: CatalogEntity[],
  ): Promise<UserEntity[]> {
    const usersIdWithOrders = await this.getUsersIdWithOrdersInActiveCatalogs(
      groupId,
      activeCatalogs,
    );

    return this.userGroupsService.findAllUsersOfGroupId(groupId, usersIdWithOrders);
  }

  async getUsersWithCommandInDistribution(
    distributionsId: number[],
    groupId: number,
  ): Promise<UserEntity[]>;

  async getUsersWithCommandInDistribution(
    distributionsId: number[],
    groupId: number,
    getCount: boolean,
  ): Promise<number>;

  async getUsersWithCommandInDistribution(
    distributionsId: number[],
    groupId: number,
    getCount?: boolean,
  ): Promise<UserEntity[] | number> {
    const userOrders = await this.ordersService.findUserOrdersByDistributionIds(
      distributionsId,
    );
    const usersIdWithCommandInDistribution = await this.getUsersIdFromUserOrders(
      userOrders,
      groupId,
    );

    if (getCount) return usersIdWithCommandInDistribution.length;

    return this.findByIds(usersIdWithCommandInDistribution);
  }

  @Transactional()
  async create(user: UserEntity) {
    return this.usersRepo.save({
      ...convertAllEmptyStringsToNull(user),
      cdate: new Date(),
    });
  }

  @Transactional()
  async delete(user: Pick<UserEntity, 'id'>, deletedUser?: Pick<UserEntity, 'id'>) {
    let deletedUserId = deletedUser?.id;
    if (!deletedUserId) {
      deletedUserId = (await this.findOneByEmail('deleted@camap.tld')).id;
    }
    const userId = user.id;
    // Never delete the DeletedUser
    if (userId === deletedUserId) return null;

    //AJOUT CONTROLE
    // Bloquer suppression compte si commandes < 2 mois
    let twoMonthsAgo = subMonths(new Date(), 2);

    // Don't delete those who still have orders in less than 2 months
    let orders1 = await this.ordersService.findPartialUserOrdersByUserId(
      user.id,
    );
    orders1 = orders1.filter((o) => {
      if (!o) return false;
      let date = typeof o.date === 'string' ? parseISO(o.date) : o.date;
      return isAfter(date, twoMonthsAgo);
    });
    if (orders1.length > 0) {
      throw new UnauthorizedException(
        `Impossible de supprimer votre compte ${userId} vous avez des commandes trop récentes (< 2 mois)`,
      );
    }
    let orders2 = await this.ordersService.findPartialUserOrdersByUserId2(
      user.id,
    );
    orders2 = orders2.filter((o) => {
      if (!o) return false;
      let date = typeof o.date === 'string' ? parseISO(o.date) : o.date;
      return isAfter(date, twoMonthsAgo);
    });
    if (orders2.length > 0) {
      throw new UnauthorizedException(
        `Impossible de supprimer votre compte ${userId} vous avez des commandes trop récentes (< 2 mois)`,
      );
    }
    // Bloquer suppression si solde < 0 sur un groupe
    // Trouver les groupes auquel appartient l'utilisateur
    const userGroups = await this.userGroupsService.find({
      where: { userId: user.id },
    });
    // Check du solde pour chaque groupe 
    if (userGroups.length) {
      userGroups.forEach((ug) => {
        if (ug.balance < 0) {
          //throw new Error('Vous ne pouvez pas quitter ce groupe, votre solde est négatif: solde = ${ug.balance}€');
          throw new UnauthorizedException(
            `Vous ne pouvez pas quitter ce groupe, votre solde est négatif: groupe: ${ug.groupId}, solde = ${ug.balance}€`,
          );
        }
      });
    }

    //FIN AJOUT

    // Replace contacts
    const catalogs = await this.catalogsService.findByContact(userId);
    if (catalogs && catalogs.length) {
      await this.catalogsService.update(
        catalogs.map((c) => c.id),
        { userId: deletedUserId },
      );
    }
    const groups = await this.groupsService.find({ where: { userId } });
    if (groups && groups.length) {
      await this.groupsService.updateMany(
        groups.map((g) => g.id),
        { userId: deletedUserId },
      );
    }

    await this.ordersService.attributeBasketsToDeletedUser(userId, deletedUserId);

    const operations = await this.paymentsService.findPartialByUserId(userId);
    if (operations && operations.length) {
      const operationsToDelete = operations.filter((o) => !o.amount);
      const operationsToUpdate = operations.filter((o) => !!o.amount);
      if (operationsToUpdate && operationsToUpdate.length)
        await this.paymentsService.updateOperations(
          operationsToUpdate.map((o) => o.id),
          { userId: deletedUserId },
        );
      await Promise.all(
        operationsToDelete.map((operation) => {
          return this.paymentsService.deleteOperation(operation);
        }),
      );
    }

    const csaSubscriptions = await this.csaSubscriptionService.findByUserId(userId);
    if (csaSubscriptions && csaSubscriptions.length) {
      await this.csaSubscriptionService.update(
        csaSubscriptions.map((s) => s.id),
        { userId: deletedUserId },
      );
    }

    const result = await this.usersRepo.delete(userId);
    return checkDeleted(result) ? userId : null;
  }

  /**
   * Clean old users every night after sending them 3 warnings emails.
   */
  @Transactional()
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async cleanUsers() {
    this.cronLogger.log('Start to clean users');
    let now = new Date();
    // Get now to be at midnight today
    now = setHours(now, 0);
    now = setMinutes(now, 0);
    now = setSeconds(now, 0);
    now = setMilliseconds(now, 0);
    let twoYearsAgo = subYears(now, 2);

    // 1st warning : one month before
    let firstWarningDate = addMonths(twoYearsAgo, 1);
    firstWarningDate = addDays(firstWarningDate, 1);
    firstWarningDate = subMilliseconds(firstWarningDate, 1);
    // 2nd warning : two weeks before
    const secondWarningDate = addWeeks(twoYearsAgo, 2);
    // 3rd warning : three days before
    const thirdWarningDate = addDays(twoYearsAgo, 3);

    /**
     *  Users to warn by email
     */
    let warningsUsers = await this.usersRepo
      .createQueryBuilder('u')
      .select('u.id, u.firstName, u.lastName, u.email, u.ldate')
      .where(
        `u.ldate BETWEEN '${format(twoYearsAgo, DB_DATE_FORMAT)}' AND '${format(
          firstWarningDate,
          DB_DATE_FORMAT,
        )}'`,
      )
      .getRawMany<
        Pick<UserEntity, 'id' | 'firstName' | 'lastName' | 'email' | 'ldate'>
      >();

    // Don't delete those who still have an active membership
    const activeMemberships = await Promise.all(
      warningsUsers.map((u) =>
        this.membershipsService.getActiveMembershipsForUser(u.id),
      ),
    );
    warningsUsers = warningsUsers.filter((_, index) => {
      return !activeMemberships[index];
    });

    const firstWarningUsers = warningsUsers.filter((u) =>
      isSameDay(u.ldate, firstWarningDate),
    );
    const secondWarningUsers = warningsUsers.filter((u) =>
      isSameDay(u.ldate, secondWarningDate),
    );
    const thirdWarningUsers = warningsUsers.filter((u) =>
      isSameDay(u.ldate, thirdWarningDate),
    );

    this.cronLogger.log(
      `Send warnings emails. One month: ${firstWarningUsers.length} users. Two weeks: ${secondWarningUsers.length} users. Three days: ${thirdWarningUsers.length} users.`,
    );

    // Send emails
    const formatUsers = (
      users: Pick<UserEntity, 'id' | 'firstName' | 'lastName' | 'email'>[],
    ) =>
      users.map((u) => ({
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        id: u.id,
      }));
    const formatDate = (date: Date) =>
      format(addYears(date, 2), 'dd/MM/yyyy', { locale: fr });

    const theme = await this.variableService.getTheme();

    if (firstWarningUsers.length)
      await this.mailsService.createBufferedJsonMail(
        'deletionWarning.twig',
        { deletionDate: formatDate(firstWarningDate) },
        `Votre compte ${theme.name} va être supprimé dans 1 mois.`,
        formatUsers(firstWarningUsers),
      );

    if (secondWarningUsers.length)
      await this.mailsService.createBufferedJsonMail(
        'deletionWarning.twig',
        { deletionDate: formatDate(secondWarningDate) },
        `Votre compte ${theme.name} va être supprimé dans 2 semaines.`,
        formatUsers(secondWarningUsers),
      );

    if (thirdWarningUsers.length)
      await this.mailsService.createBufferedJsonMail(
        'deletionWarning.twig',
        { deletionDate: formatDate(thirdWarningDate) },
        `Votre compte ${theme.name} va être supprimé dans 3 jours.`,
        formatUsers(thirdWarningUsers),
      );

    /**
     *  Users to delete
     */

    // Delete users
    const deletedUser = await this.findOneByEmail('deleted@camap.tld');

    // Users who have never logged in and who have not logged in in more than 2 years,
    // except those who have been created less than 6 months ago
    // and except those who have still a valid membership
    // and except those who have orders in less than 2 years.
    let sixMonthsAgo = subMonths(new Date(), 6);
    (
      await this.usersRepo
        .createQueryBuilder('u')
        .select('u.id, u.firstName, u.lastName, u.email, u.ldate')
        .where(
          `u.ldate < '${format(
            twoYearsAgo,
            DB_DATE_FORMAT,
          )}' OR (u.ldate IS null AND u.cdate < '${format(
            sixMonthsAgo,
            DB_DATE_FORMAT,
          )}')`,
        )
        .stream()
    ).on(
      'data',
      async (
        chunk: Pick<UserEntity, 'id' | 'firstName' | 'lastName' | 'email' | 'ldate'>,
      ) => {
        // Don't delete those who still have an active membership
        const activeMembership =
          await this.membershipsService.getActiveMembershipsForUser(chunk.id);
        if (activeMembership) return;
        // Don't delete those who still have orders in less than 2 years
        let orders1 = await this.ordersService.findPartialUserOrdersByUserId(
          chunk.id,
        );
        orders1 = orders1.filter((o) => {
          if (!o) return false;
          let date = typeof o.date === 'string' ? parseISO(o.date) : o.date;
          return isAfter(date, twoYearsAgo);
        });
        if (orders1.length > 0) return;

        let orders2 = await this.ordersService.findPartialUserOrdersByUserId2(
          chunk.id,
        );
        orders2 = orders2.filter((o) => {
          if (!o) return false;
          let date = typeof o.date === 'string' ? parseISO(o.date) : o.date;
          return isAfter(date, twoYearsAgo);
        });
        if (orders2.length > 0) return;

        this.cronLogger.log(`Delete old user #${chunk.id}.`);
        this.delete(chunk, deletedUser);
      },
    );
  }
}
