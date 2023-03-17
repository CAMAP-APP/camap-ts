import ApolloErrorAlert from '@components/utils/errors/ApolloErrorAlert';
import TwoColumnsGrid from '@components/utils/TwoColumnsGrid';
import { User } from '@gql';
import { Alert, Box, Button } from '@mui/material';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { TextField } from 'formik-mui';
import { useCamapTranslation } from '../../../../utils/hooks/use-camap-translation';

export interface UserPartnerFormProps {
  partner?: UserPartnerFormValues;
  onSubmit: (values: UserPartnerFormValues, bag: UserPartnerFormBag) => void;
}

export type UserPartnerFormValues = Pick<
  User,
  'firstName2' | 'lastName2' | 'email2' | 'phone2'
>;

export type UserPartnerFormBag = FormikHelpers<UserPartnerFormValues>;

const UserPartnerForm = ({ partner, onSubmit }: UserPartnerFormProps) => {
  const { t, tBasics } = useCamapTranslation({
    tLogin: 'users/account',
    tBasics: 'translation',
  });
  const initialValues: UserPartnerFormValues = {
    firstName2: partner?.firstName2 || '',
    lastName2: partner?.lastName2 || '',
    email2: partner?.email2 || '',
    phone2: partner?.phone2 || '',
  };

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit}>
      {({ status, isSubmitting }) => {
        return (
          <Form>
            {status && status.apolloError && (
              <Box p={2} pb={0}>
                <ApolloErrorAlert error={status.apolloError} />
              </Box>
            )}

            {status && status.mailAlreadyInUseError && (
              <Box p={2} pb={0}>
                <Alert severity="error">{t('mailAlreadyInUseError')}</Alert>
              </Box>
            )}

            {status && status.success && (
              <Box p={2} pb={0}>
                <Alert severity="success">{t('updatePartnerSuccess')}</Alert>
              </Box>
            )}

            <Box p={2} pb={0}>
              <Alert severity="info">{t('partnerInfo')}</Alert>
            </Box>

            <Box p={2}>
              <TwoColumnsGrid
                left={
                  <Field
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    name="firstName2"
                    label={tBasics('firstName2')}
                    component={TextField}
                  />
                }
                right={
                  <Field
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    name="lastName2"
                    label={tBasics('lastName2')}
                    component={TextField}
                  />
                }
              />

              <TwoColumnsGrid
                left={
                  <Field
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    name="email2"
                    label={tBasics('email2')}
                    type="email"
                    component={TextField}
                  />
                }
                right={
                  <Field
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    name="phone2"
                    label={tBasics('phone2')}
                    component={TextField}
                  />
                }
              />
            </Box>

            <Box p={2} pt={0} display="flex" justifyContent="center">
              <Button variant="contained" disabled={isSubmitting} type="submit">
                {tBasics('save')}
              </Button>
            </Box>
          </Form>
        );
      }}
    </Formik>
  );
};

export default UserPartnerForm;
