import { getRepositoryToken } from '@nestjs/typeorm';
import { gql } from 'apollo-server-core';
import { Unit } from 'camap-common';
import { Repository } from 'typeorm';
import { DatasetGenerators } from '../src/dev/dataset-generator';
import { UserRight } from '../src/groups/services/user-groups.service';
import { CatalogEntity } from '../src/vendors/entities/catalog.entity';
import {
  closeTestApp,
  createApolloClient,
  initTestApp,
  TestContextHelper,
} from './utils';

const GET_PRODUCTS_FROM_CATALOG = gql`
  query catalog($id: Int!) {
    catalog(id: $id) {
      id
      products {
        id
      }
    }
  }
`;

const genIslet = async ({
  genGroup,
  genVendor,
  genCatalog,
  genProduct,
  genUser,
  genUserGroup,
}: DatasetGenerators) => {
  const user = await genUser({});

  const group = await genGroup({
    name: 'La ferme de la Galinette',
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

  await genUserGroup({
    userIdOrEntity: user,
    groupIdOrEntity: group,
    rights: [
      {
        right: UserRight.catalogAdmin,
        params: [catalog.id.toString()],
      },
    ],
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

  return {
    user,
    products,
    catalog,
  };
};

describe('Products (e2e)', () => {
  let testHelper: TestContextHelper;
  let generators: DatasetGenerators;
  let catalogsRepo: Repository<CatalogEntity>;

  beforeAll(async () => {
    testHelper = await initTestApp();
    catalogsRepo = testHelper.moduleFixture.get<Repository<CatalogEntity>>(
      getRepositoryToken(CatalogEntity),
    );

    generators = await testHelper.getGenerators();
  });

  afterAll(async () => {
    await closeTestApp(testHelper);
  });

  /**
   * GET PRODUCTS FROM A CATALOG
   */
  describe('getProductsFromCatalog', () => {
    it('Should return all products in a catalog', async () => {
      const { user, catalog, products } = await genIslet(generators);
      const { query } = createApolloClient(testHelper, user);

      const { data, errors } = await query<{
        catalog: { products: { id: number }[] };
      }>({
        query: GET_PRODUCTS_FROM_CATALOG,
        variables: {
          id: catalog.id,
        },
      });

      expect(errors).toBeUndefined();
      expect(data.catalog.products).toHaveLength(2);
      expect(
        data.catalog.products
          .map((p) => p.id)
          .sort()
          .join(),
      ).toEqual(
        products
          .map((p) => p.id)
          .sort()
          .join(),
      );
    });

    it('Should throw a 404 error if the catalog does not exist', async () => {
      const { user } = await genIslet(generators);
      const { query } = createApolloClient(testHelper, user);

      const catalogId = -1;

      await expect(catalogsRepo.findOne(catalogId)).resolves.toBeUndefined();

      const { data, errors } = await query({
        query: GET_PRODUCTS_FROM_CATALOG,
        variables: {
          id: catalogId,
        },
      });

      expect(data).toBeFalsy();
      expect(errors).toBeDefined();
    });

    it('Should throw an error if the current user cannot manage this catalog', async () => {
      const { catalog } = await genIslet(generators);
      const otherUser = await generators.genUser({});
      const { query } = createApolloClient(testHelper, otherUser);

      const { data, errors } = await query({
        query: GET_PRODUCTS_FROM_CATALOG,
        variables: {
          id: catalog.id,
        },
      });

      expect(data).toBeFalsy();
      expect(errors).toBeDefined();
    });
  });
});
