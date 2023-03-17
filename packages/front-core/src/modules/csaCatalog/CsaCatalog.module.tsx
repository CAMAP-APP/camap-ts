import React from 'react';
import CsaCatalogContextProvider from './CsaCatalog.context';
import CsaCatalogRouter from './CsaCatalogRouter';

interface CsaCatalogProps {
  catalogId: number;
  userId: number;
  subscriptionId?: number;
}

const CsaCatalog = ({ catalogId, userId, subscriptionId }: CsaCatalogProps) => {
  return (
    <CsaCatalogContextProvider
      catalogId={catalogId}
      initialSubscriptionId={subscriptionId}
    >
      <CsaCatalogRouter userId={userId} />
    </CsaCatalogContextProvider>
  );
};

export default CsaCatalog;
