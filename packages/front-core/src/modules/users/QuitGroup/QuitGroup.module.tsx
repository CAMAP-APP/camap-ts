import CircularProgressBox from '@components/utils/CircularProgressBox';
import ApolloErrorAlert from '@components/utils/errors/ApolloErrorAlert';
import {
  useGetUserFromControlKeyLazyQuery,
  useGroupPreviewQuery,
  useQuitGroupMutation,
} from '@gql';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import React from 'react';
import { useCamapTranslation } from '../../../utils/hooks/use-camap-translation';
import { goTo } from '../../../utils/url';
import QuitGroupContent from './components/QuitGroupContent';
import {
  isAfter,
  parseISO,
  subMonths,
} from 'date-fns';

export interface QuitGroupProps {
  userId?: number;
  groupId: number;
  controlKey: string;
}

const QuitGroupModule = ({ userId, groupId, controlKey }: QuitGroupProps) => {
  const { t } = useCamapTranslation({
    t: 'users/account',
  });
  const [
    getUserFromControlKeyQuery,
    { data: userData, loading: userLoading, error: userError },
  ] = useGetUserFromControlKeyLazyQuery();

  const {
    data: groupData,
    loading: groupLoading,
    error: groupError,
  } = useGroupPreviewQuery({
    variables: {
      id: groupId,
    },
  });

  const [quitGroupMutation, { error: quitGroupError }] = useQuitGroupMutation({
    variables: { groupId },
  });

  React.useEffect(() => {
    if (!userId) return;// AJOUT AC => Si commande < 2 mois return
    let twoMonthsAgo = subMonths(new Date(), 2);
    (
      await this.usersRepo
        .createQueryBuilder('u')
        .select('u.id, u.firstName, u.lastName, u.email, u.ldate')
        .where(
          `u.id = userId)`,
        )
        .stream()
    ).on(
      'data',
      async (
        chunk: Pick<UserEntity, 'id' | 'firstName' | 'lastName' | 'email' | 'ldate'>,
      ) => {
        // Don't delete those who still have orders in less than 2 months
        let orders1 = await this.ordersService.findPartialUserOrdersByUserId(
          chunk.id,
        );
        orders1 = orders1.filter((o) => {
          if (!o) return false;
          let date = typeof o.date === 'string' ? parseISO(o.date) : o.date;
          return isAfter(date, twoMonthsAgo);
        });
        if (orders1.length > 0) return;

        let orders2 = await this.ordersService.findPartialUserOrdersByUserId2(
          chunk.id,
        );
        orders2 = orders2.filter((o) => {
          if (!o) return false;
          let date = typeof o.date === 'string' ? parseISO(o.date) : o.date;
          return isAfter(date, twoYearsAgo);
        });
        if (orders2.length > 0) return;
      },
    );
    // FIN AJOUT AC
    const { data: quitGroup } = await quitGroupMutation();
    const deletedGroupId = quitGroup?.quitGroup.groupId;

    if (groupId !== deletedGroupId) return;

    if (process.env.NODE_ENV === 'production') {
      // eslint-disable-next-line no-underscore-dangle
      window._Camap.resetGroupInSession(deletedGroupId);
    }
    goTo('/user/choose?show=1');
  };

  const Title = ({ groupName }: { groupName: string }) => (
    <Typography variant="h2" gutterBottom>
      {t('quitGroupDialogTitle', { groupName })}
    </Typography>
  );

  getUserFromControlKeyQuery({
    variables: {
      id: userId,
      groupId,
      controlKey,
    },
  });
}, [controlKey, groupId, getUserFromControlKeyQuery, userId]);

const user = userData?.getUserFromControlKey;
const group = groupData?.groupPreview;

const onQuitGroup = async () => {



  /** */
  if (!!group && !userId) {
    return (
      <Card>
        <Box p={2}>
          <Title groupName={group.name} />
          <Alert severity={'info'}>{t('youShouldBeLoggedToQuitGroup')}</Alert>
        </Box>
      </Card>
    );
  }

  let error = userError || groupError || quitGroupError;
  if (error) {
    return (
      <Card>
        <CardContent>
          <ApolloErrorAlert error={error} />
        </CardContent>
      </Card>
    );
  }
  let loading = userLoading || groupLoading;
  if (loading || !user || !group) {
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
        <Title groupName={group.name} />
        <QuitGroupContent user={user} />
        <Box textAlign="center">
          <Button variant="contained" onClick={onQuitGroup}>
            {t('quitGroup')}
          </Button>
        </Box>
      </Box>
    </Card>
  );
};

export default QuitGroupModule;
