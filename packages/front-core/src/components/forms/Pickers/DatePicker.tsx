import { TextFieldProps as MuiTextFieldProps } from '@mui/material/TextField';
import {
  DatePicker as MuiDatePicker,
  DatePickerProps as MuiDatePickerProps,
} from '@mui/x-date-pickers/DatePicker';
import React from 'react';
import withOpenablePicker from './withOpenablePicker';

const DatePicker = ({
  children,
  textFieldProps,
  ...props
}: Omit<MuiDatePickerProps<Date, Date>, 'renderInput'> & {
  textFieldProps?: MuiTextFieldProps;
}) => {
  const OpenablePicker = React.useMemo(
    () => withOpenablePicker(MuiDatePicker as any),
    [],
  );

  return (
    <OpenablePicker {...props} textFieldProps={textFieldProps}>
      {children}
    </OpenablePicker>
  );
};

export default DatePicker;
