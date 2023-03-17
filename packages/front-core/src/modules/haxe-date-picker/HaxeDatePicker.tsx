import { CalendarPickerView } from '@mui/x-date-pickers';
import React from 'react';
import DatePicker from '../../components/forms/Pickers/DatePicker';
import DateTimePicker from '../../components/forms/Pickers/DateTimePicker';
import TimePicker from '../../components/forms/Pickers/TimePicker';

export type HaxeDatePickerType = 'time' | 'date' | 'datetime-local';

export interface HaxeDatePickerProps {
  name: string;
  type: HaxeDatePickerType;
  value: string;
  required?: boolean;
  openTo?: CalendarPickerView;
}

const dateFormat = 'EEEE d MMMM yyyy';
const timeFormat = "HH'h'mm";
const datetimeFormat = `${dateFormat} à ${timeFormat}`;

export const jsToHaxeDateStr = (value: Date) => {
  const padDateFrag = (value: number) => String(value).padStart(2, '0');
  return `${value.getFullYear()}-${padDateFrag(
    value.getMonth() + 1,
  )}-${padDateFrag(value.getDate())} ${padDateFrag(
    value.getHours(),
  )}:${padDateFrag(value.getMinutes())}:${padDateFrag(value.getSeconds())}`;
};

export const HaxeDatePicker = ({
  value: initValue,
  name,
  type,
  required = false,
  openTo = 'day',
}: HaxeDatePickerProps) => {
  const [value, setValue] = React.useState<Date | null>(
    !initValue || initValue === ''
      ? new Date()
      : new Date(initValue.replace(' ', 'T')),
  );

  /** */
  const onChange = (date: Date | null) => {
    setValue(date);
  };

  const defaultProps = {
    textFieldProps: {
      fullWidth: true,
      name: `react_${name}`,
      required,
    },
  };

  let picker;

  /** */
  switch (type) {
    case 'time':
      picker = (
        <TimePicker
          {...defaultProps}
          ampm={false}
          inputFormat={timeFormat}
          value={value}
          onChange={onChange}
          InputProps={{ sx: { textTransform: 'capitalize' } }}
        />
      );
      break;
    case 'datetime-local':
      picker = (
        <DateTimePicker
          {...defaultProps}
          ampm={false}
          inputFormat={datetimeFormat}
          value={value}
          onChange={onChange}
        />
      );
      break;
    default:
      picker = (
        <DatePicker
          {...defaultProps}
          inputFormat={dateFormat}
          openTo={openTo}
          value={value}
          onChange={onChange}
          InputProps={{ sx: { textTransform: 'capitalize' } }}
        />
      );
      break;
  }

  return (
    <>
      <input
        type="hidden"
        name={name}
        value={value ? jsToHaxeDateStr(value) : ''}
      />
      {picker}
    </>
  );
};

export default HaxeDatePicker;
