import CircularProgressBox from '@components/utils/CircularProgressBox';
import ApolloErrorAlert from '@components/utils/errors/ApolloErrorAlert';
import {
  UpdateUserInput,
  useUpdateUserMutation,
  useUpdateUserNotificationsMutation,
  useUserAccountQuery,
} from '@gql';
import {
  AppBar,
  Card,
  CardContent,
  Tab,
  Tabs,
  useMediaQuery,
} from '@mui/material';
import React from 'react';
import { TabPanel } from '../../../components/TabPanel';
import theme from '../../../theme';
import { useCamapTranslation } from '../../../utils/hooks/use-camap-translation';
import UserGroups from './components/UserGroups';
import UserInfosForm, {
  UserInfosFormBag,
  UserInfosFormValues,
} from './components/UserInfosForm';
import UserNotificationsForm, {
  UserNotificationsFormBag,
  UserNotificationsFormValues,
} from './components/UserNotificationsForm';
import UserPartnerForm, {
  UserPartnerFormBag,
  UserPartnerFormValues,
} from './components/UserPartnerForm';

export const TAB_ID = 'user-account-tab';
export const TAB_PANEL_ID = 'user-account-tabpanel';

interface UserAccountProps {
  currentGroupId?: number;
}

const UserAccount = ({ currentGroupId }: UserAccountProps) => {
  const { t } = useCamapTranslation({
    tLogin: 'users/account',
  });
  const {
    data: userData,
    loading: userLoading,
    error: userError,
  } = useUserAccountQuery();
  const [updateUser] = useUpdateUserMutation();
  const [updateUserNotifications] = useUpdateUserNotificationsMutation();

  const [tabValue, setTabValue] = React.useState(0);
  const user = userData?.me;
  const groups = userData?.myGroups;

  const isDownSm = useMediaQuery(theme.breakpoints.down('md'));

  /** */
  const onTabChange = (_: any, newValue: number) => {
    setTabValue(newValue);
  };

  const onUserFormSubmit = async (
    values: UserInfosFormValues | UserPartnerFormValues,
    bag: UserInfosFormBag | UserPartnerFormBag,
  ) => {
    if (!user) return;

    bag.setStatus({ success: false, apolloError: null });

    try {
      const input: UpdateUserInput = { ...values, id: user.id };
      if ('firstName2' in values) {
        input.firstName = user.firstName;
        input.lastName = user.lastName;
        input.email = user.email;
      }
      const { data: updateUserData } = await updateUser({
        variables: { input },
      });

      if (!updateUserData?.updateUser) return;

      // eslint-disable-next-line no-underscore-dangle
      if (updateUserData.updateUser.__typename === 'User') {
        bag.setStatus({ success: true });
        return;
      }
      // eslint-disable-next-line no-underscore-dangle
      if (updateUserData.updateUser.__typename === 'MailAlreadyInUseError') {
        bag.resetForm({
          status: { mailAlreadyInUseError: updateUserData.updateUser },
        });
        return;
      }
    } catch (error) {
      bag.resetForm({
        status: { apolloError: error },
      });
    } finally {
      bag.setSubmitting(false);
    }
  };

  const onUserNotificationsFormSubmit = async (
    values: UserNotificationsFormValues,
    bag: UserNotificationsFormBag,
  ) => {
    if (!user) return;

    bag.setStatus({ success: false, apolloError: null });

    try {
      await updateUserNotifications({
        variables: { input: { ...values, userId: user.id } },
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

  let isAddressRequired = false;
  let isPhoneRequired = false;

  groups?.forEach((group) => {
    if (group.hasAddressRequired) isAddressRequired = true;
    if (group.hasPhoneRequired) isPhoneRequired = true;
  });

  /** */
  if (userError) {
    return (
      <Card>
        <CardContent>
          <ApolloErrorAlert error={userError} />
        </CardContent>
      </Card>
    );
  }
  if (userLoading || !user) {
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
      <AppBar position="relative" elevation={0} color="default">
        <Tabs
          centered={!isDownSm}
          value={tabValue}
          onChange={onTabChange}
          variant={isDownSm ? 'scrollable' : 'standard'}
          allowScrollButtonsMobile
        >
          <Tab
            label={t('infos')}
            id={`${TAB_ID}-0`}
            aria-controls={`${TAB_PANEL_ID}-0`}
          />
          <Tab
            label={t('partner')}
            id={`${TAB_ID}-1`}
            aria-controls={`${TAB_PANEL_ID}-1`}
          />
          <Tab
            label={t('notifications')}
            id={`${TAB_ID}-2`}
            aria-controls={`${TAB_PANEL_ID}-2`}
          />
          <Tab
            label={t('myGroups')}
            id={`${TAB_ID}-3`}
            aria-controls={`${TAB_PANEL_ID}-3`}
          />
        </Tabs>
      </AppBar>

      <TabPanel value={tabValue} index={0}>
        <UserInfosForm
          user={user}
          onSubmit={onUserFormSubmit}
          isAddressRequired={isAddressRequired}
          isPhoneRequired={isPhoneRequired}
        />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <UserPartnerForm partner={user} onSubmit={onUserFormSubmit} />
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        <UserNotificationsForm
          notifications={user.notifications}
          onSubmit={onUserNotificationsFormSubmit}
        />
      </TabPanel>
      <TabPanel value={tabValue} index={3}>
        <UserGroups
          groups={groups || []}
          user={user}
          currentGroupId={currentGroupId}
        />
      </TabPanel>
    </Card>
  );
};

export default UserAccount;
