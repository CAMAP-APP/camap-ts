import {
  format as formatFNS,
  formatDistance as formatDistanceFNS,
  formatDistanceStrict as formatDistanceStrictFNS,
  formatRelative as formatRelativeFNS,
} from 'date-fns';
import fr from 'date-fns/locale/fr';
import { firstLetterUppercase } from './strings';

const computeStrOptions = (str: string, options?: { firstLetterUppercase?: boolean }) => {
  let res = str;
  if (options) {
    if (options.firstLetterUppercase) res = firstLetterUppercase(res);
  }
  return res;
};

export const format = (date: number | Date, f: string, strOptions?: { firstLetterUppercase?: boolean }) =>
  computeStrOptions(formatFNS(date, f, { locale: fr }), strOptions);

export const formatDistance = (
  date: number | Date,
  baseDate: Date,
  options?: { includeSeconds?: boolean; addSuffix?: boolean },
  strOptions?: { firstLetterUppercase?: boolean },
) => computeStrOptions(formatDistanceFNS(date, baseDate, { ...options, locale: fr }), strOptions);

export const formatDistanceStrict = (
  date: number | Date,
  baseDate: Date,
  options?: {
    addSuffix?: boolean;
    unit?: 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year';
    roundingMethod?: 'floor' | 'ceil' | 'round';
  },
  strOptions?: { firstLetterUppercase?: boolean },
) => computeStrOptions(formatDistanceStrictFNS(date, baseDate, { ...options, locale: fr }), strOptions);

export const formatRelative = (
  date: number | Date,
  baseDate: Date,
  options?: {
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  },
  strOptions?: { firstLetterUppercase?: boolean },
) => computeStrOptions(formatRelativeFNS(date, baseDate, { ...options, locale: fr }), strOptions);
