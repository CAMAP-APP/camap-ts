import CircularProgressBox from '@components/utils/CircularProgressBox';
import ApolloErrorAlert from '@components/utils/errors/ApolloErrorAlert';
import {
  useGetUserFromControlKeyLazyQuery,
  useGroupPreviewQuery,
  useQuitGroupByControlKeyMutation,
} from '@gql';
import {
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

  const [quitGroupMutation, { error: quitGroupError }] = useQuitGroupByControlKeyMutation({
    variables: { groupId, userId: userId || -1, controlKey },
  });

  React.useEffect(() => {
    if (!userId) return;

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
    const { data: quitGroup } = await quitGroupMutation()
    const deletedGroupId = quitGroup?.quitGroupByControlKey.groupId;

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

  let error = userError || groupError || quitGroupError;

  let loading = userLoading || groupLoading;
  if (loading || !user || !group) {
    return (
      <Card>
        <CardContent>
          {error && <ApolloErrorAlert error={error} />}
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
        {error && <Box my={2}><ApolloErrorAlert error={error} /></Box>}
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