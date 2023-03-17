import { KeyboardArrowDown } from '@mui/icons-material';
import ArrowRightAlt from '@mui/icons-material/ArrowRightAlt';
import {
  Box,
  Button,
  Divider,
  Grid,
  Menu,
  Paper,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { DateRange } from 'camap-common';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import React from 'react';
import theme from '../../../theme';
import { useCamapTranslation } from '../../../utils/hooks/use-camap-translation';
import Month from '../../calendar/components/Month';
import {
  CalendarMarker,
  CalendarNavigationAction,
  CALENDAR_MARKERS,
} from '../../calendar/types';
import { PredefinedRange } from '../predefinedDateRanges';
import PredefinedRanges from './PredefinedRanges';

interface DateRangePickerMenuProps {
  dateRange: DateRange;
  ranges: PredefinedRange[];
  minDate?: Date;
  maxDate?: Date;
  firstMonth: Date;
  secondMonth: Date;
  setFirstMonth: (date: Date) => void;
  setSecondMonth: (date: Date) => void;
  setDateRange: (dateRange: DateRange) => void;
  helpers: {
    isHighlighted: (day: Date) => boolean;
    isEncircled?: (day: Date) => boolean;
  };
  handlers: {
    onDayClick: (day: Date) => void;
    onDayHover: (day: Date) => void;
    onMonthNavigate: (
      marker: CalendarMarker,
      action: CalendarNavigationAction,
    ) => void;
  };
}

const DateRangePickerMenu = ({
  ranges,
  dateRange,
  minDate,
  maxDate,
  firstMonth,
  setFirstMonth,
  secondMonth,
  setSecondMonth,
  setDateRange,
  helpers,
  handlers,
}: DateRangePickerMenuProps) => {
  const { t } = useCamapTranslation({ t: 'date' });

  const isDownSm = useMediaQuery(theme.breakpoints.down('sm'));

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const openMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const closeMenu = () => {
    setAnchorEl(null);
  };

  const { start, end } = dateRange;
  const commonProps = {
    dateRange,
    minDate,
    maxDate,
    helpers,
    handlers,
  };
  return (
    <Paper elevation={5}>
      <Box display="flex" flexDirection={'row'}>
        <Box display="flex" flexDirection="column">
          <Box
            sx={{ display: { xs: 'flex', sm: 'none' } }}
            justifyContent="center"
            p={1}
          >
            <>
              <Button
                variant="outlined"
                endIcon={<KeyboardArrowDown />}
                onClick={openMenu}
              >
                {t('predefinedRange')}
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={closeMenu}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
              >
                <PredefinedRanges
                  selectedRange={dateRange}
                  ranges={ranges}
                  setRange={setDateRange}
                />
              </Menu>
            </>
          </Box>

          <Divider
            orientation={'horizontal'}
            flexItem
            sx={{ display: { xs: 'block', sm: 'none' } }}
          />

          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Grid container py={2.5} px={8.75} alignItems="center">
              <Grid item sx={{ flex: 1, textAlign: 'center' }}>
                <Typography variant="subtitle1" sx={{ cursor: 'default' }}>
                  {start
                    ? format(start, 'dd MMMM yyyy', { locale: fr })
                    : t('Start Date')}
                </Typography>
              </Grid>
              <Grid item sx={{ flex: 1, textAlign: 'center' }}>
                <ArrowRightAlt color="action" />
              </Grid>
              <Grid item sx={{ flex: 1, textAlign: 'center' }}>
                <Typography variant="subtitle1" sx={{ cursor: 'default' }}>
                  {end
                    ? format(end, 'dd MMMM yyyy', { locale: fr })
                    : t('End Date')}
                </Typography>
              </Grid>
            </Grid>
            <Divider />
          </Box>
          <Grid
            container
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="center"
            wrap="nowrap"
            flex={1}
          >
            <Month
              {...commonProps}
              value={firstMonth}
              setValue={setFirstMonth}
              marker={CALENDAR_MARKERS.FIRST_MONTH}
            />
            <Divider
              orientation={isDownSm ? 'horizontal' : 'vertical'}
              flexItem
            />
            <Month
              {...commonProps}
              value={secondMonth}
              setValue={setSecondMonth}
              marker={CALENDAR_MARKERS.SECOND_MONTH}
            />
          </Grid>
        </Box>
        <Divider
          orientation="vertical"
          flexItem
          sx={{ display: { xs: 'none', sm: 'block' } }}
        />
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <PredefinedRanges
            selectedRange={dateRange}
            ranges={ranges}
            setRange={setDateRange}
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default DateRangePickerMenu;
