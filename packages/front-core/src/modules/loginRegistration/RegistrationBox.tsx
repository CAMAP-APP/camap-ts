import SimpleField from '@components/utils/SimpleField';
import { ChevronRight } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Box, Container } from '@mui/material';
import {
  addressSchema,
  addressSchemaNotRequired,
  phoneSchema,
  userRegistrationSchema,
} from 'camap-common';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { CheckboxWithLabel } from 'formik-mui';
import React from 'react';
import AlertError from '../../components/utils/AlertError';
import CamapLink from '../../components/utils/CamapLink';
import CircularProgressBox from '../../components/utils/CircularProgressBox';
import ApolloErrorAlert from '../../components/utils/errors/ApolloErrorAlert';
import TwoColumnsGrid from '../../components/utils/TwoColumnsGrid';
import {
  useGetInvitedUserToRegisterLazyQuery,
  useRegisterMutation,
} from '../../gql';
import i18n from '../../lib/i18n';
import { useCamapTranslation } from '../../utils/hooks/use-camap-translation';
import EmailField from './EmailField';
import { LoginRegistrationProps } from './LoginRegistration.module';

export interface RegistrationBoxFormValues {
  password: string;
  confirmPassword: string;
  email: string;
  firstName: string;
  lastName: string;
  zipCode: string;
  address1: string;
  city: string;
  phone: string;
  tos: boolean;
}

