import { TextFieldProps as MuiTextFieldProps } from '@mui/material/TextField';
import {
  TimePicker as MuiTimePicker,
  TimePickerProps as MuiTimePickerProps,
} from '@mui/x-date-pickers/TimePicker';
import React from 'react';
import withOpenablePicker from './withOpenablePicker';

const TimePicker = ({
  children,
  textFieldProps,
  ...props
}: Omit<MuiTimePickerProps<Date, Date>, 'renderInput'> & {
  textFieldProps?: MuiTextFieldProps;
}) => {
  const OpenablePicker = React.useMemo(
    () => withOpenablePicker(MuiTimePicker),
    [],
  );
  return (
    <OpenablePicker {...props} textFieldProps={textFieldProps}>
      {children}
    </OpenablePicker>
  );
};

export default TimePicker;
