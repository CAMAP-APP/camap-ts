import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Unit } from 'camap-common';
import {
  addDays,
  addHours,
  addMonths,
  addYears,
  setMilliseconds,
  startOfDay,
  subDays,
  subMonths,
  subYears,
} from 'date-fns';
import * as faker from 'faker';
import { readdirSync } from 'fs';
import { join } from 'path';
import { Connection, Repository } from 'typeorm';
import { setFlag } from '../common/haxeCompat';
import { CsaSubscriptionEntity } from '../groups/entities/csa-subscription.entity';
import { GroupEntity } from '../groups/entities/group.entity';
import { UserGroupEntity } from '../groups/entities/user-group.entity';
import { VolunteerRoleEntity } from '../groups/entities/volunteer-role.entity';
import { GroupFlags } from '../groups/types/interfaces';
import {
  OperationData,
  OperationEntity,
} from '../payments/entities/operation.entity';
import { PaymentTypeId } from '../payments/interfaces';
import { OperationType } from '../payments/OperationType';
import { PlaceEntity } from '../places/models/place.entity';
import { BasketEntity, BasketStatus } from '../shop/entities/basket.entity';
import { DistributionEntity } from '../shop/entities/distribution.entity';
import {
  MultiDistribEntity,
  MultiDistribValidatedStatus,
} from '../shop/entities/multi-distrib.entity';
import { UserOrderEntity } from '../shop/entities/user-order.entity';
import { VariableEntity } from '../tools/models/variable.entity';
import { VariableNames } from '../tools/variable.service';
import { RightSite, UserEntity } from '../users/models/user.entity';
import { CatalogType } from '../vendors/catalog.interface';
import { CatalogEntity, CatalogFlags } from '../vendors/entities/catalog.entity';
import { ProductEntity } from '../vendors/entities/product.entity';
import {
  BetaFlags,
  VendorDisabledReason,
  VendorEntity,
} from '../vendors/entities/vendor.entity';

const getIdFromIdOrEntity = (idOrEntity: number | { id: number }) => {
  if (typeof idOrEntity === 'number') return idOrEntity;
  return idOrEntity.id;
};

interface GenPlaceProps {
  name?: string;
  zipCode?: string;
  city?: string;
  lat?: number | null;
  lng?: number | null;
  groupIdOrEntity?: GroupEntity | number;
}
const genPlace = async (
  app: INestApplication,
  { name, zipCode, city, lat, lng, groupIdOrEntity }: GenPlaceProps,
) => {
  const repo = app.get<Repository<PlaceEntity>>(getRepositoryToken(PlaceEntity));

  let groupId: number;

  if (!groupIdOrEntity) {
    groupId = (await genGroup(app, {})).id;
  } else if (typeof groupIdOrEntity === 'number') {
    groupId = groupIdOrEntity;
  } else {
    groupId = groupIdOrEntity.id;
  }

  return repo.save(
    repo.create({
      name: name || faker.random.words(2),
      zipCode: zipCode || faker.address.zipCode('###00'),
      city: city || faker.address.cityName(),
      lat: lat === undefined ? parseFloat(faker.address.latitude()) : lat,
      lng: lng === undefined ? parseFloat(faker.address.longitude()) : lng,
      address1: faker.address.streetAddress(),
      groupId,
    }),
  );
};

interface GenGroupProps {
  id?: number;
  name?: string;
  flags?: GroupFlags[] | null;
  allowedPaymentsType?: PaymentTypeId[];
  hasMembership?: boolean;
  regOption?: number;
  userIdOrEntity?: number | UserEntity;
  placeIdOrEntity?: number | PlaceEntity;
}
const genGroup = async (
  app: INestApplication,
  {
    id,
    name,
    flags = [],
    allowedPaymentsType,
    hasMembership,
    regOption,
    userIdOrEntity,
    placeIdOrEntity,
  }: GenGroupProps,
) => {
  const repo = app.get<Repository<GroupEntity>>(getRepositoryToken(GroupEntity));

  let userId = undefined;
  if (typeof userIdOrEntity === 'number') {
    userId = userIdOrEntity;
  } else if (userIdOrEntity) {
    userId = userIdOrEntity.id;
  }

  let placeId = undefined;
  if (placeIdOrEntity) {
    if (typeof placeIdOrEntity === 'number') {
      placeId = placeIdOrEntity;
    } else {
      placeId = placeIdOrEntity.id;
    }
  }

  let entity = repo.create({
    id,
    name: name || faker.company.companyName(),
    hasMembership,
    regOption,
    ...(allowedPaymentsType
      ? {
        allowedPaymentsType,
        currencyCode: 'EUR',
        currency: '€',
      }
      : {}),
    userId,
    placeId,
  });

  if (flags) {
    for (const flag of flags) {
      entity.flags = setFlag(flag, entity.flags);
    }
  }

  entity = await repo.save(entity);

  if (!placeId) {
    entity.placeId = (
      await genPlace(app, {
        groupIdOrEntity: entity,
      })
    ).id;
    entity = await repo.save(entity);
  }

  return repo.findOne(entity.id);
};

