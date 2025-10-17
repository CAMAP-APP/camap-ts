import { formatAddress, formatCurrency } from 'camap-common';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { User, UserList } from 'gql';
import { TFunction } from 'i18next';
import { ProductUnit } from '../../components/utils/Product/ProductUnit';

export const formatDateFr = (date: Date, f: string = 'dd/MM/yyyy') =>
  format(date, f, { locale: fr });

export const firstLetterUppercase = (s: string) =>
  `${s.charAt(0).toUpperCase()}${s.slice(1).toLowerCase()}`;

export const formatUserName = (user: { firstName: string; lastName: string }) =>
  `${user.lastName.toUpperCase()} ${firstLetterUppercase(user.firstName)}`;

export const formatUserAndPartnerNames = (user: Pick<User, 'firstName' | 'lastName' | 'firstName2' | 'lastName2'>) => {
  const userName = formatUserName(user);

  if (user.firstName2 && user.lastName2) {
    const partnerName = formatUserName({
      firstName: user.firstName2,
      lastName: user.lastName2,
    });
    return `${userName} & ${partnerName}`;
  }

  return userName;
};

export const formatUserAddress = (user: User): string => {
  if (!user.city && !user.zipCode) return '';

  return formatAddress(user);
};

export const formatAbsoluteDate = (
  date: Date,
  withTime = false,
  uppercased = true,
  showYear = false,
  showDayOfWeek = true,
): string => {
  if (Number.isNaN(date.getTime())) return '';
  let pattern = 'd MMMM';
  if (showDayOfWeek) pattern = `EEEE ${pattern}`;
  if (showYear) pattern += ' yyyy';
  if (withTime) pattern += "' à' H'h'mm";
  const formattedDate = format(date, pattern, {
    locale: fr,
  });
  return uppercased ? firstLetterUppercase(formattedDate) : formattedDate;
};

export const formatDate = (
  date: Date,
  withTime = false,
  uppercased = true,
  showYear = false,
) => {
  if (Number.isNaN(date.getTime())) return '';

  if (isYesterday(date)) {
    const pattern = withTime ? "'hier à' H'h'mm" : "'hier'";
    const formattedDate = format(date, pattern, {
      locale: fr,
    });
    return uppercased ? firstLetterUppercase(formattedDate) : formattedDate;
  }

  if (isToday(date)) {
    const pattern = withTime ? "'aujourd''hui à' H'h'mm" : "'aujourd''hui'";
    const formattedDate = format(date, pattern, {
      locale: fr,
    });
    return uppercased ? firstLetterUppercase(formattedDate) : formattedDate;
  }

  return formatAbsoluteDate(date, withTime, uppercased, showYear);
};

export const formatTime = (date: Date) => {
  if (Number.isNaN(date.getTime())) return '';

  return format(date, "H'h'mm", {
    locale: fr,
  });
};

/**
  Time from now to date
* */
export const timeToDate = (date: Date): string => {
  if (Number.isNaN(date.getTime())) return '';
  const now = Date.now();
  let diff = date.getTime() / 1000 - now / 1000;
  let str = '';
  if (diff > 0) str += 'dans ';
  else str += 'il y a ';
  diff = Math.abs(diff);
  if (diff < 3600) {
    // minutes
    str += `${Math.round(diff / 60)} minutes`;
  } else if (diff < 3600 * 24) {
    // hours
    str += `${Math.round(diff / 3600)} heures`;
  } else {
    // days
    str += `${Math.round(diff / (3600 * 24))} jours`;
  }
  return str;
};

export const formatUserList = (
  userList: UserList,
  t: TFunction,
  withCount = true,
): string => {
  let label = `${t(`${userList.type}`)}`;

  if (userList.type === 'contractSubscribers' && userList.data) {
    const contract = JSON.parse(userList.data);
    if (contract) {
      label = t(`${userList.type}`, {
        name: contract.name,
        startDate: new Date(contract.startDate).toLocaleDateString(),
        endDate: new Date(contract.endDate).toLocaleDateString(),
      });
    }
  }

  if (userList.type === 'withProductToGetOnDistribution' && userList.data) {
    const distribution = JSON.parse(userList.data);
    if (distribution) {
      label = t(`${userList.type}`, {
        catalogName: distribution.catalogName,
        date: new Date(distribution.raw_date).toLocaleDateString(),
      });
    }
  }

  const showCount =
    withCount && userList.count !== null && userList.count !== undefined;

  return showCount ? `${label} (${userList.count})` : label;
};

/**
  Display a number with a comma and 2 digits
* */
export const formatNumber = (n?: number): string => {
  if (n === undefined) return '';

  // arrondi a 2 apres virgule
  let out = round(n).toString();

  // ajout un zéro, 1,8-->1,80
  if (out.indexOf('.') !== -1 && out.split('.')[1].length === 1) out += '0';

  // virgule et pas point
  return out.split('.').join(',');
};

/**
 *  Display a unit
 */
export const formatUnit = (
  u?: ProductUnit,
  quantity?: number,
  t?: TFunction,
): string => {
  switch (u) {
    case ProductUnit.Kilogram:
      return 'Kg.';
    case ProductUnit.Gram:
      return 'g.';
    case ProductUnit.Litre:
      return 'L.';
    case ProductUnit.Centilitre:
      return 'cl.';
    case ProductUnit.Millilitre:
      return 'ml.';
    case ProductUnit.Piece:
    default:
      if (!t) return '';
      if (!quantity || quantity <= 1.0) return t('item');
      return t('item_plural');
  }
};

/**
 * Price per Kg/Liter...
 */
export const formatPricePerUnit = (
  price: number,
  qt?: number,
  unit?: ProductUnit,
  t?: TFunction,
): string => {
  if (!qt || !price) return '';
  let ppu = price / qt;
  let u = unit;

  // turn small prices in Kg
  if (ppu < 1) {
    switch (unit) {
      case ProductUnit.Gram:
        ppu *= 1000;
        u = ProductUnit.Kilogram;
        break;
      case ProductUnit.Centilitre:
        ppu *= 100;
        u = ProductUnit.Litre;
        break;
      case ProductUnit.Millilitre:
        ppu *= 1000;
        u = ProductUnit.Litre;
        break;
      default:
    }
  }
  return `${formatCurrency(ppu)}/${formatUnit(u, qt, t)}`;
};

export const round = (number: number): number => {
  return Math.round(number * 100) / 100;
};
