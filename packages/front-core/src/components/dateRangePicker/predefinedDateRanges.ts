import { DateRange } from 'camap-common';
import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  endOfMonth,
  endOfWeek,
  endOfYear,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from 'date-fns';
import { fr } from 'date-fns/locale';

type PredefinedRangeType =
  | 'today'
  | 'yesterday'
  | 'thisWeek'
  | 'lastWeek'
  | 'last7Days'
  | 'thisMonth'
  | 'lastMonth'
  | 'last31Days'
  | 'thisYear'
  | 'lastYear';

type PredefinedRangeMap = {
  [DefaultRangeTypeType in PredefinedRangeType]: {
    label: DefaultRangeTypeType;
  } & DateRange;
};

export type PredefinedRange = {
  [DefaultRangeTypeType in PredefinedRangeType]: {
    label: DefaultRangeTypeType;
  } & DateRange;
}[PredefinedRangeType];

export const getPredefinedRanges = (date: Date): PredefinedRangeMap => ({
  today: {
    label: 'today',
    start: date,
    end: date,
  },
  yesterday: {
    label: 'yesterday',
    start: addDays(date, -1),
    end: addDays(date, -1),
  },
  thisWeek: {
    label: 'thisWeek',
    start: startOfWeek(date, { locale: fr }),
    end: endOfWeek(date, { locale: fr }),
  },
  lastWeek: {
    label: 'lastWeek',
    start: startOfWeek(addWeeks(date, -1), { locale: fr }),
    end: endOfWeek(addWeeks(date, -1), { locale: fr }),
  },
  last7Days: {
    label: 'last7Days',
    start: addWeeks(date, -1),
    end: date,
  },
  thisMonth: {
    label: 'thisMonth',
    start: startOfMonth(date),
    end: endOfMonth(date),
  },
  lastMonth: {
    label: 'lastMonth',
    start: startOfMonth(addMonths(date, -1)),
    end: endOfMonth(addMonths(date, -1)),
  },
  last31Days: {
    label: 'last31Days',
    start: addDays(date, -31),
    end: date,
  },
  thisYear: {
    label: 'thisYear',
    start: startOfYear(date),
    end: endOfYear(date),
  },
  lastYear: {
    label: 'lastYear',
    start: startOfYear(addYears(date, -1)),
    end: endOfYear(addYears(date, -1)),
  },
});
