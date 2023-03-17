import DateRangeIcon from '@mui/icons-material/DateRange';
import { InputAdornment } from '@mui/material';
import React from 'react';
import DatePicker from './forms/Pickers/DatePicker';

export interface DayPickerProps {
  value: Date;
  label?: string;
  format?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  onChange: (value: Date) => void;
}

export const DayPicker = ({
  value,
  label,
  disabled,
  format = 'd MMM yyyy',
  minDate,
  maxDate,
  onChange,
}: DayPickerProps) => {
  return (
    <DatePicker
      label={label}
      inputFormat={format}
      InputProps={{
        size: 'small',
        startAdornment: (
          <InputAdornment position="start">
            <DateRangeIcon />
          </InputAdornment>
        ),
        hiddenLabel: label ? false : true,
      }}
      disabled={disabled}
      minDate={minDate}
      maxDate={maxDate}
      value={value}
      onChange={(v) => onChange(v as Date)}
    />
  );
};

export default DayPicker;
