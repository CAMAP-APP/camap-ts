import { ChevronLeft } from '@mui/icons-material';
import ChevronRight from '@mui/icons-material/ChevronRight';
import {
  FormControl,
  Grid,
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import {
  addYears,
  getMonth,
  getYear,
  setMonth,
  setYear,
  subYears,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import React from 'react';

export type CalendarSize = 'small' | 'normal';

interface CalendarMonthHeaderProps {
  date: Date;
  setDate: (date: Date) => void;
  nextDisabled: boolean;
  prevDisabled: boolean;
  onClickNext: () => void;
  onClickPrevious: () => void;
  size?: CalendarSize;
  minDate?: Date;
  maxDate?: Date;
}

const generateYears = (minDate: Date, maxDate: Date) => {
  const years = [];
  for (let i = minDate.getFullYear(); i <= maxDate.getFullYear(); i++) {
    years.push(i);
  }
  return years;
};

const CalendarMonthHeader = ({
  date,
  setDate,
  nextDisabled,
  prevDisabled,
  onClickNext,
  onClickPrevious,
  size = 'normal',
  minDate = subYears(new Date(), 5),
  maxDate = addYears(new Date(), 5),
}: CalendarMonthHeaderProps) => {
  const MONTHS = [...Array(12).keys()].map((d) =>
    fr.localize?.month(d, { width: 'abbreviated', context: 'standalone' }),
  );

  const handleMonthChange = (event: SelectChangeEvent<number>) => {
    setDate(setMonth(date, parseInt(event.target.value as string, 10)));
  };

  const handleYearChange = (event: SelectChangeEvent<number>) => {
    setDate(setYear(date, parseInt(event.target.value as string, 10)));
  };

  const anchorRef = React.useRef<HTMLDivElement>(null);

  return (
    <Grid
      container
      justifyContent="space-between"
      alignItems="center"
      pl={size === 'small' ? 2 : 3}
      pr={size === 'small' ? 0.5 : 1.5}
    >
      <Grid item>
        <FormControl variant="standard" ref={anchorRef}>
          <Select
            value={getMonth(date)}
            onChange={handleMonthChange}
            MenuProps={{
              disablePortal: true,
              anchorPosition: {
                top: anchorRef.current
                  ? anchorRef.current.offsetTop + anchorRef.current.clientHeight
                  : 0,
                left: anchorRef.current ? anchorRef.current.offsetLeft : 0,
              },
              anchorReference: 'anchorPosition',
            }}
            disabled={size === 'small'}
            sx={{
              '& .MuiSelect-select.Mui-disabled.MuiInput-input':
                size === 'small'
                  ? {
                      pr: 'initial',
                    }
                  : {},
              '& .MuiSelect-icon':
                size === 'small'
                  ? {
                      display: 'none',
                    }
                  : {},
            }}
          >
            {MONTHS.map((month, index) => (
              <MenuItem key={month} value={index}>
                {month}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl variant="standard" sx={{ ml: 1 }}>
          <Select
            value={getYear(date)}
            onChange={handleYearChange}
            MenuProps={{
              disablePortal: true,
              anchorOrigin: {
                vertical: 'center',
                horizontal: 'center',
              },
              transformOrigin: {
                vertical: 'center',
                horizontal: 'right',
              },
            }}
            disabled={size === 'small'}
            sx={{
              '& .MuiSelect-select.Mui-disabled.MuiInput-input':
                size === 'small'
                  ? {
                      pr: 'initial',
                    }
                  : {},
              '& .MuiSelect-icon':
                size === 'small'
                  ? {
                      display: 'none',
                    }
                  : {},
            }}
          >
            {generateYears(minDate, maxDate).map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item>
        <IconButton
          sx={{
            padding: size === 'small' ? 0.5 : 1,
            '&:hover':
              size !== 'small'
                ? {
                    background: 'none',
                  }
                : {},
          }}
          disabled={prevDisabled}
          onClick={onClickPrevious}
        >
          <ChevronLeft color={prevDisabled ? 'disabled' : 'action'} />
        </IconButton>

        <IconButton
          sx={{
            padding: size === 'small' ? 0.5 : 1,
            '&:hover':
              size !== 'small'
                ? {
                    background: 'none',
                  }
                : {},
          }}
          disabled={nextDisabled}
          onClick={onClickNext}
        >
          <ChevronRight color={nextDisabled ? 'disabled' : 'action'} />
        </IconButton>
      </Grid>
    </Grid>
  );
};

export default CalendarMonthHeader;
