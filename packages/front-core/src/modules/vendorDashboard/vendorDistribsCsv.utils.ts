import { GetVendorDistributionsCsvQuery } from '@gql';
import { formatSmartQt } from 'camap-common';
import { format, startOfDay } from 'date-fns';
import { saveAs } from 'file-saver';

type CsvCatalog = GetVendorDistributionsCsvQuery['vendor']['allCatalogs'][number];
type CsvVendorDistributions = GetVendorDistributionsCsvQuery['vendor']['allDistributions'][number];

export function exportVendorDistributionsCsv(
  allCatalogs: CsvCatalog[],
  allDistributions: CsvVendorDistributions[],
  vendorName: string,
): void {
  const delimiter = ';';

  const dateTimestamps = [
    ...new Set(
      allDistributions.flatMap((vd) =>
        vd.distributions.map((d) => startOfDay(new Date(d.date)).getTime()),
      ),
    ),
  ].sort((a, b) => a - b);

  const matrix = new Map<number, Map<number, Map<number, number>>>();
  for (const vd of allDistributions) {
    for (const dist of vd.distributions) {
      const dateKey = startOfDay(new Date(dist.date)).getTime();
      const catalogId = dist.catalog.id;

      if (!matrix.has(catalogId)) matrix.set(catalogId, new Map());
      const catalogMap = matrix.get(catalogId)!;

      if (!catalogMap.has(dateKey)) catalogMap.set(dateKey, new Map());
      const dateMap = catalogMap.get(dateKey)!;

      for (const order of dist.userOrders) {
        const productId = order.product.id;
        dateMap.set(productId, (dateMap.get(productId) ?? 0) + order.quantity);
      }
    }
  }

  const dateHeaders = dateTimestamps.map(
    (ts) => `Distribution du ${format(new Date(ts), 'dd/MM/yy')}`,
  );
  const rows: string[][] = [['AMAP', 'Produit', ...dateHeaders]];

  const sortedCatalogs = [...allCatalogs].sort(
    (a, b) =>
      a.group.name.localeCompare(b.group.name) || a.name.localeCompare(b.name),
  );

  for (const catalog of sortedCatalogs) {
    const activeProducts = catalog.products.filter((p) => p.active);
    for (const product of activeProducts) {
      const cells = dateTimestamps.map((dateKey) => {
        const qty = matrix.get(catalog.id)?.get(dateKey)?.get(product.id);
        if (qty == null) return '';
        return formatSmartQt(product, { quantity: qty });
      });
      rows.push([catalog.group.name, product.name, ...cells]);
    }
  }

  const csvContent = rows
    .map((row) => row.map((cell) => `"${cell}"`).join(delimiter))
    .join('\r\n');

  // BOM UTF-8 pour compatibilité Excel
  const blob = new Blob(['﻿' + csvContent], {
    type: 'text/csv;charset=utf-8',
  });
  saveAs(blob, `distributions_${vendorName}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
}
