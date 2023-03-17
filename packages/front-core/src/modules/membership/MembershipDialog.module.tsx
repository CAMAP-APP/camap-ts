import { Close } from '@mui/icons-material';
import {
  AppBar,
  Box,
  Card,
  CardHeader,
  CircularProgress,
  IconButton,
  Modal,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ApolloErrorAlert from '../../components/utils/errors/ApolloErrorAlert';
import {
  useGetMembershipFormDataQuery,
  useGetUserMembershipsQuery,
} from '../../gql';
import MembershipForm from './MembershipForm';
import MembershipHistory from './MembershipHistory';

export interface MembershipDialogProps {
  userName: string;
  userId: number;
  groupId: number;
  distributionId?: number;
  callbackUrl?: string;
  onClose?: () => void;
}

const MembershipDialog = ({
  callbackUrl,
  userName,
  userId,
  groupId,
  distributionId,
  onClose,
}: MembershipDialogProps) => {
  if (typeof groupId !== 'number')
    throw new Error('MembershipDialogModule requires a groupId');
  if (typeof userId !== 'number')
    throw new Error('MembershipDialogModule requires a userId');
  if (typeof userName !== 'string')
    throw new Error('MembershipDialogModule requires a userName');
  if (callbackUrl && typeof callbackUrl !== 'string')
    throw new Error('MembershipDialogModule requires a callbackUrl');
  if (distributionId && typeof distributionId !== 'number')
    throw new Error(
      'MembershipDialogModule requires a distributionId of type number',
    );

  const { t } = useTranslation(['membership/default']);

  const [isOpened, setIsOpened] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  const {
    data: getUserMembershipsData,
    error: getUserMembershipsError,
    loading: getUserMembershipsLoading,
    refetch: getUserMembershipsRefetch,
  } = useGetUserMembershipsQuery({ variables: { userId, groupId } });
  const memberships = getUserMembershipsData?.getUserMemberships;

  const {
    data: getMembershipFormDataData,
    loading: getMembershipFormDataLoading,
    error: getMembershipFormDataError,
  } = useGetMembershipFormDataQuery({
    variables: {
      userId,
      groupId,
    },
  });

  const error = getUserMembershipsError || getMembershipFormDataError;
  const loading = getUserMembershipsLoading || getMembershipFormDataLoading;

  const availableYears = React.useMemo(
    () =>
      !loading && getMembershipFormDataData
        ? getMembershipFormDataData.getMembershipFormData.availableYears.filter(
            (y) => {
              return memberships && !memberships.find((m) => y.id === m.year);
            },
          )
        : [],
    [loading, getMembershipFormDataData, memberships],
  );

  const onCloseModal = () => {
    if (!isLocked) setIsOpened(false);

    // reload host page after closing window
    if (!!callbackUrl) {
      window.setTimeout(() => {
        document.location.href = callbackUrl;
      }, 250);
    }

    if (onClose) {
      onClose();
    }
  };

  const onCallComplete = (success: boolean) => {
    setIsLocked(false);
    if (!success) return;
    getUserMembershipsRefetch();
  };

  const onSubmitComplete = (success: boolean) => {
    onCallComplete(success);
    if (success) {
      setTabIndex(0);
    }
  };

  const onTabChange = (_event: any, newValue: number) => setTabIndex(newValue);

  const lock = () => setIsLocked(true);

  if (error) return <ApolloErrorAlert error={error} />;

  return (
    <Modal
      open={isOpened}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClose={onCloseModal}
    >
      {loading ? (
        <Box p={2} display="flex" justifyContent="center" width={610}>
          <CircularProgress />
        </Box>
      ) : (
        <Card
          sx={{
            width: 610,
            '&:focus': {
              outline: 'initial',
            },
          }}
        >
          <CardHeader
            title={
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box width={48} height={48} />
                <Typography>
                  {t('userNamesSubsciptions', { userName })}
                </Typography>
                <Box width={48} height={48}>
                  <IconButton
                    onClick={onCloseModal}
                    disabled={isLocked}
                    size="large"
                  >
                    <Close />
                  </IconButton>
                </Box>
              </Box>
            }
          />
          <AppBar position="static" color="default" elevation={0}>
            <Tabs centered value={tabIndex} onChange={onTabChange}>
              <Tab label={t('history')} disabled={isLocked} />
              <Tab
                label={t('add')}
                disabled={isLocked || !availableYears.length}
              />
            </Tabs>
          </AppBar>
          <>
            <Box display={tabIndex === 0 ? 'block' : 'none'}>
              <MembershipHistory
                isLocked={isLocked}
                userId={userId}
                groupId={groupId}
                memberships={memberships || []}
                onDelete={lock}
                onDeleteComplete={onCallComplete}
              />
            </Box>
            <Box display={tabIndex === 1 ? 'block' : 'none'}>
              <MembershipForm
                userId={userId}
                groupId={groupId}
                availableYears={availableYears}
                membershipFee={
                  getMembershipFormDataData!.getMembershipFormData.membershipFee
                }
                distributions={
                  getMembershipFormDataData!.getMembershipFormData.distributions
                }
                distributionId={distributionId}
                onSubmit={lock}
                onSubmitComplete={onSubmitComplete}
              />
            </Box>
          </>
        </Card>
      )}
    </Modal>
  );
};

export default MembershipDialog;
