import { getRepositoryToken } from '@nestjs/typeorm';
import { gql } from 'apollo-server-core';
import { Unit } from 'camap-common';
import { add, set, sub } from 'date-fns';
import { Repository } from 'typeorm';
import { DatasetGenerators } from '../src/dev/dataset-generator';
import { RegOption } from '../src/groups/types/interfaces';
import { MultiDistribEntity } from '../src/shop/entities/multi-distrib.entity';
import { RightSite } from '../src/users/models/user.entity';
import { Catalog } from '../src/vendors/types/catalog.type';
import {
  closeTestApp,
  createApolloClient,
  initTestApp,
  TestContextHelper,
} from './utils';

const genIslet = async ({
  genUser,
  genGroup,
  genCatalog,
  genDistribution,
  genVendor,
  genProduct,
  genPlace,
  genMultiDistrib,
}: DatasetGenerators) => {
  const now = new Date();

  const user = await genUser({
    rights: [RightSite.SuperAdmin],
  });

  const group = await genGroup({
    name: 'La ferme de la Galinette',
    userIdOrEntity: user,
    hasMembership: false,
    regOption: RegOption.Open,
  });

  const vendor = await genVendor({
    name: 'La Ferme de la Galinette',
    zipCode: '33200',
    city: 'Galignac',
  });

  const catalog = await genCatalog({
    name: 'Catalogue Oeufs',
    groupIdOrdEntity: group,
    vendorIdOrdEntity: vendor,
  });

  const products = await Promise.all([
    genProduct({
      name: 'Oeufs',
      qt: 6,
      unitType: Unit.Piece,
      price: 3.0,
      catalogIdOrEntity: catalog,
    }),
    genProduct({
      name: 'Poulet',
      qt: 1.8,
      unitType: Unit.Kilogram,
      price: 22,
      multiWeight: true,
      variablePrice: true,
      catalogIdOrEntity: catalog,
    }),
  ]);

  const place = await genPlace({
    name: 'Ferme de la Galinette',
    zipCode: '33600',
    city: 'Galignac',
    groupIdOrEntity: group,
    lat: 44.8350088,
    lng: -0.587269,
  });

  const multiDistrib = await genMultiDistrib({
    distribStartDate: set(add(now, { days: 30 }), {
      hours: 18,
      minutes: 0,
      seconds: 0,
    }),
    distribEndDate: set(add(now, { days: 30 }), {
      hours: 19,
      minutes: 0,
      seconds: 0,
    }),
    placeIdOrEntity: place,
    groupIdOrEntity: group,
    orderStartDate: sub(now, { days: 3 }),
    orderEndDate: set(add(now, { days: 30 }), {
      hours: 18,
      minutes: 55,
      seconds: 0,
    }),
  });

  const distrib = await genDistribution({
    catalogIdOrEntity: catalog,
    placeIdOrEntity: place,
    orderEndDate: multiDistrib.orderEndDate,
    orderStartDate: multiDistrib.orderStartDate,
    date: multiDistrib.distribStartDate,
    end: multiDistrib.distribEndDate,
    multiDistribIdOrEntity: multiDistrib,
  });

  return {
    multiDistrib,
    distrib,
    user,
    catalog,
  };
};

const GET_CATALOGS_FROM_MULTI_DISTRIB = gql`
  query getOrderableCatalogsFromMultiDistrib($multiDistribId: Int!) {
    getOrderableCatalogsFromMultiDistrib(multiDistribId: $multiDistribId) {
      id
    }
  }
`;

describe('Catalogs (e2e)', () => {
  let testHelper: TestContextHelper;
  let generators: DatasetGenerators;

  beforeAll(async () => {
    testHelper = await initTestApp();
    generators = await testHelper.getGenerators();
  });

  afterAll(async () => {
    await closeTestApp(testHelper);
  });

  /**
   * GET CATALOGS FROM A MULTIDISTRIB
   */
  describe('getOrderableCatalogsFromMultiDistrib', () => {
    it('Should return the catalog in a multi distrib', async () => {
      const { multiDistrib, user, catalog } = await genIslet(generators);
      const { query } = createApolloClient(testHelper, user);

      const { data } = await query<{
        getOrderableCatalogsFromMultiDistrib: Catalog[];
      }>({
        query: GET_CATALOGS_FROM_MULTI_DISTRIB,
        variables: {
          multiDistribId: multiDistrib.id,
        },
      });

      expect(data.getOrderableCatalogsFromMultiDistrib).toHaveLength(1);
      expect(data.getOrderableCatalogsFromMultiDistrib[0].id).toBe(catalog.id);
    });

    it('Should throw a 404 error if the multi distrib does not exist', async () => {
      const user = await generators.genUser({});
      const { query } = createApolloClient(testHelper, user);

      const multiDistribId = 987654;
      await expect(
        testHelper.moduleFixture
          .get<Repository<MultiDistribEntity>>(
            getRepositoryToken(MultiDistribEntity),
          )
          .findOne(multiDistribId),
      ).resolves.toBeUndefined();

      const { data, errors } = await query({
        query: GET_CATALOGS_FROM_MULTI_DISTRIB,
        variables: {
          multiDistribId,
        },
      });

      expect(data).toBeFalsy();
      expect(errors).toBeDefined();
    });
  });
});
