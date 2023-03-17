import TextField, {
  TextFieldProps as MuiTextFieldProps,
} from '@mui/material/TextField';
import { DatePickerProps as MuiDatePickerProps } from '@mui/x-date-pickers/DatePicker';
import { DateTimePickerProps as MuiDateTimePickerProps } from '@mui/x-date-pickers/DateTimePicker';
import { BasePickerProps } from '@mui/x-date-pickers/internals/models/props/basePickerProps';
import { TimePickerProps as MuiTimePickerProps } from '@mui/x-date-pickers/TimePicker';
import React from 'react';

const PickerInput = ({
  onClick,
  placeholder,
  ...params
}: MuiTextFieldProps & {
  onClick: () => void;
  placeholder: string;
}) => {
  const onKeyDown = (event: React.KeyboardEvent) => {
    event.preventDefault();
  };

  return (
    <TextField
      {...params}
      onClick={onClick}
      onKeyDown={onKeyDown}
      inputProps={{
        ...params.inputProps,
        placeholder,
      }}
    />
  );
};

export default function withOpenablePicker(
  Wrapped: React.ComponentType<
    Omit<BasePickerProps<Date, Date>, 'onChange' | 'value'> & {
      textFieldProps?: MuiTextFieldProps;
    } & Pick<
        | MuiDatePickerProps<Date, Date>
        | MuiDateTimePickerProps<Date, Date>
        | MuiTimePickerProps<Date, Date>,
        'renderInput' | 'disableMaskedInput' | 'disableOpenPicker'
      >
  >,
) {
  const Wrapper = ({
    textFieldProps,
    ...props
  }: Omit<
    | MuiDatePickerProps<Date, Date>
    | MuiDateTimePickerProps<Date, Date>
    | MuiTimePickerProps<Date, Date>,
    'renderInput' | 'onChange' | 'value'
  > & {
    textFieldProps?: MuiTextFieldProps;
  }) => {
    const [open, setOpen] = React.useState(false);

    const onOpen = () => !open && setOpen(true);
    const onClose = () => open && setOpen(false);

    return (
      <Wrapped
        {...props}
        open={open}
        onOpen={onOpen}
        onClose={onClose}
        disableMaskedInput
        disableOpenPicker
        renderInput={(params: MuiTextFieldProps) => (
          <PickerInput
            {...textFieldProps}
            {...params}
            onClick={onOpen}
            placeholder={`${props.label || ''}`}
            hiddenLabel={props.label ? false : true}
          />
        )}
      />
    );
  };

  return Wrapper;
}
