import {
  AttendanceClassicContractQuery,
  useAttendanceClassicContractLazyQuery,
} from '@gql';
import { Alert, Box, Card, Divider, Typography } from '@mui/material';
import { formatDateFr, formatUnit } from '@utils/fomat';
import { useCamapTranslation } from '@utils/hooks/use-camap-translation';
import { DateRange } from 'camap-common';
import { addMonths } from 'date-fns';
import { endOfDay, startOfDay } from 'date-fns/esm';
import { sortBy } from 'lodash';
import React from 'react';
import { Trans } from 'react-i18next';
import {
  AttendanceBodyCell,
  AttendanceColumn,
  AttendanceTableData,
} from '../../components/attendanceSheet/attendanceSheet.interface';
import {
  exportAttendanceCSV,
  exportAttendanceXlsx,
  formatCatalogContact,
  formatCatalogVendor,
  formatPhone,
  formatUserSubNames,
  loadAttendanceUserFormat,
  saveAttendanceUserFormat,
} from '../../components/attendanceSheet/attendanceSheet.utils';
import AttendanceActions from '../../components/attendanceSheet/components/AttendanceActions';
import AttendanceTable from '../../components/attendanceSheet/components/AttendanceTable';
import AttendanceTableWrapper from '../../components/attendanceSheet/components/AttendanceTableWrapper';
import DateRangePicker from '../../components/dateRangePicker/DateRangePicker';
import CircularProgressBox from '../../components/utils/CircularProgressBox';
import { CsaAttendanceFormat } from './attendanceSheetCsa.interface';
import ClassicContractAttendanceFormatOptions from './components/ClassicContractAttendanceFormatOptions';

type Catalog = {
  __typename?: 'Catalog';
  id: number;
  name: string;
  startDate: any;
  endDate: any;
  user?: {
    __typename?: 'User';
    id: number;
    firstName: string;
    lastName: string;
    phone?: string | null;
    email: string;
  } | null;
  vendor: {
    __typename?: 'Vendor';
    id: number;
    name: string;
    phone?: string | null;
    email?: string | null;
  };
  group: {
    __typename?: 'Group';
    id: number;
    name: string;
    txtDistrib?: string | null;
  };
  products: Array<{
    __typename?: 'Product';
    id: number;
    name: string;
    unitType: number;
    qt: number;
  }>;
};

export interface ClassicContractAttendanceModuleProps {
  catalogId: number;
}

const getDateFormat = (value: number) => {
  switch (value) {
    case 0:
      return 'dd/MM';
    case 1:
      return 'dd/MM/yy';
    default:
      return 'dd/MM/yyyy';
  }
};

const getUserDefaultOrder = (
  { attendanceClassicContract }: AttendanceClassicContractQuery,
  userId: number,
) => {
  const firstDistrib = attendanceClassicContract.distributions.find((distrib) =>
    distrib.userOrders.find((uo) => uo.userId === userId),
  );
  if (!firstDistrib) return null;
  const userOrders = firstDistrib.userOrders.filter(
    (uo) => uo.userId === userId,
  );
  if (userOrders.length === 0) return null;
  const products = attendanceClassicContract.catalog.products;
  return userOrders.reduce(
    (acc, uo) => {
      const product = products.find((p) => p.id === uo.productId);
      if (!product) return acc;

      return [
        ...acc,
        {
          id: product.id,
          name: product.name,
          productQt: product.qt,
          unitType: product.unitType,
          orderQt: uo.quantity,
          smartQt: uo.smartQt,
        },
      ];
    },
    [] as {
      id: number;
      name: string;
      productQt: number;
      unitType: number;
      orderQt: number;
      smartQt: string;
    }[],
  );
};

const getTableData = (
  data: AttendanceClassicContractQuery,
  format: CsaAttendanceFormat,
  t: (key: string) => string,
): AttendanceTableData => {
  const head: AttendanceColumn[] = [];

  const { attendanceClassicContract } = data;
  const subscriptions = sortBy(
    attendanceClassicContract.subscriptions,
    (sub) => sub.user.lastName.toLowerCase(),
  );
  const distributions = sortBy(attendanceClassicContract.distributions, 'date');
  const products = sortBy(attendanceClassicContract.catalog.products, 'name');

  if (format.classicContractContact === 0) {
    head.push({ value: t('table.name'), width: 180 });
    head.push({ value: t('table.phone'), width: 120 });
  } else {
    head.push({ value: t('table.contact'), width: 200 });
  }

  if (format.classicContractProduct === 0) {
    head.push({ value: t('table.contract'), width: 200 });
  } else {
    products.forEach((product) => {
      head.push({
        value: `${product.qt} ${formatUnit(product.unitType)} ${product.name}`,
        align: 'center',
      });
    });
  }

  distributions.forEach((distribution) => {
    head.push({
      value: formatDateFr(
        distribution.date,
        getDateFormat(format.classicContractDate),
      ),
      width: 50,
      align: 'center',
    });
  });

  const body: AttendanceBodyCell[][][] = subscriptions.map((sub) => {
    const rows: AttendanceBodyCell[][] = [];
    const row: AttendanceBodyCell[] = [];

    if (format.classicContractContact === 0) {
      row.push({
        value: sub.user2
          ? [
            formatUserSubNames(sub.user),
            `↔️ ${formatUserSubNames(sub.user2)}`,
          ]
          : formatUserSubNames(sub.user),
      });
      row.push({
        value: sub.user2
          ? [formatPhone(sub.user.phone), formatPhone(sub.user2.phone)]
          : formatPhone(sub.user.phone) || '',
      });
    } else {
      row.push({
        value: sub.user2
          ? [
            `${formatUserSubNames(sub.user)}${sub.user.phone ? ` (${formatPhone(sub.user.phone)})` : ''
            }`,
            `↔️ ${formatUserSubNames(sub.user2)}${sub.user2.phone ? ` (${formatPhone(sub.user2.phone)})` : ''
            }`,
          ]
          : `${formatUserSubNames(sub.user)}${sub.user.phone ? ` (${formatPhone(sub.user.phone)})` : ''
          }`,
      });
    }

    const defaultOrder = getUserDefaultOrder(data, sub.user.id);

    if (format.classicContractProduct === 0) {
      row.push({
        value: defaultOrder
          ? defaultOrder.reduce((acc, p) => {
            let res = acc;
            if (res !== '') {
              res = `${res}, `;
            }
            return `${res} ${p.smartQt}`;
          }, '')
          : '',
      });
    } else {
      if (!defaultOrder) {
        products.forEach((_) => row.push({ value: '' }));
      } else {
        products.forEach((product) => {
          const productOrder = defaultOrder.find((dO) => dO.id === product.id);
          row.push({
            value: productOrder ? `${productOrder.orderQt}` : '-',
            align: 'center',
          });
        });
      }
    }

    row.push(
      ...distributions
        .map((distrib) => {
          const res: AttendanceBodyCell = {
            value: '',
            align: 'center',
          };
          if (
            sub.absentDistribIds &&
            sub.absentDistribIds
              .split(',')
              .some((dId) => parseInt(dId, 10) === distrib.id)
          ) {
            return { ...res, value: '🌴' };
          }
          if (!distrib.userOrders.some((uo) => uo.userId === sub.user.id)) {
            return { ...res, value: '❌' };
          }
          return res;
        })
    );

    rows.push(row);
    return rows;
  });

  return { head, body };
};

