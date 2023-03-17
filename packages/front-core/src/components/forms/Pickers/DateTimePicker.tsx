import { TextFieldProps as MuiTextFieldProps } from '@mui/material/TextField';
import {
  DateTimePicker as MuiDateTimePicker,
  DateTimePickerProps as MuiDateTimePickerProps,
} from '@mui/x-date-pickers/DateTimePicker';
import React from 'react';
import withOpenablePicker from './withOpenablePicker';

const DateTimePicker = ({
  children,
  textFieldProps,
  ...props
}: Omit<MuiDateTimePickerProps<Date, Date>, 'renderInput'> & {
  textFieldProps?: MuiTextFieldProps;
}) => {
  const OpenablePicker = React.useMemo(
    () => withOpenablePicker(MuiDateTimePicker),
    [],
  );

  return (
    <OpenablePicker {...props} textFieldProps={textFieldProps}>
      {children}
    </OpenablePicker>
  );
};

export default DateTimePicker;
