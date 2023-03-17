import withHelperTextTranslation from '@components/forms/shared/withHelperTextTranslation';
import { TextField } from '@mui/material';
import { Field, FieldAttributes } from 'formik';
import { fieldToTextField } from 'formik-mui';
import React from 'react';

const CustomTextField = withHelperTextTranslation(TextField, fieldToTextField);

const SimpleField = ({
  name,
  label,
  required = true,
  ...other
}: FieldAttributes<any>) => {
  return (
    <Field
      fullWidth
      margin="normal"
      variant="outlined"
      name={name}
      label={label}
      required={required}
      component={CustomTextField}
      {...other}
    />
  );
};

export default SimpleField;