interface GenMultiDistribProps {
  id?: number;
  orderStartDate?: Date;
  orderEndDate?: Date;
  distribStartDate?: Date;
  distribEndDate?: Date;
  groupIdOrEntity?: number | GroupEntity;
  placeIdOrEntity?: number | PlaceEntity;
  validatedStatus?: MultiDistribValidatedStatus;
  volunteerRolesIds?: number[];
  validatedDate?: Date;
}
const genMultiDistrib = async (
  app: INestApplication,
  {
    id,
    orderStartDate,
    orderEndDate,
    distribStartDate,
    distribEndDate,
    groupIdOrEntity,
    placeIdOrEntity,
    validatedStatus = MultiDistribValidatedStatus.NOT_VALIDATED,
    volunteerRolesIds,
    validatedDate,
  }: GenMultiDistribProps,
) => {
  const repo = app.get<Repository<MultiDistribEntity>>(
    getRepositoryToken(MultiDistribEntity),
  );

  let groupId: number;
  let placeId: number;

  if (!groupIdOrEntity) {
    groupId = (await genGroup(app, {})).id;
  } else if (typeof groupIdOrEntity == 'number') {
    groupId = groupIdOrEntity;
  } else {
    groupId = groupIdOrEntity.id;
  }

  if (!placeIdOrEntity) {
    placeId = (await genPlace(app, {})).id;
  } else if (typeof placeIdOrEntity == 'number') {
    placeId = placeIdOrEntity;
  } else {
    placeId = placeIdOrEntity.id;
  }
  const now = setMilliseconds(new Date(), 0); // MySQL does not store milliseconds
  const raw_distribStartDate =
    distribStartDate || addHours(startOfDay(addDays(now, 11)), 12);
  const raw_distribEndDate = distribEndDate || addHours(raw_distribStartDate, 2);
  return repo.save(
    repo.create({
      id,
      groupId,
      raw_orderStartDate: orderStartDate || subDays(now, 10),
      raw_orderEndDate: orderEndDate || addDays(now, 10),
      raw_distribStartDate,
      raw_distribEndDate,
      placeId,
      validatedStatus,
      volunteerRolesIds,
      validatedDate,
    }),
  );
};

interface GenBasketProps {
  status: BasketStatus;
  id?: number;
  multiDistribIdOrEntity?: number | MultiDistribEntity;
  userIdOrEntity?: number | UserEntity;
  num?: number;
  total?: number;
}
const genBasket = async (
  app: INestApplication,
  { status, id, multiDistribIdOrEntity, userIdOrEntity, num, total }: GenBasketProps,
) => {
  const repo = app.get<Repository<BasketEntity>>(getRepositoryToken(BasketEntity));

  let multiDistribId: number;
  let userId: number | undefined = undefined;

  if (!multiDistribIdOrEntity) {
    multiDistribId = (await genMultiDistrib(app, {})).id;
  } else if (typeof multiDistribIdOrEntity === 'number') {
    multiDistribId = multiDistribIdOrEntity;
  } else {
    multiDistribId = multiDistribIdOrEntity.id;
  }

  if (!userIdOrEntity) {
    userId = undefined;
  } else if (typeof userIdOrEntity == 'number') {
    userId = userIdOrEntity;
  } else {
    userId = userIdOrEntity.id;
  }

  return repo.save(
    repo.create({
      id,
      multiDistribId,
      status,
      userId,
      num,
      total,
    }),
  );
};

