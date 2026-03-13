import React from 'react';
import { CsaCatalogContext } from '../CsaCatalog.context';
import CsaCatalogOrdersMobile from './CsaCatalogOrdersMobile';

interface CsaCatalogDefaultOrderProps {
  onNext: (canceled?: boolean) => Promise<boolean>;
}

const CsaCatalogDefaultOrder = ({ onNext }: CsaCatalogDefaultOrderProps) => {
  const {
    catalog,
    subscription,
    setDefaultOrder,
  } = React.useContext(CsaCatalogContext);

  React.useEffect(() => {
    if (!catalog) return;
    if (!!subscription) return;
    setDefaultOrder(
      catalog.products.reduce((acc, p) => {
        acc[p.id] = 0;
        return acc;
      }, {} as Record<number, number>),
    );
  }, [catalog, setDefaultOrder, subscription]);


  return <CsaCatalogOrdersMobile mode={'defaultOrder'} onNext={onNext} />
};

export default CsaCatalogDefaultOrder;
