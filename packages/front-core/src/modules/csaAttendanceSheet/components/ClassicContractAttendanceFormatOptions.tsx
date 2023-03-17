import {
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import { useCamapTranslation } from '@utils/hooks/use-camap-translation';
import React from 'react';
import AttendanceCellHeightFormatOption from '../../../components/attendanceSheet/components/AttendanceCellHeightFormatOption';
import { CsaAttendanceFormat } from '../attendanceSheetCsa.interface';

export interface ClassicContractAttendanceFormatOptionsProps {
  value: CsaAttendanceFormat;
  onChange: (value: CsaAttendanceFormat) => void;
}

export const ClassicContractAttendanceFormatOptions = ({
  value,
  onChange,
}: ClassicContractAttendanceFormatOptionsProps) => {
  const { t } = useCamapTranslation({
    tAL: 'attendance',
  });

  /** */
  return (
    <>
      <Box display="flex" mb={1}>
        <FormControl component="fieldset">
          <FormLabel component="legend">{t('format.contact.label')}</FormLabel>
          <RadioGroup
            row
            aria-label={t('format.contact.label')}
            name="contact-format"
            value={value.classicContractContact}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              onChange({
                ...value,
                classicContractContact: parseInt(
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

      <Box display="flex" mb={1}>
        <FormControl component="fieldset">
          <FormLabel component="legend">{t('format.product.label')}</FormLabel>
          <RadioGroup
            row
            aria-label={t('format.product.label')}
            name="product-format"
            value={value.classicContractProduct}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              onChange({
                ...value,
                classicContractProduct: parseInt(
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
                label={`${t(`format.product.${id}`)}`}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </Box>

      <Box display="flex" mb={1}>
        <FormControl component="fieldset">
          <FormLabel component="legend">{t('format.date.label')}</FormLabel>
          <RadioGroup
            row
            aria-label={t('format.date.label')}
            name="date-format"
            value={value.classicContractDate}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              onChange({
                ...value,
                classicContractDate: parseInt(
                  (event.target as HTMLInputElement).value,
                  10,
                ) as any,
              });
            }}
          >
            {[0, 1, 2].map((id) => (
              <FormControlLabel
                key={id}
                value={id}
                control={<Radio />}
                label={`${t(`format.date.${id}`)}`}
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

export default ClassicContractAttendanceFormatOptions;