interface GenUserProps {
  id?: number;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  rights?: RightSite[];
}
const genUser = async (
  app: INestApplication,
  { rights, ...props }: GenUserProps,
) => {
  const repo = app.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));

  const firstName = props.firstName || faker.name.firstName();
  const lastName = props.lastName || faker.name.lastName();

  const entity = repo.create({
    ...props,
    email: props.email || faker.internet.email(firstName, lastName),
    pass2: await bcrypt.hash('admin', 10),
    firstName,
    lastName,
  });

  for (const right of rights || []) {
    entity.rights = setFlag(right, entity.rights);
  }

  return repo.save(entity);
};

interface GenVendorProps {
  id?: number;
  name?: string;
  email?: string;
  address1?: string;
  zipCode?: string;
  city?: string;
  disabled?: VendorDisabledReason;
  betaFlags?: BetaFlags[];
}
const genVendor = async (
  app: INestApplication,
  { id, name, email, address1, zipCode, city, disabled }: GenVendorProps,
) => {
  const repo = app.get<Repository<VendorEntity>>(getRepositoryToken(VendorEntity));

  let vendor = repo.create({
    id,
    name,
    cdate: new Date(),
    email: email || faker.internet.email(),
    address1: address1 || faker.address.streetAddress(),
    zipCode: zipCode || faker.address.zipCode(),
    city: city || faker.address.city(),
    raw_disabled: disabled || null,
    country: 'FR',
  });

  vendor = await repo.save(vendor);

  return vendor;
};

interface GenCatalogProps {
  id?: number;
  name?: string;
  groupIdOrdEntity?: number | GroupEntity;
  vendorIdOrdEntity?: number | VendorEntity;
  distribIdOrdEntity?: number | DistributionEntity;
  startDate?: Date;
  endDate?: Date;
  flags?: CatalogFlags[] | null;
  type?: CatalogType;
  distribMinOrdersTotal?: number;
  orderStartDaysBeforeDistrib?: number;
  orderEndHoursBeforeDistrib?: number;
}
const genCatalog = async (
  app: INestApplication,
  {
    id,
    name,
    groupIdOrdEntity,
    vendorIdOrdEntity,
    startDate,
    endDate,
    flags = [CatalogFlags.UsersCanOrder],
    type = CatalogType.TYPE_VARORDER,
    distribMinOrdersTotal,
    orderStartDaysBeforeDistrib,
    orderEndHoursBeforeDistrib,
  }: GenCatalogProps,
) => {
  const repo = app.get<Repository<CatalogEntity>>(getRepositoryToken(CatalogEntity));
  let groupId: number;
  let vendorId: number;

  if (!groupIdOrdEntity) {
    groupId = (await genGroup(app, {})).id;
  } else if (typeof groupIdOrdEntity === 'number') {
    groupId = groupIdOrdEntity;
  } else {
    groupId = groupIdOrdEntity.id;
  }

  if (!vendorIdOrdEntity) {
    vendorId = (await genVendor(app, {})).id;
  } else if (typeof vendorIdOrdEntity === 'number') {
    vendorId = vendorIdOrdEntity;
  } else {
    vendorId = vendorIdOrdEntity.id;
  }

  const entity = repo.create({
    id,
    name: name || faker.commerce.department(),
    groupId,
    vendorId,
    startDate: startDate || subYears(new Date(), 1),
    endDate: endDate || addYears(new Date(), 1),
    type,
    distribMinOrdersTotal,
    orderStartDaysBeforeDistrib,
    orderEndHoursBeforeDistrib,
  });

  if (flags) {
    for (const flag of flags) {
      entity.flags = setFlag(flag, entity.flags);
    }
  }

  return repo.save(entity);
};

