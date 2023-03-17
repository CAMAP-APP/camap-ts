import {
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import React from 'react';
import { useCamapTranslation } from '../../../utils/hooks/use-camap-translation';
import { AttendanceFormat } from '../attendanceSheet.interface';

export interface AttendanceCellHeightFormatOptionProps {
  value: AttendanceFormat['cellHeight'];
  onChange: (value: AttendanceFormat['cellHeight']) => void;
}

export const AttendanceCellHeightFormatOption = ({
  value,
  onChange,
}: AttendanceCellHeightFormatOptionProps) => {
  const { t } = useCamapTranslation({
    tAL: 'attendance',
  });

  return (
    <Box display="flex">
      <FormControl component="fieldset">
        <FormLabel component="legend">{t('format.cellHeight.label')}</FormLabel>
        <RadioGroup
          row
          aria-label={t('format.cellHeight.label')}
          name="cell-format"
          value={value}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            onChange(event.target.value as 'big' | 'small');
          }}
        >
          <FormControlLabel
            value={'big'}
            control={<Radio />}
            label={`${t('format.cellHeight.big')}`}
          />
          <FormControlLabel
            value={'small'}
            control={<Radio />}
            label={`${t('format.cellHeight.small')}`}
          />
        </RadioGroup>
      </FormControl>
    </Box>
  );
};

export default AttendanceCellHeightFormatOption;
