import { Grid, Paper, Typography } from '@mui/material';
import { DateRange } from 'camap-common';
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  getDate,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isToday,
  isWithinInterval,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  CalendarMarker,
  CalendarNavigationAction,
  CALENDAR_MARKERS,
} from '../types';
import CalendarMonthHeader, { CalendarSize } from './CalendarMonthHeader';
import Day from './Day';

const getDaysInMonth = (date: Date) => {
  const startWeek = startOfWeek(startOfMonth(date), { locale: fr });
  const endWeek = endOfWeek(endOfMonth(date), { locale: fr });
  const days = [];
  for (let curr = startWeek; isBefore(curr, endWeek); ) {
    days.push(curr);
    curr = addDays(curr, 1);
  }
  return days;
};

const isStartOfRange = ({ start }: DateRange, day: Date) =>
  (start && isSameDay(day, start)) as boolean;

const isEndOfRange = ({ end }: DateRange, day: Date) =>
  (end && isSameDay(day, end)) as boolean;

const inDateRange = ({ start, end }: DateRange, day: Date) =>
  (start &&
    end &&
    (isWithinInterval(day, { start, end }) ||
      isSameDay(day, start) ||
      isSameDay(day, end))) as boolean;

const isRangeSameDay = ({ start, end }: DateRange) => {
  if (start && end) {
    return isSameDay(start, end);
  }
  return false;
};

const chunks = <T,>(array: ReadonlyArray<T>, size: number): T[][] => {
  return Array.from({ length: Math.ceil(array.length / size) }, (_v, i) =>
    array.slice(i * size, i * size + size),
  );
};

interface MonthProps {
  value: Date;
  marker?: CalendarMarker;
  dateRange?: DateRange;
  minDate?: Date;
  maxDate?: Date;
  canNavigateBack?: boolean;
  canNavigateForward?: boolean;
  setValue: (date: Date) => void;
  helpers: {
    isHighlighted?: (day: Date) => boolean;
    isEncircled?: (day: Date) => boolean;
    isFilled?: (day: Date) => boolean;
    isDayClickable?: (day: Date) => boolean;
  };
  handlers: {
    onDayClick?: (day: Date) => void;
    onDayHover?: (day: Date) => void;
    onMonthNavigate: (
      marker: CalendarMarker,
      action: CalendarNavigationAction,
    ) => void;
  };
  size?: CalendarSize;
}

const Month = ({
  helpers,
  handlers,
  value: date,
  dateRange = {},
  marker = CALENDAR_MARKERS.FIRST_MONTH,
  setValue: setDate,
  minDate,
  maxDate,
  canNavigateBack = true,
  canNavigateForward = true,
  size = 'normal',
}: MonthProps) => {
  const weekStartsOn = 1; // monday
  const WEEK_DAYS: string[] = [...Array(7).keys()].map((d) =>
    fr.localize!.day((d + weekStartsOn) % 7, {
      width: 'short',
      context: 'standalone',
    }),
  );

  const isBetweenMinAndMax = (day: Date): boolean => {
    if (minDate && maxDate) {
      return !isWithinInterval(day, { start: minDate, end: maxDate });
    } else if (minDate) {
      return isBefore(day, minDate);
    } else if (maxDate) {
      return isAfter(day, maxDate);
    }

    return false;
  };

  const onClickNext = () =>
    handlers.onMonthNavigate(marker, CalendarNavigationAction.Next);
  const onClickPrevious = () =>
    handlers.onMonthNavigate(marker, CalendarNavigationAction.Previous);

  return (
    <Paper square elevation={0} sx={{ width: size === 'small' ? 190 : 290 }}>
      <Grid container>
        <CalendarMonthHeader
          date={date}
          setDate={setDate}
          nextDisabled={!canNavigateForward}
          prevDisabled={!canNavigateBack}
          onClickPrevious={onClickPrevious}
          onClickNext={onClickNext}
          size={size}
          minDate={minDate}
          maxDate={maxDate}
        />

        <Grid
          item
          container
          direction="row"
          justifyContent="space-between"
          mt={size === 'small' ? 0.5 : 1.5}
          px={size === 'small' ? 2.25 : 3.75}
        >
          {WEEK_DAYS.map((day, index) => (
            <Typography color="textSecondary" key={index} variant="caption">
              {day}
            </Typography>
          ))}
        </Grid>

        <Grid
          item
          container
          direction="column"
          justifyContent="space-between"
          px={size === 'small' ? 0 : 2}
          mt={size === 'small' ? 0.5 : 2}
          mb={size === 'small' ? 1 : 2.5}
        >
          {chunks(getDaysInMonth(date), 7).map((week, index) => (
            <Grid key={index} container direction="row" justifyContent="center">
              {week.map((day) => {
                const isStart = isStartOfRange(dateRange, day);
                const isEnd = isEndOfRange(dateRange, day);
                const isRangeOneDay = isRangeSameDay(dateRange);
                const highlighted =
                  inDateRange(dateRange, day) ||
                  (helpers.isHighlighted ? helpers.isHighlighted(day) : false);
                const isStartOfEnd = isStart || isEnd;
                const filled = helpers.isFilled
                  ? helpers.isFilled(day) || isStartOfEnd
                  : isStartOfEnd;
                const encircled =
                  helpers.isEncircled && helpers.isEncircled(day);
                const dayIsClickable =
                  helpers.isDayClickable && helpers.isDayClickable(day);

                return (
                  <Day
                    key={format(day, 'dd-MM-yyyy')}
                    filled={filled}
                    outlined={isToday(day)}
                    highlighted={highlighted && !isRangeOneDay}
                    encircled={encircled}
                    disabled={
                      !isSameMonth(date, day) || isBetweenMinAndMax(day)
                    }
                    startOfRange={isStart && !isRangeOneDay}
                    endOfRange={isEnd && !isRangeOneDay}
                    onClick={
                      handlers.onDayClick
                        ? () => handlers.onDayClick!(day)
                        : undefined
                    }
                    onHover={
                      handlers.onDayHover
                        ? () => handlers.onDayHover!(day)
                        : undefined
                    }
                    value={getDate(day)}
                    size={size}
                    isClickable={dayIsClickable}
                  />
                );
              })}
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default Month;