interface GenProductProps {
  id?: number;
  name?: string;
  qt?: number;
  unitType?: Unit;
  price?: number;
  active?: boolean;
  catalogIdOrEntity?: number | CatalogEntity;
  stock?: number;
  multiWeight?: boolean;
  wholesale?: boolean;
  variablePrice?: boolean;
  bulk?: boolean;
  ref?: string;
}
const genProduct = async (
  app: INestApplication,
  {
    id,
    name,
    qt,
    unitType,
    price,
    active = true,
    catalogIdOrEntity,
    stock,
    multiWeight = false,
    wholesale = false,
    variablePrice = false,
    bulk = false,
    ref,
  }: GenProductProps,
) => {
  const repo = app.get<Repository<ProductEntity>>(getRepositoryToken(ProductEntity));
  let catalogId: number;

  if (!catalogIdOrEntity) {
    catalogId = (await genCatalog(app, {})).id;
  } else if (typeof catalogIdOrEntity === 'number') {
    catalogId = catalogIdOrEntity;
  } else {
    catalogId = catalogIdOrEntity.id;
  }

  return repo.save(
    repo.create({
      id,
      name: name || faker.random.word(),
      qt,
      unitType,
      price,
      catalogId,
      active,
      stock: stock || null,
      multiWeight,
      variablePrice,
      bulk,
      ref,
    }),
  );
};

interface GenUserGroupProps {
  userIdOrEntity: number | UserEntity;
  groupIdOrEntity: number | GroupEntity;
  rights?: Array<{ right: string; params?: string[] | null }>;
}
const genUserGroup = async (
  app: INestApplication,
  { userIdOrEntity, groupIdOrEntity, rights }: GenUserGroupProps,
) => {
  const repo = app.get<Repository<UserGroupEntity>>(
    getRepositoryToken(UserGroupEntity),
  );

  return repo.save(
    repo.create({
      userId:
        typeof userIdOrEntity === 'number' ? userIdOrEntity : userIdOrEntity.id,
      groupId:
        typeof groupIdOrEntity === 'number' ? groupIdOrEntity : groupIdOrEntity.id,
      rights,
    }),
  );
};

interface GenDistributionProps {
  id?: number;
  multiDistribIdOrEntity?: number | MultiDistribEntity;
  catalogIdOrEntity?: number | CatalogEntity;
  placeIdOrEntity?: number | PlaceEntity;
  orderStartDate?: Date;
  orderEndDate?: Date;
  date?: Date;
  end?: Date;
}
const genDistribution = async (
  app: INestApplication,
  {
    id,
    multiDistribIdOrEntity,
    catalogIdOrEntity,
    placeIdOrEntity,
    orderStartDate,
    orderEndDate,
    date,
    end,
  }: GenDistributionProps,
) => {
  const repo = app.get<Repository<DistributionEntity>>(
    getRepositoryToken(DistributionEntity),
  );

  let multiDistribId: number;
  let catalogId: number;
  let placeId: number;

  if (!multiDistribIdOrEntity) {
    multiDistribId = (await genMultiDistrib(app, {})).id;
  } else if (typeof multiDistribIdOrEntity === 'number') {
    multiDistribId = multiDistribIdOrEntity;
  } else {
    multiDistribId = multiDistribIdOrEntity.id;
  }

  if (!catalogIdOrEntity) {
    catalogId = (await genCatalog(app, {})).id;
  } else if (typeof catalogIdOrEntity === 'number') {
    catalogId = catalogIdOrEntity;
  } else {
    catalogId = catalogIdOrEntity.id;
  }

  if (!placeIdOrEntity) {
    placeId = (await genPlace(app, {})).id;
  } else if (typeof placeIdOrEntity == 'number') {
    placeId = placeIdOrEntity;
  } else {
    placeId = placeIdOrEntity.id;
  }

  return repo.save(
    repo.create({
      id,
      multiDistribId,
      catalogId,
      placeId,
      raw_orderStartDate: orderStartDate || subMonths(new Date(), 6),
      raw_orderEndDate: orderEndDate || addMonths(new Date(), 6),
      raw_date: date || addDays(addMonths(new Date(), 6), 1),
      raw_end: end || addHours(addDays(addMonths(new Date(), 6), 1), 2),
    }),
  );
};
interface GenUserOrderProps {
  quantity: number;
  productPrice: number;
  basketIdOrEntity?: number | BasketEntity;
  distributionIdOrEntity?: number | DistributionEntity;
  productIdOrEntity?: number | ProductEntity;
  userIdOrEntity?: number | UserEntity;
  csaSubscriptionIdOrEntity?: number | CsaSubscriptionEntity;
}
const genUserOrder = async (
  app: INestApplication,
  {
    quantity,
    productPrice,
    basketIdOrEntity,
    distributionIdOrEntity,
    productIdOrEntity,
    userIdOrEntity,
    csaSubscriptionIdOrEntity,
  }: GenUserOrderProps,
) => {
  const repo = app.get<Repository<UserOrderEntity>>(
    getRepositoryToken(UserOrderEntity),
  );

  const entity = repo.create({
    quantity,
    productPrice,
    basketId: basketIdOrEntity
      ? getIdFromIdOrEntity(basketIdOrEntity)
      : (await genBasket(app, { status: BasketStatus.CONFIRMED })).id,
    distributionId: distributionIdOrEntity
      ? getIdFromIdOrEntity(distributionIdOrEntity)
      : (await genDistribution(app, {})).id,
    productId: productIdOrEntity
      ? getIdFromIdOrEntity(productIdOrEntity)
      : (await genProduct(app, {})).id,
    userId: userIdOrEntity
      ? getIdFromIdOrEntity(userIdOrEntity)
      : (await genUser(app, {})).id,
    subscriptionId: csaSubscriptionIdOrEntity
      ? getIdFromIdOrEntity(csaSubscriptionIdOrEntity)
      : (await genCsaSubscription(app, {})).id,
  });

  return repo.save(entity);
};

