import { DatasetGenerators } from '../src/dev/dataset-generator';
import { CatalogFlags } from '../src/vendors/entities/catalog.entity';
import { CatalogsService } from '../src/vendors/services/catalogs.service';
import { closeTestApp, initTestApp, TestContextHelper } from './utils';

describe('CatalogsService', () => {
  let testHelper: TestContextHelper;
  let generators: DatasetGenerators;
  let catalogsService: CatalogsService;

  beforeAll(async () => {
    testHelper = await initTestApp();

    catalogsService = testHelper.moduleFixture.get(CatalogsService);

    generators = await testHelper.getGenerators();
  });

  afterAll(async () => {
    await closeTestApp(testHelper);
  });

  describe('enableStockManagement', () => {
    it('ok', async () => {
      const { genCatalog } = generators;

      let catalog = await genCatalog({});
      expect(
        catalogsService.hasStockManagement(
          await catalogsService.findOneById(catalog.id),
        ),
      ).toBeFalsy();
      await catalogsService.enableStockManagement(catalog);
      expect(
        catalogsService.hasStockManagement(
          await catalogsService.findOneById(catalog.id),
        ),
      ).toBeTruthy();
      await catalogsService.enableStockManagement(catalog);
      expect(
        catalogsService.hasStockManagement(
          await catalogsService.findOneById(catalog.id),
        ),
      ).toBeTruthy();

      catalog = await genCatalog({
        flags: [CatalogFlags.StockManagement],
      });
      expect(
        catalogsService.hasStockManagement(
          await catalogsService.findOneById(catalog.id),
        ),
      ).toBeTruthy();
      await catalogsService.enableStockManagement(catalog);
      expect(
        catalogsService.hasStockManagement(
          await catalogsService.findOneById(catalog.id),
        ),
      ).toBeTruthy();
    });
  });
});
