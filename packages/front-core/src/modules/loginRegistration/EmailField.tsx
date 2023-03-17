import { TextField, TextFieldProps } from '@mui/material';
import { fieldToTextField } from 'formik-mui';
import React from 'react';
import withHelperTextTranslation from '../../components/forms/shared/withHelperTextTranslation';
import { useIsEmailRegisteredLazyQuery } from '../../gql';
import { useCamapTranslation } from '../../utils/hooks/use-camap-translation';

const EmailField = ({
  setEmailAlreadyRegistered,
  emailAlreadyRegistered,
  ...props
}: TextFieldProps & {
  emailAlreadyRegistered: boolean;
  setEmailAlreadyRegistered: (b: boolean) => void;
}) => {
  const { t } = useCamapTranslation({
    t: 'login-registration',
  });

  const [isEmailRegistered] = useIsEmailRegisteredLazyQuery();

  const checkEmailAlreadyRegistered = async (
    e: React.FocusEvent<HTMLInputElement>,
  ) => {
    const email = e.currentTarget.value;
    const { data } = await isEmailRegistered({ variables: { email } });

    if (data?.isEmailRegistered) {
      setEmailAlreadyRegistered(true);
    } else {
      setEmailAlreadyRegistered(false);
      if (props.onBlur) props.onBlur(e);
    }
  };

  let helperText = props.helperText;
  let error = props.error;
  if (emailAlreadyRegistered && !helperText) {
    helperText = t('emailAlreadyRegistered');
    error = true;
  }

  return (
    <TextField
      fullWidth
      margin="normal"
      variant="outlined"
      {...props}
      helperText={helperText}
      error={error}
      onBlur={checkEmailAlreadyRegistered}
    />
  );
};

export default withHelperTextTranslation(EmailField, fieldToTextField);