interface GenCsaSubscriptionProps {
  startDate?: Date;
  endDate?: Date;
  catalogIdOrEntity?: number | CatalogEntity;
  userIdOrEntity?: number | UserEntity;
}

const genCsaSubscription = async (
  app: INestApplication,
  { startDate, endDate, catalogIdOrEntity, userIdOrEntity }: GenCsaSubscriptionProps,
) => {
  const repo = app.get<Repository<CsaSubscriptionEntity>>(
    getRepositoryToken(CsaSubscriptionEntity),
  );

  const entity = repo.create({
    startDate: startDate || subMonths(new Date(), 1),
    endDate: endDate || addMonths(new Date(), 10),
    catalogId: catalogIdOrEntity
      ? getIdFromIdOrEntity(catalogIdOrEntity)
      : (await genCatalog(app, {})).id,
    userId: userIdOrEntity
      ? getIdFromIdOrEntity(userIdOrEntity)
      : (await genUser(app, {})).id,
  });

  return repo.save(entity);
};

interface GenOperationProps {
  amount?: number;
  date?: Date;
  type: OperationType;
  csaSubscriptionIdOrEntity?: number | CsaSubscriptionEntity;
  userIdOrEntity?: number | UserEntity;
  groupIdOrEntity?: number | GroupEntity;
  basketIdOrEntity?: number | BasketEntity;
  data?: OperationData;
}

const genOperation = async (
  app: INestApplication,
  {
    amount,
    date,
    type,
    csaSubscriptionIdOrEntity,
    userIdOrEntity,
    groupIdOrEntity,
    data,
    basketIdOrEntity,
  }: GenOperationProps,
) => {
  const repo = app.get<Repository<OperationEntity>>(
    getRepositoryToken(OperationEntity),
  );

  const entity = repo.create({
    amount: amount || 0,
    date: date || new Date(),
    type,
    subscriptionId: csaSubscriptionIdOrEntity
      ? getIdFromIdOrEntity(csaSubscriptionIdOrEntity)
      : (await genCsaSubscription(app, {})).id,
    userId: userIdOrEntity
      ? getIdFromIdOrEntity(userIdOrEntity)
      : (await genUser(app, {})).id,
    groupId: groupIdOrEntity
      ? getIdFromIdOrEntity(groupIdOrEntity)
      : (await genGroup(app, {})).id,
    raw_data: JSON.stringify(data),
    basketId: basketIdOrEntity
      ? getIdFromIdOrEntity(basketIdOrEntity)
      : (await genBasket(app, { status: BasketStatus.CONFIRMED })).id,
  });

  return repo.save(entity);
};

interface GenVolunteerRoleProps {
  catalogIdOrEntity?: number | CatalogEntity;
  groupIdOrEntity: number | GroupEntity;
}

