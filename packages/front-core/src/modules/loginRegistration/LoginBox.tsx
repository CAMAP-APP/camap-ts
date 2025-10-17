import SimpleField from '@components/utils/SimpleField';
import { Person } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Box, Container } from '@mui/material';
import { loginSchema } from 'camap-common';
import { Form, Formik, FormikHelpers } from 'formik';
import React from 'react';
import AlertError from '../../components/utils/AlertError';
import CamapLink from '../../components/utils/CamapLink';
import ApolloErrorAlert from '../../components/utils/errors/ApolloErrorAlert';
import { useLoginMutation, useRecordBadLoginMutation } from '../../gql';
import i18n from '../../lib/i18n';
import { useCamapTranslation } from '../../utils/hooks/use-camap-translation';
import { LoginRegistrationProps } from './LoginRegistration.module';

export interface LoginBoxFormValues {
  password: string;
  email: string;
}

const LoginBox = ({
  redirect,
  sid,
  preFilledEmail,
}: Pick<LoginRegistrationProps, 'sid' | 'preFilledEmail'> & {
  redirect: () => void;
}) => {
  const { t, tBasics } = useCamapTranslation({
    tLogin: 'login-registration',
    tBasics: 'translation',
    tErrors: 'errors',
  });

  const [login, { error: unexpectedError }] = useLoginMutation();
  const [recordBadLoginMutation] = useRecordBadLoginMutation();

  const [error, setError] = React.useState<string>();

  async function submit(
    values: LoginBoxFormValues,
    { setSubmitting, resetForm }: FormikHelpers<LoginBoxFormValues>,
  ) {
    setSubmitting(true);
    setError(undefined);
    try {
      const { data } = await login({
        variables: {
          input: { ...values, sid },
        },
      });
      if (data && data.login) {
        redirect();
        return;
      }
    } catch (e) {
      resetForm({
        values: {
          email: values.email,
          password: '',
        },
      });
      let errorMessage = (e  instanceof Error) ? e.message : ''+e;
      if (errorMessage === 'wrongPassword') {
        await recordBadLoginMutation();
        errorMessage = 'wrongCredentials';
      }
      if (!errorMessage || !i18n.exists(`errors:${errorMessage}`)) return;
      setError(errorMessage);
    }
    setSubmitting(false);
  }

  return (
    <Container maxWidth="xs">
      {error && <AlertError message={t(error)} />}
      {unexpectedError && !error && (
        <ApolloErrorAlert error={unexpectedError} />
      )}
      <Formik
        initialValues={{ email: preFilledEmail || '', password: '' }}
        onSubmit={submit}
        validationSchema={loginSchema}
      >
        {({ isSubmitting, handleSubmit }) => (
          <Form>
            <SimpleField
              name="email"
              label={tBasics('email')}
              disabled={isSubmitting}
              type="email"
            />
            <SimpleField
              name="password"
              label={t('password')}
              disabled={isSubmitting}
              type="password"
            />
            <Box pt={2} pb={2}>
              <LoadingButton
                fullWidth
                onClick={() => handleSubmit()}
                variant="contained"
                startIcon={<Person />}
                disabled={isSubmitting}
              >
                {t('login')}
              </LoadingButton>
            </Box>
            <Box textAlign="center">
              <CamapLink href="/user/forgottenPassword">
                {t('forgottenPassword')}
              </CamapLink>
            </Box>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

export default LoginBox;
