import React, { useContext } from 'react';
import CsaCatalogSubscription from './containers/CsaCatalogSubscription';
import CsaCatalogContextProvider, { CsaCatalogContext } from './CsaCatalog.context';

interface CsaCatalogProps {
  catalogId: number;
  userId: number;
  subscriptionId?: number;
}


const CsaCatalogSubscriptionRouter = () => {
  const {
    subscription
  } = useContext(CsaCatalogContext)

  return subscription 
  ? <CsaCatalogSubscription />
  : <></>
}

const CsaCatalogSubscriptionModule = ({ catalogId, subscriptionId }: CsaCatalogProps) => {
  return (
    <CsaCatalogContextProvider
      catalogId={catalogId}
      initialSubscriptionId={subscriptionId}
    >
      <CsaCatalogSubscriptionRouter />
    </CsaCatalogContextProvider>
  );
};

export default CsaCatalogSubscriptionModule;