const genVolunteerRole = async (
  app: INestApplication,
  { catalogIdOrEntity, groupIdOrEntity }: GenVolunteerRoleProps,
) => {
  const repo = app.get<Repository<VolunteerRoleEntity>>(
    getRepositoryToken(VolunteerRoleEntity),
  );

  const entity = repo.create({
    catalogId: catalogIdOrEntity ? getIdFromIdOrEntity(catalogIdOrEntity) : null,
    groupId: getIdFromIdOrEntity(groupIdOrEntity),
    name: faker.animal.bird(),
  });

  return repo.save(entity);
};

/** */
const genMigrations = async (app: INestApplication) => {
  const queryRunner = app.get<Connection>(Connection).createQueryRunner();

  await queryRunner.query(
    'CREATE TABLE IF NOT EXISTS `migrations` (`id` int NOT NULL AUTO_INCREMENT, `timestamp` bigint NOT NULL, `name` varchar(255) NOT NULL, PRIMARY KEY (`id`))',
  );

  await queryRunner.query(`TRUNCATE migrations`);

  for (const file of readdirSync(join(__dirname, '../../src/migrations'))) {
    const [timestamp, ...other] = file.split(/-(.*)/).filter((w) => w !== '');

    const migration = other
      .join('')
      .split('.')[0]
      .replace(/-([a-z])/g, (g) => g[1].toUpperCase())
      .replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    await queryRunner.query(
      `INSERT INTO migrations (timestamp,name) VALUES ('${timestamp}', '${migration}${timestamp}')`,
    );
  }
};

const genBaseConfig = async (app: INestApplication) => {
  await app
    .get<Repository<VariableEntity>>(getRepositoryToken(VariableEntity))
    .save([
      { name: VariableNames.tosVersion, value: '1' },
      { name: VariableNames.platformTermsOfServiceVersion, value: '1' },
    ]);
};

const genAdmin = async (app: INestApplication) => {
  const userRepo = app.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
  let admin = await userRepo.findOne({ email: 'admin@camap.net' });
  if (!admin) {
    admin = await genUser(app, {
      firstName: 'Jean-Michel',
      lastName: 'LEDEV',
      email: 'admin@camap.net',
      phone: '0607080905',
      rights: [RightSite.SuperAdmin],
    });
  }
  await userRepo.save(admin);
  return userRepo.findOne(admin.id);
};

const init = async (app: INestApplication) => {
  await genMigrations(app);
  await genBaseConfig(app);
  const admin = await genAdmin(app);

  return { admin };
};

export const datasetGenerators = async (app: INestApplication) => {
  let { admin } = await init(app);

  const reset = async () => {
    const connection = app.get<Connection>(Connection);
    const queryRunner = connection.createQueryRunner();

    await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const meta of connection.entityMetadatas) {
      await queryRunner.query(`TRUNCATE TABLE db.${meta.tableName};`);
    }
    await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');

    await genMigrations(app);
    await genBaseConfig(app);
    const reInit = await init(app);
    admin = reInit.admin;
  };

  return {
    admin,
    reset,
    genPlace: (props: GenPlaceProps) => genPlace(app, props),
    genGroup: async (props: GenGroupProps) => {
      const group = await genGroup(app, props);
      await genUserGroup(app, {
        groupIdOrEntity: group,
        userIdOrEntity: admin,
      });
      return group;
    },
    genMultiDistrib: (props: GenMultiDistribProps) => genMultiDistrib(app, props),
    genBasket: (props: GenBasketProps) => genBasket(app, props),
    genUser: (props: GenUserProps) => genUser(app, props),
    genVendor: (props: GenVendorProps) => genVendor(app, props),
    genCatalog: (props: GenCatalogProps) => genCatalog(app, props),
    genProduct: (props: GenProductProps) => genProduct(app, props),
    genUserGroup: (props: GenUserGroupProps) => genUserGroup(app, props),
    genDistribution: (props: GenDistributionProps) => genDistribution(app, props),
    genUserOrder: (props: GenUserOrderProps) => genUserOrder(app, props),
    genCsaSubscription: (props: GenCsaSubscriptionProps) =>
      genCsaSubscription(app, props),
    genOperation: (props: GenOperationProps) => genOperation(app, props),
    genVolunteerRole: (props: GenVolunteerRoleProps) => genVolunteerRole(app, props),
  };
};

export type DatasetGenerators = Awaited<ReturnType<typeof datasetGenerators>>;
