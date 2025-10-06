import { Catalog, Group, User, Vendor, VolunteerRole } from '@gql';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Maybe } from 'graphql/jsutils/Maybe';
import { CsaAttendanceFormat } from '../../modules/csaAttendanceSheet/attendanceSheetCsa.interface';
import { AttendanceTableData } from './attendanceSheet.interface';
import { formatFirstName, formatLastName, formatUserName } from 'camap-common';

export const exportAttendanceCSV = (
  { head, body }: AttendanceTableData,
  t: (key: string) => string,
  fileName: string,
  catalog?: Pick<Catalog, 'id' | 'name'> & {
    group: Pick<Group, 'name' | 'txtDistrib'>;
    user?: Pick<User, 'firstName' | 'lastName' | 'phone' | 'email'> | null;
    vendor: Pick<Vendor, 'name' | 'email' | 'phone'>;
  },
  volunteers?: Array<{
    user: Pick<User, 'firstName' | 'lastName' | 'email' | 'phone'>;
    volunteerRole: Pick<VolunteerRole, 'catalogId'>;
  }>,
) => {
  const delimiter = ',';
  let csvContent = 'data:text/csv;charset=utf-8,';

  if (catalog) {
    csvContent += `${catalog.group.name} - ${catalog.name}`;
    csvContent += '\r\n';

    if (catalog.user) {
      csvContent += `${t('coordinator')} : ${formatCatalogContact(
        catalog.user,
      )}`;
      csvContent += '\r\n';
    }

    csvContent += `${t('vendor')} : ${formatCatalogVendor(catalog.vendor)}`;
    csvContent += '\r\n';

    if (catalog.group.txtDistrib) {
      csvContent += `${t('instructions')} : ${catalog.group.txtDistrib}`;
      csvContent += '\r\n';
    }
  }

  if (volunteers && volunteers.length > 0) {
    csvContent += `${t('volunteers')} : ${volunteers
      .map((v) => formatVolunteer(v.user))
      .join(', ')}`;
    csvContent += '\r\n';
  }

  if (catalog) {
    csvContent += '\r\n';
  }

  csvContent += head.map((h) => h.value).join(delimiter);
  csvContent += '\r\n';

  body.forEach((rows) => {
    rows.forEach((row) => {
      csvContent += row
        .map((cell) =>
          'value' in cell
            ? `"${
                Array.isArray(cell.value) ? cell.value.join(' - ') : cell.value
              }"`
            : '',
        )
        .join(delimiter);
      csvContent += '\r\n';
    });
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();

  link.remove();
};

export const exportAttendanceXlsx = async (
  { head, body }: AttendanceTableData,
  t: (key: string) => string,
  fileName: string,
  catalog?: Pick<Catalog, 'name'> & {
    group: Pick<Group, 'name' | 'txtDistrib'>;
    user?: Pick<User, 'firstName' | 'lastName' | 'phone' | 'email'> | null;
    vendor: Pick<Vendor, 'name' | 'email' | 'phone'>;
  },
  volunteers?: Array<{
    user: Pick<User, 'firstName' | 'lastName' | 'email' | 'phone'>;
    volunteerRole: Pick<VolunteerRole, 'catalogId'>;
  }>,
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('My Sheet');

  let rowIndex = 1;
  let row: ExcelJS.Row;

  worksheet.columns = head.map(({ width }) => ({
    width: width ? width / 4 : undefined,
  }));

  /** */
  if (catalog) {
    row = worksheet.getRow(rowIndex);
    row.values = [`${catalog.group.name} - ${catalog.name}`];
    row.font = { size: 16, bold: true };
    row.height = 20;
    rowIndex += 1;

    const contact = catalog.user;
    if (contact) {
      row = worksheet.getRow(rowIndex);
      row.getCell(1).value = {
        richText: [
          { font: { bold: true }, text: `${t('coordinator')} : ` },
          { text: formatCatalogContact(contact) },
        ],
      };
      rowIndex += 1;
    }

    row = worksheet.getRow(rowIndex);
    row.getCell(1).value = {
      richText: [
        { font: { bold: true }, text: `${t('vendor')} : ` },
        { text: formatCatalogVendor(catalog.vendor) },
      ],
    };
    rowIndex += 1;

    const instructions = catalog.group.txtDistrib;
    if (instructions) {
      row = worksheet.getRow(rowIndex);
      row.getCell(1).value = {
        richText: [
          { font: { bold: true }, text: `${t('instructions')} : ` },
          { text: instructions },
        ],
      };
      rowIndex += 1;
    }
  }

  if (volunteers && volunteers.length > 0) {
    row = worksheet.getRow(rowIndex);
    row.getCell(1).value = {
      richText: [
        { font: { bold: true }, text: `${t('volunteers')} : ` },
        { text: volunteers.map((v) => formatVolunteer(v.user)).join(', ') },
      ],
    };
    rowIndex += 1;
  }

  if (catalog) {
    /** */
    rowIndex += 1;
  }

  /** */
  row = worksheet.getRow(rowIndex);
  row.values = head.map((cell) => {
    return cell.value;
  });
  head.forEach((cell, i) => {
    if (cell.align && cell.align === 'center') {
      row.getCell(i + 1).alignment = {
        horizontal: 'center',
        vertical: 'middle',
      };
    }
  });
  row.font = { bold: true };
  row.fill = {
    type: 'pattern',
    pattern: 'lightGray',
  };
  rowIndex += 1;

  /** */
  body.forEach((rows) => {
    rows.forEach((bodyRow, i) => {
      row = worksheet.getRow(rowIndex);
      row.values = bodyRow.map((cell) => {
        let res;
        const value = 'value' in cell ? cell.value : '';
        if (Array.isArray(value)) {
          if (value.join('') === '') {
            res = '';
          } else {
            res = value.join(' - ');
          }
        } else if (typeof value === 'string' || typeof value === 'number') {
          res = value;
        }
        return res === ' - ' ? '' : res;
      });
      if (i % 2 !== 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'gray125',
        };
      }
      bodyRow.forEach((cell, ii) => {
        if (cell.align && cell.align === 'center') {
          row.getCell(ii + 1).alignment = {
            horizontal: 'center',
            vertical: 'middle',
          };
        }
      });
      rowIndex += 1;
    });
  });

  /** EXPORT */
  const buf = await workbook.xlsx.writeBuffer();
  saveAs(
    new Blob([buf], { type: 'text/plain;charset=utf-8' }),
    `${fileName}.xlsx`,
  );
};

function initializeName(name: string) {
  if(name.length <= 3) return formatFirstName(name);
  return `${formatFirstName(name).slice(0, 3)}.`;
}

export const formatUserSubNames = (
  user: Pick<User, 'lastName' | 'firstName'>,
  { fullFirstName = false }: { fullFirstName?: boolean } = {},
) => {
  const { lastName, firstName } = user;
  let first = fullFirstName
    ? formatFirstName(firstName)
    : initializeName(firstName);

  if (first.length > 18) {
    first = `${first.slice(0, 15)}...`;
  }

  let last = formatLastName(lastName);
  if(last.length + first.length > 36)
    return `${last.slice(0, 15)}... ${first}`;
  
  return `${last} ${first}`;
};

export const formatVolunteer = (
  user: Pick<User, 'lastName' | 'firstName' | 'phone' | 'email'>,
  volunteerRole?: Pick<VolunteerRole, 'name'>,
) => {
  let res = '';

  if (volunteerRole) {
    res += `${volunteerRole.name} : `;
  }

  res += `${formatUserSubNames(user, { fullFirstName: true })} (`;

  if (user.phone) {
    res += `${user.phone})`;
  }

  return res;
};

export const formatPhone = (phone: Maybe<string>) => {
  if (!phone) return '';
  let res = phone.replace(/\s/g, '').replace(/[^\d.]/g, '');
  let prefix = '';

  const prefixRegex = /^(\+\d\d\d)/;
  const matchPrefix = res.match(prefixRegex);
  if (matchPrefix) {
    prefix = `${matchPrefix[0]}.`;
    res = res.replace(prefixRegex, '');
  }

  let matchBody;
  if (res.length % 2 === 0) {
    matchBody = res.match(/(\d\d)/g);
  }
  if (!matchBody) {
    return phone.replace(/\s/g, '');
  }
  return `${prefix}${matchBody.join('.')}`;
};

const ATTENDANCE_LIST_FORMAT_KEY = 'ATTENDANCE_LIST_FORMAT';

export const loadAttendanceUserFormat = (): CsaAttendanceFormat => {
  const defaultValue: CsaAttendanceFormat = {
    classicContractContact: 0,
    classicContractProduct: 0,
    classicContractDate: 0,

    variableContractContact: 0,

    cellHeight: 'big',
    onePersonPerPage: false,
  };

  try {
    return {
      ...defaultValue,
      ...JSON.parse(localStorage.getItem(ATTENDANCE_LIST_FORMAT_KEY) || '{}'),
    };
  } catch (error) {}

  return defaultValue;
};

export const saveAttendanceUserFormat = (newFormat: CsaAttendanceFormat) => {
  localStorage.setItem(ATTENDANCE_LIST_FORMAT_KEY, JSON.stringify(newFormat));
};

export const formatCatalogContact = (
  user: Pick<User, 'firstName' | 'lastName' | 'phone' | 'email'>,
) => {
  let res = formatUserName(user);
  if (user.phone) {
    res = `${res} - ${user.phone}`;
  }
  res = `${res} - ${user.email}`;
  return res;
};

export const formatCatalogVendor = (
  vendor: Pick<Vendor, 'name' | 'email' | 'phone'>,
) => {
  let res = `${vendor.name}`;
  if (vendor.phone) {
    res = `${res} - ${vendor.phone}`;
  }
  res = `${res} - ${vendor.email}`;
  return res;
};
