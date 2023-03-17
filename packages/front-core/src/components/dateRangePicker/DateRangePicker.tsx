import { ArrowBack, ArrowForward, ArrowRightAlt } from '@mui/icons-material';
import { LoadingButton, LoadingButtonProps } from '@mui/lab';
import {
  Box,
  ClickAwayListener,
  Fade,
  Grid,
  Popper,
  PopperPlacementType,
  TextField,
  useMediaQuery,
} from '@mui/material';
import { DateRange } from 'camap-common';
import {
  addMonths,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  max,
  min,
  subMonths,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import * as React from 'react';
import theme from '../../theme';
import { useCamapTranslation } from '../../utils/hooks/use-camap-translation';
import {
  CalendarMarker,
  CalendarNavigationAction,
  CALENDAR_MARKERS,
} from '../calendar/types';
import DateRangePickerMenu from './Components/DateRangePickerMenu';
import { getPredefinedRanges, PredefinedRange } from './predefinedDateRanges';

const getValidatedMonths = (
  range: DateRange,
  minDate?: Date,
  maxDate?: Date,
) => {
  const { start, end } = range;
  if (start && end) {
    const newStart = minDate ? max([start, minDate]) : start;
    const newEnd = maxDate ? min([end, maxDate]) : end;

    return [
      newStart,
      isSameMonth(newStart, newEnd) ? addMonths(newStart, 1) : newEnd,
    ];
  }
  return [start, end];
};

interface DateRangePickerProps {
  value: DateRange;
  onChange: (dateRange: DateRange) => void;
  predefinedRanges?: PredefinedRange[];
  minDate?: Date;
  maxDate?: Date;
  placement?: PopperPlacementType;
  isEncircled?: (day: Date) => boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  startLabel?: string;
  endLabel?: string;
  withArrows?: boolean;
  PreviousButtonProps?: LoadingButtonProps;
  NextButtonProps?: LoadingButtonProps;
  closeOnRangeChanged?: boolean;
}

const DateRangePicker = ({
  value,
  onChange,
  minDate,
  maxDate,
  predefinedRanges = Object.values(getPredefinedRanges(new Date())),
  placement,
  isEncircled,
  fullWidth = false,
  disabled = false,
  startLabel,
  endLabel,
  withArrows = false,
  PreviousButtonProps,
  NextButtonProps,
  closeOnRangeChanged = true,
}: DateRangePickerProps) => {
  const { t } = useCamapTranslation({ t: 'date' });

  const isDownSm = useMediaQuery(theme.breakpoints.down('sm'));

  const [open, setOpen] = React.useState(false);
  const toggle = () => setOpen(!open);
  const anchorRef = React.useRef(null);

  const today = new Date();

  const [intialFirstMonth, initialSecondMonth] = getValidatedMonths(
    value || {},
    minDate,
    maxDate,
  );

  const [hoverDay, setHoverDay] = React.useState<Date>();
  const [firstMonth, setFirstMonth] = React.useState<Date>(
    intialFirstMonth || today,
  );
  const [secondMonth, setSecondMonth] = React.useState<Date>(
    initialSecondMonth || addMonths(firstMonth, 1),
  );

  const { start, end } = value;

  const onClickAway = () => {
    if (!open) return;

    toggle();
    setTextFieldFocused(false);
  };

  // text fields
  const [textFieldFocused, setTextFieldFocused] = React.useState(open);
  const onTextFieldFocus = () => setTextFieldFocused(true);

  const [textFieldHovered, setTextFieldHovered] = React.useState(false);

  const onMouseEnter = () => {
    if (disabled) return;
    setTextFieldHovered(true);
  };

  const onMouseLeave = () => {
    if (disabled) return;
    setTextFieldHovered(false);
  };

  const onArrowClick = () => {
    if (disabled) return;
    onTextFieldFocus();
    toggle();
  };

  const onTextFieldClick = () => {
    if (disabled) return;
    toggle();
  };

  // handlers
  const setFirstMonthValidated = (date: Date) => {
    if (isBefore(date, secondMonth)) {
      setFirstMonth(date);
    }
  };

  const setSecondMonthValidated = (date: Date) => {
    if (isAfter(date, firstMonth)) {
      setSecondMonth(date);
    }
  };

  const setDateRangeValidated = (range: DateRange) => {
    let { start: newStart, end: newEnd } = range;

    if (newStart && newEnd) {
      range.start = newStart = minDate ? max([newStart, minDate]) : newStart;
      range.end = newEnd = maxDate ? min([newEnd, maxDate]) : newEnd;

      onChange(range);

      setFirstMonth(newStart);
      setSecondMonth(
        isSameMonth(newStart, newEnd) ? addMonths(newStart, 1) : newEnd,
      );
      if (closeOnRangeChanged) toggle();
    } else {
      const emptyRange = { start: undefined, end: undefined };

      onChange(emptyRange);

      setFirstMonth(today);
      setSecondMonth(addMonths(firstMonth, 1));
    }
  };

  const onDayClick = (day: Date) => {
    if (start && !end && !isBefore(day, start)) {
      const newRange = { start, end: day };
      onChange(newRange);
      if (closeOnRangeChanged) toggle();
    } else {
      onChange({ start: day, end: undefined });
    }
    setHoverDay(day);
  };

  const onMonthNavigate = (
    marker: CalendarMarker,
    action: CalendarNavigationAction,
  ) => {
    if (marker === CALENDAR_MARKERS.FIRST_MONTH) {
      const firstNew = addMonths(firstMonth, action);
      setFirstMonth(firstNew);
      if (isBefore(secondMonth, firstNew)) {
        setSecondMonth(addMonths(firstMonth, 1));
      }
    } else {
      const secondNew = addMonths(secondMonth, action);
      setSecondMonth(secondNew);
      if (isAfter(firstMonth, secondNew)) {
        setFirstMonth(subMonths(secondNew, 1));
      }
    }
  };

  const onDayHover = (date: Date) => {
    if (start && !end) {
      if (!hoverDay || !isSameDay(date, hoverDay)) {
        setHoverDay(date);
      }
    }
  };

  // helpers
  const isHighlighted = (day: Date) =>
    (start &&
      !end &&
      hoverDay &&
      isAfter(hoverDay, start) &&
      isWithinInterval(day, { start: start, end: hoverDay })) as boolean;

  const helpers = {
    isHighlighted,
    isEncircled,
  };

  const handlers = {
    onDayClick,
    onDayHover,
    onMonthNavigate,
  };

  const dateFormat = `dd ${isDownSm ? 'MMM' : 'MMMM'} yyyy`;

  const canBeOpen = open && Boolean(anchorRef.current);
  const id = canBeOpen ? 'transition-popper' : undefined;

  return (
    <Box display={{ xs: 'block', sm: 'flex' }}>
      <Box display="flex" width={withArrows ? 'auto' : '100%'}>
        <ClickAwayListener onClickAway={onClickAway}>
          <Box position="relative" width={fullWidth ? '100%' : 'auto'}>
            <Box display="flex" ref={anchorRef}>
              <Grid
                container
                alignItems="center"
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
              >
                <Grid
                  item
                  sx={{ flex: theme.shape.borderRadius, textAlign: 'center' }}
                >
                  <TextField
                    fullWidth={fullWidth}
                    disabled={disabled}
                    label={startLabel ? startLabel : t('Start Date')}
                    placeholder={startLabel ? startLabel : t('Start Date')}
                    value={
                      start ? format(start, dateFormat, { locale: fr }) : ''
                    }
                    onClick={onTextFieldClick}
                    inputProps={{ autoComplete: 'off' }}
                    focused={textFieldFocused}
                    onFocus={onTextFieldFocus}
                    sx={{
                      '& input': {
                        cursor: disabled ? 'default' : 'pointer',
                        caretColor: 'transparent',
                      },

                      '& .MuiOutlinedInput-notchedOutline': {
                        borderRight: 0,
                        borderTopRightRadius: 0,
                        borderBottomRightRadius: 0,
                        borderColor: (theme) =>
                          textFieldHovered
                            ? theme.palette.text.primary
                            : 'rgba(0, 0, 0, 0.23)',
                      },
                      '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline':
                        {
                          borderRight: 0,
                        },
                      '& .MuiInputBase-root': withArrows
                        ? {
                            borderBottomLeftRadius: {
                              xs: 0,
                              sm: theme.shape.borderRadius,
                            },
                          }
                        : {},
                    }}
                  />
                </Grid>
                <Grid
                  item
                  sx={{
                    textAlign: 'center',
                    px: { xs: 0, sm: 2 },
                    height: '100%',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <ArrowRightAlt
                    color={textFieldFocused ? 'primary' : 'action'}
                  />
                  <Box
                    onClick={onArrowClick}
                    sx={{
                      cursor: disabled ? 'default' : 'pointer',
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      top: textFieldFocused ? -1 : 0,
                      left: 0,
                      margin: 0,
                      py: 0,
                      borderStyle: 'solid',
                      borderWidth: textFieldFocused ? 2 : 0.9,
                      borderRight: 0,
                      borderLeft: 0,
                      borderColor: (theme) =>
                        textFieldFocused
                          ? theme.palette.primary.main
                          : textFieldHovered
                          ? theme.palette.text.primary
                          : 'rgba(0, 0, 0, 0.23)',
                    }}
                  />
                </Grid>
                <Grid
                  item
                  sx={{ flex: theme.shape.borderRadius, textAlign: 'center' }}
                >
                  <TextField
                    fullWidth={fullWidth}
                    disabled={disabled}
                    label={endLabel ? endLabel : t('End Date')}
                    placeholder={endLabel ? endLabel : t('End Date')}
                    value={end ? format(end, dateFormat, { locale: fr }) : ''}
                    onClick={onTextFieldClick}
                    inputProps={{ autoComplete: 'off' }}
                    focused={textFieldFocused}
                    onFocus={onTextFieldFocus}
                    sx={{
                      '& input': {
                        cursor: disabled ? 'default' : 'pointer',
                        caretColor: 'transparent',
                      },

                      '& .MuiOutlinedInput-notchedOutline': {
                        borderLeft: 0,
                        borderTopLeftRadius: 0,
                        borderBottomLeftRadius: 0,
                        borderColor: (theme) =>
                          textFieldHovered
                            ? theme.palette.text.primary
                            : 'rgba(0, 0, 0, 0.23)',
                      },
                      '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline':
                        {
                          borderLeft: 0,
                        },

                      '& .MuiInputBase-root': withArrows
                        ? {
                            borderTopRightRadius: {
                              xs: theme.shape.borderRadius,
                              sm: 0,
                            },
                            borderBottomRightRadius: 0,
                          }
                        : {},
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Popper
              id={id}
              open={open}
              anchorEl={anchorRef.current}
              transition
              placement={placement}
              sx={{ zIndex: 9999 }}
            >
              {({ TransitionProps }) => (
                <Fade {...TransitionProps}>
                  <div>
                    <DateRangePickerMenu
                      dateRange={value}
                      minDate={minDate}
                      maxDate={maxDate}
                      ranges={predefinedRanges}
                      firstMonth={firstMonth}
                      secondMonth={secondMonth}
                      setFirstMonth={setFirstMonthValidated}
                      setSecondMonth={setSecondMonthValidated}
                      setDateRange={setDateRangeValidated}
                      helpers={helpers}
                      handlers={handlers}
                    />
                  </div>
                </Fade>
              )}
            </Popper>
          </Box>
        </ClickAwayListener>
      </Box>

      {withArrows && (
        <Box display={'flex'} justifyContent={'center'}>
          <LoadingButton
            variant="outlined"
            sx={{
              width: '50%',
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: {
                xs: theme.shape.borderRadius,
                sm: 0,
              },
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
            }}
            {...PreviousButtonProps}
          >
            <ArrowBack />
          </LoadingButton>
          <LoadingButton
            variant="outlined"
            sx={{
              width: '50%',
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
              borderTopRightRadius: {
                xs: 0,
                sm: theme.shape.borderRadius,
              },
              borderBottomRightRadius: {
                xs: theme.shape.borderRadius,
                sm: theme.shape.borderRadius,
              },
            }}
            {...NextButtonProps}
          >
            <ArrowForward />
          </LoadingButton>
        </Box>
      )}
    </Box>
  );
};

export default DateRangePicker;
