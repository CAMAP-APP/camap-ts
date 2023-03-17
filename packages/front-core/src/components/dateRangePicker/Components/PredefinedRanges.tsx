import { List, ListItemButton, ListItemText } from '@mui/material';
import { DateRange } from 'camap-common';
import { isSameDay } from 'date-fns';
import { useCamapTranslation } from '../../../utils/hooks/use-camap-translation';
import { PredefinedRange } from '../predefinedDateRanges';

type DefinedRangesProps = {
  setRange: (range: DateRange) => void;
  selectedRange: DateRange;
  ranges: PredefinedRange[];
};

const isSameRange = (first: DateRange, second: DateRange) => {
  const { start: fStart, end: fEnd } = first;
  const { start: sStart, end: sEnd } = second;
  if (fStart && sStart && fEnd && sEnd) {
    return isSameDay(fStart, sStart) && isSameDay(fEnd, sEnd);
  }
  return false;
};

const PredefinedRanges = ({
  ranges,
  setRange,
  selectedRange,
}: DefinedRangesProps) => {
  const { t } = useCamapTranslation({ t: 'date' });

  return (
    <List>
      {ranges.map((range, index) => (
        <ListItemButton
          key={index}
          onClick={() => setRange(range)}
          selected={isSameRange(range, selectedRange)}
          sx={[
            {
              whiteSpace: 'pre',
            },
          ]}
        >
          <ListItemText
            primaryTypographyProps={{
              variant: 'body2',
            }}
          >
            {t(range.label)}
          </ListItemText>
        </ListItemButton>
      ))}
    </List>
  );
};

export default PredefinedRanges;
