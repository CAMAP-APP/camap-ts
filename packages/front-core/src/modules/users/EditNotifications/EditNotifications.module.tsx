import CircularProgressBox from '@components/utils/CircularProgressBox';
import ApolloErrorAlert from '@components/utils/errors/ApolloErrorAlert';
import {
  useGetUserFromControlKeyQuery,
  useUpdateUserNotificationsMutation,
} from '@gql';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { useCamapTranslation } from '../../../utils/hooks/use-camap-translation';
import UserNotificationsForm, {
  UserNotificationsFormBag,
  UserNotificationsFormValues,
} from '../UserAccountModule/components/UserNotificationsForm';
import { formatCoupleName } from 'camap-common';

export interface EditNotificationsProps {
  userId: number;
  controlKey: string;
}

const EditNotificationsModule = ({
  userId,
  controlKey,
}: EditNotificationsProps) => {
  const { t, tBasics } = useCamapTranslation({
    t: 'users/account',
    tBasics: 'translation',
  });
  const { data, loading, error } = useGetUserFromControlKeyQuery({
    variables: {
      id: userId,
      controlKey,
    },
  });

  const [updateUserNotifications] = useUpdateUserNotificationsMutation();

  const user = data?.getUserFromControlKey;

  /** */

  const onUserNotificationsFormSubmit = async (
    values: UserNotificationsFormValues,
    bag: UserNotificationsFormBag,
  ) => {
    if (!user) return;

    bag.setStatus({ success: false, apolloError: null });

    try {
      await updateUserNotifications({
        variables: { input: { ...values, userId: user.id, controlKey } },
      });
      bag.setStatus({ success: true });
    } catch (error) {
      bag.resetForm({
        status: { apolloError: error },
      });
    } finally {
      bag.setSubmitting(false);
    }
  };

  /** */
  if (error) {
    return (
      <Card>
        <CardContent>
          <ApolloErrorAlert error={error} />
        </CardContent>
      </Card>
    );
  }
  if (loading || !user) {
    return (
      <Card>
        <CardContent>
          <CircularProgressBox />
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <Box p={2}>
        <Typography variant="h2" gutterBottom>
          {t('editYourNotifications')}
        </Typography>
        <Typography>
          {t('yourAccount')} : <b>{formatCoupleName(user)}</b> (
          {user.email}
          {user.email2 && ` ${tBasics('and')} ${user.email2}`})
        </Typography>
        <UserNotificationsForm
          notifications={user.notifications}
          onSubmit={onUserNotificationsFormSubmit}
        />
      </Box>
    </Card>
  );
};

export default EditNotificationsModule;
