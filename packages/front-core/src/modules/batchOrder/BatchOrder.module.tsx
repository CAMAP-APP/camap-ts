import { useGetCatalogSubscriptionsLazyQuery } from '@gql';
import { MenuItem, Select } from '@mui/material';
import { useCamapTranslation } from '@utils/hooks/use-camap-translation';
import CsaCatalogContextProvider from 'modules/csaCatalog/CsaCatalog.context';
import CsaCatalogRouter from 'modules/csaCatalog/CsaCatalogRouter';
import React, { useEffect } from 'react';
import CircularProgressBox from '../../components/utils/CircularProgressBox';


interface BatchOrderProps {
  catalogId: number;
  subscriptionId?: number;
}

const BatchOrder = ({ catalogId,  subscriptionId }: BatchOrderProps) => {
  const [selectedSubscription, setSelectedSubcription] = React.useState<
    number | undefined
  >(subscriptionId);

	const { t } = useCamapTranslation({
    t: 'batch-order',
  });

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

	if (!subscriptions) return ``	;

  return (
    <>
      {/* User selection */}
			<p>{t('selectMember')}</p>
			{subscriptionsError}
      <Select
				labelId="user-select-label"
				value={selectedSubscription || subscriptions.catalog.subscriptions[0].id}
				style={{width: '250px', marginBottom: '1em'}}

        onChange={(e) => setSelectedSubcription(e.target.value as number)}
      >
        {subscriptions &&
          subscriptions.catalog.subscriptions.map((s) => (
            <MenuItem key={s.id} value={s.id}>
              {s.user.firstName} {s.user.lastName}
            </MenuItem>
          ))}
      </Select>

      {/* Orders */}
      {selectedSubscription && (
        <CsaCatalogContextProvider
          catalogId={catalogId}
          initialSubscriptionId={selectedSubscription}
          adminMode={true}
        >
          <>
            {selectedSubscription ? (
              <CsaCatalogRouter userId={selectedSubscription} />
            ): <CircularProgressBox/>}
          </>

        </CsaCatalogContextProvider>
      )}
    </>
  );
};

export default BatchOrder;