export const ClassicContractAttendanceModule = ({
  catalogId,
}: ClassicContractAttendanceModuleProps) => {
  const { t } = useCamapTranslation({
    tAttendance: 'attendance',
    tErrors: 'errors',
  });
  const [range, setRange] = React.useState<DateRange>({
    start: startOfDay(new Date()),
    end: addMonths(endOfDay(new Date()), 1),
  });
  const [format, setFormat] = React.useState<CsaAttendanceFormat>(
    loadAttendanceUserFormat(),
  );
  const [getAttendanceClassicContractQuery, { data, error }] =
    useAttendanceClassicContractLazyQuery();
  const tableData = data ? getTableData(data, format, t) : undefined;

  const [catalog, setCatalog] = React.useState<Catalog>();

  React.useEffect(() => {
    if (!data) return;
    setCatalog(data.attendanceClassicContract.catalog);
  }, [data]);

  React.useEffect(() => {
    if (!range.start || !range.end) return;

    getAttendanceClassicContractQuery({
      variables: {
        catalogId,
        startDate: range.start,
        endDate: range.end,
      },
    });
  }, [catalogId, getAttendanceClassicContractQuery, range]);

  /** */
  const onExportCSVClick = () => {
    if (!data || !tableData) return;
    const { catalog } = data.attendanceClassicContract;
    exportAttendanceCSV(tableData, t, catalog.name, catalog);
  };

  const onExportXLSXClick = () => {
    if (!data || !tableData || !catalog) return;
    exportAttendanceXlsx(
      tableData,
      t,
      catalog.name,
      data.attendanceClassicContract.catalog,
    );
  };

  const onFormatChange = (newFormat: CsaAttendanceFormat) => {
    saveAttendanceUserFormat(newFormat);
    setFormat(newFormat);
  };

  const onDateRangeChange = (newRange: DateRange) => setRange(newRange);

  /** */
  if (error) {
    return <Alert severity="error">{t('INTERNAL_SERVER_ERROR')}</Alert>;
  }

  if (!catalog) {
    return (
      <Card>
        <CircularProgressBox />
      </Card>
    );
  }

  return (
    <Card>
      <Box p={2}>
        <Typography variant="h5">
          {t('classic.title', {
            group: catalog.group.name,
            catalog: catalog.name,
          })}
        </Typography>
      </Box>

      <Box p={2}>
        <DateRangePicker
          value={range}
          onChange={onDateRangeChange}
          minDate={catalog.startDate}
          maxDate={catalog.endDate}
        />
      </Box>

      <Box p={2}>
        <ClassicContractAttendanceFormatOptions
          value={format}
          onChange={onFormatChange}
        />
      </Box>

      <Box p={2}>
        <Divider />
      </Box>

      <AttendanceActions
        onExportCSVClick={onExportCSVClick}
        onExportXLSXClick={onExportXLSXClick}
      />

      <Box p={2}>
        <Divider />
      </Box>

      <AttendanceTableWrapper>
        <Box py={2}>
          <Typography variant="h6">{`${catalog.group.name} - ${catalog.name}`}</Typography>
          {catalog.user && (
            <Box>
              <Trans
                ns={'attendance'}
                i18nKey="header.coordinator"
                values={{ infos: formatCatalogContact(catalog.user) }}
                components={{ bold: <strong /> }}
              />
            </Box>
          )}
          <Box>
            <Trans
              ns={'attendance'}
              i18nKey="header.vendor"
              values={{ infos: formatCatalogVendor(catalog.vendor) }}
              components={{ bold: <strong /> }}
            />
          </Box>
          {catalog.group.txtDistrib && (
            <Box>
              <Trans
                ns={'attendance'}
                i18nKey="header.instructions"
                values={{ infos: catalog.group.txtDistrib }}
                components={{ bold: <strong /> }}
              />
            </Box>
          )}
        </Box>
        {tableData && (
          <AttendanceTable
            data={tableData}
            cellHeight={!format.cellHeight ? 'big' : 'small'}
          />
        )}
      </AttendanceTableWrapper>
    </Card>
  );
};

export default ClassicContractAttendanceModule;
