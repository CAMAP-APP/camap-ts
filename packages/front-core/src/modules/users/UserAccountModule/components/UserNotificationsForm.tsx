import { UserNotifications } from '@gql';
import { Alert, Box, Button, FormControlLabel } from '@mui/material';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { Switch } from 'formik-mui';
import ApolloErrorAlert from '../../../../components/utils/errors/ApolloErrorAlert';
import { useCamapTranslation } from '../../../../utils/hooks/use-camap-translation';

export interface UserNotificationsFormProps {
  notifications?: UserNotificationsFormValues;
  onSubmit: (
    values: UserNotificationsFormValues,
    bag: UserNotificationsFormBag,
  ) => void;
}

export type UserNotificationsFormValues = Pick<
  UserNotifications,
  'hasEmailNotif4h' | 'hasEmailNotif24h' | 'hasEmailNotifOuverture'
>;

export type UserNotificationsFormBag =
  FormikHelpers<UserNotificationsFormValues>;

const UserNotificationsForm = ({
  notifications,
  onSubmit,
}: UserNotificationsFormProps) => {
  const { t, tBasics } = useCamapTranslation({
    tLogin: 'users/account',
    tBasics: 'translation',
  });
  const initialValues: UserNotificationsFormValues = {
    hasEmailNotif4h: notifications?.hasEmailNotif4h || false,
    hasEmailNotif24h: notifications?.hasEmailNotif24h || false,
    hasEmailNotifOuverture: notifications?.hasEmailNotifOuverture || false,
  };

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit}>
      {({ status, isSubmitting }) => (
        <Form>
          {status && status.apolloError && (
            <Box p={2} pb={0}>
              <ApolloErrorAlert error={status.apolloError} />
            </Box>
          )}

          {status && status.success && (
            <Box p={2} pb={0}>
              <Alert severity="success">
                {t('updateNotificationsSuccess')}
              </Alert>
            </Box>
          )}

          <Box p={2} display="flex" flexDirection="column">
            <FormControlLabel
              control={
                <Field
                  component={Switch}
                  type="checkbox"
                  name="hasEmailNotif4h"
                />
              }
              label={`${t('hasEmailNotif4h')}`}
            />
            <FormControlLabel
              control={
                <Field
                  component={Switch}
                  type="checkbox"
                  name="hasEmailNotif24h"
                />
              }
              label={`${t('hasEmailNotif24h')}`}
            />
            <FormControlLabel
              control={
                <Field
                  component={Switch}
                  type="checkbox"
                  name="hasEmailNotifOuverture"
                />
              }
              label={`${t('hasEmailNotifOuverture')}`}
            />
          </Box>

          <Box p={2} pt={0} display="flex" justifyContent="center">
            <Button variant="contained" disabled={isSubmitting} type="submit">
              {tBasics('save')}
            </Button>
          </Box>
        </Form>
      )}
    </Formik>
  );
};

export default UserNotificationsForm;
