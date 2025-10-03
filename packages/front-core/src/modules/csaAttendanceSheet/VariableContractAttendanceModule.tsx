import {
  AttendanceVariableContractQuery,
  useAttendanceVariableContractQuery,
} from '@gql';
import { Alert, Box, Card, Divider, Typography } from '@mui/material';
import { formatDateFr } from '@utils/fomat';
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
  formatVolunteer,
  loadAttendanceUserFormat,
  saveAttendanceUserFormat,
} from '../../components/attendanceSheet/attendanceSheet.utils';
import AttendanceActions from '../../components/attendanceSheet/components/AttendanceActions';
import AttendanceTable from '../../components/attendanceSheet/components/AttendanceTable';
import AttendanceTableWrapper from '../../components/attendanceSheet/components/AttendanceTableWrapper';
import CircularProgressBox from '../../components/utils/CircularProgressBox';
import { useCamapTranslation } from '../../utils/hooks/use-camap-translation';
import { CsaAttendanceFormat } from './attendanceSheetCsa.interface';
import VariableContractAttendanceFormatOptions from './components/VariableContractAttendanceFormatOptions';
import { userSortKey } from 'camap-common';

export interface VariableContractAttendanceModuleProps {
  catalogId: number;
  distributionId: number;
}

const getTableData = (
  data: AttendanceVariableContractQuery,
  format: CsaAttendanceFormat,
  t: (key: string) => string,
): AttendanceTableData => {
  const { distribution } = data.attendanceVariableContract;

  if (!data.attendanceVariableContract.subscriptions) {
    throw new Error(`no subs`);
  }

  const subscriptions = sortBy(
    data.attendanceVariableContract.subscriptions,
    (sub) => userSortKey(sub.user),
  );

  const head: AttendanceColumn[] = [];

  if (format.variableContractContact === 0) {
    head.push({ value: t('table.name'), width: 180 });
    head.push({ value: t('table.phone'), width: 120 });
  } else {
    head.push({ value: t('table.contact'), width: 200 });
  }

  head.push({ value: t('table.balance'), width: 100, align: 'center' });
  head.push({ value: t('table.amount'), width: 110, align: 'center' });
  head.push({ value: t('table.contract'), width: 160 });
  head.push({ value: t('table.weight'), width: 110, align: 'center' });
  head.push({ value: t('table.provision'), width: 110, align: 'center' });
  head.push({ value: t('table.signature'), width: 100, align: 'center' });

  const body: AttendanceBodyCell[][][] = subscriptions
    .filter((sub) =>
      distribution.userOrders.some((uo) => uo.userId === sub.user.id),
    )
    .filter((sub) => {
      const userOrders = distribution.userOrders
        .filter((uo) => uo.userId === sub.user.id)
        .filter((uo) => uo.quantity > 0);
      return userOrders.length > 0;
    })
    .map((sub) => {
      const rows: AttendanceBodyCell[][] = [];
      const row: AttendanceBodyCell[] = [];

      if (format.variableContractContact === 0) {
        row.push({
          value: formatUserSubNames(sub.user),
        });
        row.push({
          value: formatPhone(sub.user.phone),
        });
      } else {
        row.push({
          value: `${formatUserSubNames(sub.user)}${
            sub.user.phone ? ` (${formatPhone(sub.user.phone)})` : ''
          }`,
        });
      }

      const userOrders = distribution.userOrders
        .filter((uo) => uo.userId === sub.user.id)
        .filter((uo) => uo.quantity > 0);

      row.push({ value: sub.balance, type: 'currency', align: 'center' });
      row.push({
        value: userOrders.reduce(
          (acc, uo) => acc + uo.productPrice * uo.quantity,
          0,
        ),
        type: 'currency',
        align: 'center',
      });
      row.push({
        value: userOrders.map((uo) => uo.smartQt),
      });
      row.push({ value: userOrders.map(() => ``) });
      row.push({ value: '' });
      row.push({ value: '' });

      rows.push(row);
      return rows;
    });

  return { head, body };
};

export const VariableContractAttendanceModule = ({
  catalogId,
  distributionId,
}: VariableContractAttendanceModuleProps) => {
  const [format, setFormat] = React.useState<CsaAttendanceFormat>(
    loadAttendanceUserFormat(),
  );
  const { t } = useCamapTranslation({
    tAttendance: 'attendance',
    tErrors: 'errors',
  });
  const { data, loading, error } = useAttendanceVariableContractQuery({
    variables: { catalogId, distributionId },
  });
  const tableData = data ? getTableData(data, format, t) : undefined;
  const catalog = data?.attendanceVariableContract?.catalog;
  const distribution = data?.attendanceVariableContract?.distribution;

  /** */
  const onExportCSVClick = () => {
    if (!catalog || !tableData || !distribution) return;
    exportAttendanceCSV(
      tableData,
      t,
      catalog.name + ' - ' + formatDateFr(distribution.date, 'EEEE dd MMMM yyyy'),
      catalog,
      distribution.multiDistrib.volunteers.filter(
        (v) =>
          v.volunteerRole.catalogId !== null &&
          v.volunteerRole.catalogId === catalog.id,
      ),
    );
  };

  const onExportXLSXClick = () => {
    if (!catalog || !tableData || !distribution) return;
    exportAttendanceXlsx(
      tableData,
      t,
      catalog.name + ' - ' + formatDateFr(distribution.date, 'EEEE dd MMMM yyyy'),
      catalog,
      distribution.multiDistrib.volunteers.filter(
        (v) =>
          v.volunteerRole.catalogId !== null &&
          v.volunteerRole.catalogId === catalog.id,
      ),
    );
  };

  const onFormatChange = (newFormat: CsaAttendanceFormat) => {
    saveAttendanceUserFormat(newFormat);
    setFormat(newFormat);
  };

  /** */
  if (error)
    return <Alert severity="error">{t('INTERNAL_SERVER_ERROR')}</Alert>;
  if (loading)
    return (
      <Card>
        <CircularProgressBox />
      </Card>
    );
  if (!catalog || !distribution || !tableData) {
    return <Alert severity="error">{t('INTERNAL_SERVER_ERROR')}</Alert>;
  }

  const volunteers = distribution.multiDistrib.volunteers.filter(
    (v) =>
      v.volunteerRole.catalogId !== null &&
      v.volunteerRole.catalogId === catalog.id,
  );
  return (
    <Card>
      <Box p={2}>
        <Typography variant="h5">
          {t('variable.title', {
            group: catalog.group.name,
            catalog: catalog.name,
            date: formatDateFr(distribution.date, 'dd/MM/yyyy'),
          })}
        </Typography>
      </Box>

      <Box p={2}>
        <Divider />
      </Box>

      <Box p={2}>
        <VariableContractAttendanceFormatOptions
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
          <Typography variant="h6">
            {t('variable.titleHeader', {
              group: catalog.group.name,
              catalog: catalog.name,
              date: formatDateFr(distribution.date, 'EEEE dd MMMM yyyy'),
            })}
          </Typography>
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
          <Box>
            <Trans
              ns={'attendance'}
              i18nKey="header.volunteers"
              values={{
                infos: volunteers
                  .map((v) => formatVolunteer(v.user))
                  .join(', '),
              }}
              components={{ bold: <strong /> }}
            />
          </Box>
        </Box>
        <AttendanceTable data={tableData} cellHeight={format.cellHeight} />
      </AttendanceTableWrapper>
    </Card>
  );
};

export default VariableContractAttendanceModule;
