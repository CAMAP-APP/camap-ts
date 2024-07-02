import { useGetCatalogSubscriptionsLazyQuery } from '@gql';
import { Box, Button, MenuItem, Select } from '@mui/material';
import { useCamapTranslation } from '@utils/hooks/use-camap-translation';
import CsaCatalogContextProvider from 'modules/csaCatalog/CsaCatalog.context';
import React, { useEffect } from 'react';
import BatchOrderPage from './BatchOrderPage';

interface BatchOrderProps {
  catalogId: number;
  subscriptionId?: number;
}

const BatchOrder = ({ catalogId, subscriptionId }: BatchOrderProps) => {
  const [selectedSubscription, setSelectedSubcription] = React.useState<
    number | undefined
  >(subscriptionId);

  const { t } = useCamapTranslation({
    t: 'batch-order',
  });

  const [showAbsencesModal, setShowAbsencesModal] = React.useState(false);

  const [
    getCatalogSubscriptions,
    { data: subscriptions, error: subscriptionsError },
  ] = useGetCatalogSubscriptionsLazyQuery({ variables: { id: catalogId } });

  useEffect(() => {
    getCatalogSubscriptions();
  }, [catalogId, getCatalogSubscriptions]);

  // if no subscriptions, set first subscription
  useEffect(() => {
    if (!subscriptions) return;
    setSelectedSubcription(subscriptions.catalog.subscriptions[0].id);
  }, [subscriptions]);

  if (!subscriptions) return ``;

  return (
    <>
      {/* User selection */}
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
          <h3>{subscriptions.catalog.name}</h3>
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
              selectedSubscription || subscriptions.catalog.subscriptions[0].id
            }
            style={{
              width: '250px',
              height: '42px',
              margin: '0px 16px 16px 0px',
            }}
            onChange={(e) => setSelectedSubcription(e.target.value as number)}
          >
            {subscriptions &&
              subscriptions.catalog &&
              subscriptions.catalog.subscriptions.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.user.firstName} {s.user.lastName}
                </MenuItem>
              ))}
          </Select>

          <Button
            variant="contained"
            onClick={() => setShowAbsencesModal(true)}
          >
            {t('allowedAbsences')}
          </Button>
        </Box>
      </Box>

      {subscriptionsError}

      {/* Orders */}
      {selectedSubscription && (
        <CsaCatalogContextProvider
          catalogId={catalogId}
          initialSubscriptionId={selectedSubscription}
          adminMode={true}
        >
          <BatchOrderPage
            selectedSubscription={selectedSubscription}
            showAbsencesModal={showAbsencesModal}
            setShowAbsencesModal={setShowAbsencesModal}
          />
        </CsaCatalogContextProvider>
      )}
    </>
  );
};

export default BatchOrder;
