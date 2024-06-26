import CsaCatalogContextProvider from './CsaCatalog.context';
import CsaCatalogRouter from './CsaCatalogRouter';

interface CsaCatalogProps {
  catalogId: number;
  userId: number;
  subscriptionId?: number;
}

/**
 * Display table view on futures orders
 * Can be used by users, and admins to add orders to users
 */
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
