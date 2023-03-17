import {
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import React from 'react';
import AttendanceCellHeightFormatOption from '../../../components/attendanceSheet/components/AttendanceCellHeightFormatOption';
import { useCamapTranslation } from '../../../utils/hooks/use-camap-translation';
import { CsaAttendanceFormat } from '../attendanceSheetCsa.interface';

export interface VariableContractAttendanceFormatOptionsProps {
  value: CsaAttendanceFormat;
  onChange: (value: CsaAttendanceFormat) => void;
}

export const VariableContractAttendanceFormatOptions = ({
  value,
  onChange,
}: VariableContractAttendanceFormatOptionsProps) => {
  const { t } = useCamapTranslation({
    tAL: 'attendance',
  });

  return (
    <>
      <Box display="flex" mb={1}>
        <FormControl component="fieldset">
          <FormLabel component="legend">{t('format.contact.label')}</FormLabel>
          <RadioGroup
            row
            aria-label={t('format.contact.label')}
            name="contact-format"
            value={value.variableContractContact}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              onChange({
                ...value,
                variableContractContact: parseInt(
                  (event.target as HTMLInputElement).value,
                  10,
                ) as any,
              });
            }}
          >
            {[0, 1].map((id) => (
              <FormControlLabel
                key={id}
                value={id}
                control={<Radio />}
                label={`${t(`format.contact.${id}`)}`}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </Box>

      <Box display="flex">
        <AttendanceCellHeightFormatOption
          value={value.cellHeight}
          onChange={(newCellHeight: 'big' | 'small') => {
            onChange({
              ...value,
              cellHeight: newCellHeight,
            });
          }}
        />
      </Box>
    </>
  );
};

export default VariableContractAttendanceFormatOptions;