const RegistrationBox = ({
  redirect,
  redirectUrl,
  sid,
  addressRequired,
  phoneRequired,
  invitedUserEmail,
  invitedGroupId,
  dialogContentRef,
  preFilledEmail,
  toggleLoginWithPrefilledEmail,
}: Pick<
  LoginRegistrationProps,
  | 'addressRequired'
  | 'phoneRequired'
  | 'sid'
  | 'invitedUserEmail'
  | 'invitedGroupId'
  | 'preFilledEmail'
  | 'redirectUrl'
> & {
  redirect: () => void;
  dialogContentRef?: HTMLDivElement;
  toggleLoginWithPrefilledEmail: (email: string) => void;
}) => {
  const { t, tCommon } = useCamapTranslation({
    tRegistration: 'login-registration',
    tCommon: 'translation',
    tErrors: 'errors',
  });

  const [emailAlreadyRegistered, setEmailAlreadyRegistered] =
    React.useState(false);

  const [register, { error: unexpectedError }] = useRegisterMutation();

  const [getInvitedUser, { data, loading }] =
    useGetInvitedUserToRegisterLazyQuery();
  const invitedUser = data?.getInvitedUserToRegister;

  const [error, setError] = React.useState<string>();

  React.useEffect(() => {
    if (!unexpectedError) return;

    dialogContentRef?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [dialogContentRef, unexpectedError]);

  React.useEffect(() => {
    if (!invitedUserEmail) return;

    getInvitedUser({ variables: { email: invitedUserEmail } });
  }, [getInvitedUser, invitedUserEmail]);

  async function submit(
    values: RegistrationBoxFormValues,
    { setSubmitting, resetForm }: FormikHelpers<RegistrationBoxFormValues>,
  ) {
    setSubmitting(true);
    setError(undefined);
    try {
      const { data } = await register({
        variables: {
          input: { ...values, sid, invitedGroupId },
        },
      });
      if (data && data.register) {
        setSubmitting(false);
        window.dataLayer && window.dataLayer.push({
          event: 'sign_up',
          redirectUrl,
          invitedGroupId,
        });
        redirect();
        return;
      }
    } catch (e:unknown) {
      if (e instanceof Error && e.message === 'emailAlreadyRegistered') {
        toggleLoginWithPrefilledEmail(values.email);
        return;
      }
      resetForm({
        values: {
          ...values,
          password: '',
        },
      });
      if (!(e instanceof Error) || !i18n.exists(`errors:${e.message}`)) {
        console.error(e);
        return;
      }
      dialogContentRef?.scrollTo({ top: 0, behavior: 'smooth' });
      setError(e.message);
    }
  }

  if (loading) {
    return <CircularProgressBox />;
  }

  return (
    <Container maxWidth="xs">
      {error && <AlertError message={t(error)} />}
      {unexpectedError && !error && (
        <ApolloErrorAlert error={unexpectedError} />
      )}
      <Formik
        initialValues={
          invitedUser
            ? {
                email: invitedUser.email,
                password: '',
                confirmPassword: '',
                firstName: invitedUser.firstName,
                lastName: invitedUser.lastName,
                phone: invitedUser.phone ?? '',
                zipCode: invitedUser.zipCode ?? '',
                address1:
                  invitedUser.address1 && invitedUser.address2
                    ? `${invitedUser.address1} ${invitedUser.address2}`
                    : invitedUser.address1
                    ? invitedUser.address1
                    : invitedUser.address2 ?? '',
                city: invitedUser.city ?? '',
                tos: false,
                email2: invitedUser.email2,
                firstName2: invitedUser.firstName2,
                lastName2: invitedUser.lastName2,
                phone2: invitedUser.phone2,
              }
            : {
                email: preFilledEmail || '',
                password: '',
                confirmPassword: '',
                firstName: '',
                lastName: '',
                phone: '',
                zipCode: '',
                address1: '',
                city: '',
                tos: false,
              }
        }
        onSubmit={submit}
        validationSchema={() => {
          let validationSchema = userRegistrationSchema;
          if (phoneRequired || (invitedUser && invitedUser.phone))
            validationSchema = validationSchema.concat(phoneSchema);
          if (addressRequired)
            validationSchema = validationSchema.concat(addressSchema);
          if (
            invitedUser &&
            (invitedUser.address1 ||
              invitedUser.city ||
              invitedUser.zipCode ||
              invitedUser.address2)
          )
            validationSchema = validationSchema.concat(
              addressSchemaNotRequired,
            );
          return validationSchema;
        }}
      >
        {({ isSubmitting, handleSubmit }) => {
          return (
            <Form>
              <SimpleField
                name="firstName"
                label={tCommon('firstName')}
                disabled={isSubmitting}
                type="text"
              />
              <SimpleField
                name="lastName"
                label={tCommon('lastName')}
                disabled={isSubmitting}
                type="text"
              />
              <Field
                name="email"
                label={tCommon('email')}
                disabled={isSubmitting}
                type="email"
                required
                component={EmailField}
                setEmailAlreadyRegistered={setEmailAlreadyRegistered}
                emailAlreadyRegistered={emailAlreadyRegistered}
              />
              {(phoneRequired || (invitedUser && invitedUser.phone)) && (
                <SimpleField
                  name="phone"
                  label={tCommon('phone')}
                  disabled={isSubmitting}
                  type="tel"
                  required={phoneRequired}
                />
              )}
              {(addressRequired ||
                (invitedUser &&
                  (invitedUser.address1 ||
                    invitedUser.city ||
                    invitedUser.zipCode ||
                    invitedUser.address2))) && (
                <>
                  <SimpleField
                    name="address1"
                    label={tCommon('address')}
                    disabled={isSubmitting}
                    type="text"
                    required={addressRequired}
                  />
                  <TwoColumnsGrid
                    left={
                      <SimpleField
                        name="city"
                        label={tCommon('city/town')}
                        disabled={isSubmitting}
                        type="text"
                        required={addressRequired}
                      />
                    }
                    right={
                      <SimpleField
                        name="zipCode"
                        label={tCommon('zipCode')}
                        disabled={isSubmitting}
                        type="text"
                        required={addressRequired}
                      />
                    }
                  />
                </>
              )}
              {invitedUser &&
                (invitedUser.firstName2 ||
                  invitedUser.lastName2 ||
                  invitedUser.phone2 ||
                  invitedUser.email2) && (
                  <>
                    <SimpleField
                      name="firstName2"
                      label={tCommon('firstName2')}
                      disabled={isSubmitting}
                      type="text"
                      required={false}
                    />
                    <SimpleField
                      name="lastName2"
                      label={tCommon('lastName2')}
                      disabled={isSubmitting}
                      type="text"
                      required={false}
                    />
                    <SimpleField
                      name="email2"
                      label={tCommon('email2')}
                      disabled={isSubmitting}
                      type="email"
                      required={false}
                    />
                    {(phoneRequired || invitedUser.phone2) && (
                      <SimpleField
                        name="phone2"
                        label={tCommon('phone2')}
                        disabled={isSubmitting}
                        type="tel"
                        required={false}
                      />
                    )}
                  </>
                )}
              <SimpleField
                name="password"
                label={t('password')}
                disabled={isSubmitting}
                type="password"
                helperText={t('min8Char')}
              />
              <SimpleField
                name="confirmPassword"
                label={t('confirmPassword')}
                disabled={isSubmitting}
                type="password"
              />
              <Box pt={1} textAlign="center">
                <Field
                  component={CheckboxWithLabel}
                  type="checkbox"
                  name="tos"
                  disabled={isSubmitting}
                  required
                  Label={{
                    label: (
                      <>
                        {t('iAcceptThe')}
                        <CamapLink href="/cgu" target="_blank">
                          {t('tos')}
                        </CamapLink>
                        {` ${tCommon('and')} ${tCommon('the')} `}
                        <CamapLink href="/privacypolicy" target="_blank">
                          {t('privacyPolicy')}
                        </CamapLink>
                      </>
                    ),
                  }}
                />
              </Box>
              <Box pt={2} pb={2}>
                <LoadingButton
                  fullWidth
                  onClick={() => handleSubmit()}
                  variant="contained"
                  startIcon={<ChevronRight />}
                  disabled={isSubmitting || emailAlreadyRegistered}
                >
                  {t('registration')}
                </LoadingButton>
              </Box>
            </Form>
          );
        }}
      </Formik>
    </Container>
  );
};

export default RegistrationBox;
