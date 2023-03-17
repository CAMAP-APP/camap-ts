import {
  add,
  addMonths,
  isAfter,
  isBefore,
  lastDayOfMonth,
  setDate,
  sub,
} from 'date-fns';
import React from 'react';
import Month from './components/Month';
import { CalendarMarker, CalendarNavigationAction } from './types';

interface CalendarProps {
  helpers: {
    isHighlighted?: (day: Date) => boolean;
    isEncircled?: (day: Date) => boolean;
    isFilled?: (day: Date) => boolean;
    isDayClickable?: (day: Date) => boolean;
  };
  minDate?: Date;
  maxDate?: Date;
  onDayClick?: (day: Date) => void;
}

const Calendar = ({ helpers, minDate, maxDate, onDayClick }: CalendarProps) => {
  const todayOrMinDate = minDate || new Date();
  const firstDateOfMonth = setDate(todayOrMinDate, 1);
  const lastDateOfMonth = lastDayOfMonth(todayOrMinDate);
  const [value, setValue] = React.useState<Date>(firstDateOfMonth);

  React.useEffect(() => {
    if (!minDate) return;

    const firstDateOfMonth = setDate(minDate, 1);
    setValue(firstDateOfMonth);
  }, [minDate]);

  const onMonthNavigate = (
    _: CalendarMarker,
    action: CalendarNavigationAction,
  ) => {
    setValue(addMonths(value, action));
  };

  return (
    <Month
      value={value}
      setValue={setValue}
      helpers={helpers}
      handlers={{ onMonthNavigate, onDayClick }}
      size="small"
      minDate={minDate}
      maxDate={maxDate}
      canNavigateBack={
        minDate ? isAfter(sub(value, { days: 1 }), minDate) : true
      }
      canNavigateForward={
        maxDate ? isBefore(add(lastDateOfMonth, { days: 1 }), maxDate) : true
      }
    />
  );
};

export default Calendar;
