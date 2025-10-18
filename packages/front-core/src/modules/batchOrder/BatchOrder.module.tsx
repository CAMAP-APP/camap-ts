import {
  useGetCatalogSubscriptionsLazyQuery,
  useGetMembersOfGroupByListTypeLazyQuery,
} from '@gql';
import { Alert, Box, Button, MenuItem, Select } from '@mui/material';
import { useCamapTranslation } from '@utils/hooks/use-camap-translation';
import CsaCatalogContextProvider from 'modules/csaCatalog/CsaCatalog.context';
import React, { useEffect } from 'react';
import BatchOrderCreateSub from './BatchOrderCreateSub';
import BatchOrderPage from './BatchOrderPage';
import { formatUserName } from 'camap-common';

interface BatchOrderProps {
  catalogId: number;
  catalogName: string;
  groupId: number;
  subscriptionId?: number;
}

const BatchOrder = ({
  catalogId,
  catalogName,
  groupId,
  subscriptionId,
}: BatchOrderProps) => {
  const [selectedSubscription, setSelectedSubcription] = React.useState<
    number | undefined
  >(subscriptionId);

  const [selectedMember, setSelectedMember] = React.useState<
    number | undefined
  >(undefined);

  const { t } = useCamapTranslation({
    t: 'batch-order',
  });

  const [showAbsencesModal, setShowAbsencesModal] = React.useState(false);
  const [absencesAutorized, setAbsencesAutorized] = React.useState(false);

  /**
   * Requests
   */
  const [getGroupMembers, { data: groupMembers, error: memberError }] =
    useGetMembersOfGroupByListTypeLazyQuery({
      variables: { listType: 'all', groupId },
    });

  const [
    getCatalogSubscriptions,
    {
      data: subscriptions,
      error: subscriptionsError,
      refetch: refetchSubscriptions,
    },
  ] = useGetCatalogSubscriptionsLazyQuery({ variables: { id: catalogId } });

  /**
   * Side effects
   */
  useEffect(() => {
    getGroupMembers();
  }, [getGroupMembers]);

  useEffect(() => {
    refetchSubscriptions();
  }, [catalogId, getCatalogSubscriptions, refetchSubscriptions]);

  // select subscription of selected member
  useEffect(() => {
    const selectedSubscription = subscriptions?.catalog.subscriptions.filter(
      (s) => s.user.id === selectedMember,
    )[0];
    setSelectedSubcription(selectedSubscription?.id);
  }, [selectedMember, subscriptions?.catalog.subscriptions]);

  // set first member at start
  useEffect(() => {
    if (!groupMembers) return;
    setSelectedMember(groupMembers.getUserListInGroupByListType[0].id);
  }, [groupMembers]);

  if (!groupMembers) return null;

  if (groupMembers && groupMembers?.getUserListInGroupByListType.length === 0)
    return (
      <Alert severity="warning" sx={{ margin: '16px 0px' }}>
        {t('noUsers')}
      </Alert>
    );

  return (
    <>
      {/*Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
        }}
      >
        <div>
          <h2>{t('batchOrder')}</h2>
          <h3>{catalogName}</h3>
        </div>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'baseline',
          }}
        >
          <Select
            labelId="user-select-label"
            value={
              selectedMember ||
              groupMembers.getUserListInGroupByListType[0]?.id ||
              undefined
            }
            style={{
              width: '250px',
              height: '42px',
              margin: '0px 16px 16px 0px',
            }}
            onChange={(e) => setSelectedMember(e.target.value as number)}
          >
            {groupMembers &&
              groupMembers.getUserListInGroupByListType.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {formatUserName(s)}
                </MenuItem>
              ))}
          </Select>

          <Button
            variant="contained"
            onClick={() => setShowAbsencesModal(true)}
            disabled={!absencesAutorized || !selectedSubscription}
          >
            {t('allowedAbsences')}
          </Button>
        </Box>
      </Box>

      {(memberError || subscriptionsError) && (
        <Alert severity="error">
          {memberError?.message} {subscriptionsError?.message}
        </Alert>
      )}

      {!selectedSubscription && selectedMember && (
        <CsaCatalogContextProvider
          catalogId={catalogId}
          initialSubscriptionId={selectedSubscription}
          adminMode={true}
        >
          <BatchOrderCreateSub
            selectedMember={selectedMember}
            refetchSubscriptions={refetchSubscriptions}
          />
        </CsaCatalogContextProvider>
      )}

      {/* Orders */}
      {selectedMember && selectedSubscription && (
        <CsaCatalogContextProvider
          catalogId={catalogId}
          initialSubscriptionId={selectedSubscription}
          adminMode={true}
        >
          <BatchOrderPage
            selectedSubscription={selectedSubscription}
            showAbsencesModal={showAbsencesModal}
            setShowAbsencesModal={setShowAbsencesModal}
            setAbsencesAutorized={setAbsencesAutorized}
          />
        </CsaCatalogContextProvider>
      )}
    </>
  );
};
export default BatchOrder;
