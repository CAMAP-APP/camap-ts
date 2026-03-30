import React, { useCallback } from 'react';
import {
  getEnrichedDistribution,
  RestCsaCatalog,
  restCsaCatalogTypeToType,
  RestCsaSubscription,
  RestCsaSubscriptionAbsences,
  RestDistributionEnriched,
  RestDistributionState,
  RestStocksPerProductDistribution,
} from './interfaces';
import {
  useRestCatalogGet,
  useRestStocksGet,
  useRestSubscriptionAbsencesLazyGet,
  useRestSubscriptionGet,
} from './requests';
import { CatalogType } from '@gql';
import { isAfter } from 'date-fns';

type Orders = Record<number, Record<number, number>>;

interface CsaCatalogContextProps {
  catalogId: number;
  initialSubscriptionId?: number;
  updatedOrders: Orders;
  setUpdatedOrders: (value: Orders) => void;
  isConstOrders: boolean;
  catalog?: RestCsaCatalog;
  subscriptionAbsences?: RestCsaSubscriptionAbsences;
  error?: string;
  setError: (value: string | undefined) => void;
  distributions: RestDistributionEnriched[];
  nextDistributionIndex: number;
  absenceDistributionsIds: number[] | null;
  setAbsenceDistributionsIds: (value: number[]) => void;
  subscription?: RestCsaSubscription;
  getSubscription: () => void;
  setSubscription: (value?: RestCsaSubscription) => void;
  setSubscriptionAbsences: (value?: RestCsaSubscriptionAbsences) => void;
  defaultOrder: Record<number, number>;
  setDefaultOrder: (value: Record<number, number>) => void;
  stocksPerProductDistribution: RestStocksPerProductDistribution | undefined;
  setStocksPerProductDistribution: (
    value: RestStocksPerProductDistribution | undefined,
  ) => void;
  adminMode?: boolean | undefined;
  initialOrders: Orders;
  remainingDistributions: number;
  minSubscriptionOrder: number;
  cancelOrder: (distributionId: number) => void;
}

export const CsaCatalogContext = React.createContext<CsaCatalogContextProps>({
  catalogId: -1,
  initialSubscriptionId: undefined,
  updatedOrders: {},
  setUpdatedOrders: () => { },
  isConstOrders: false,
  catalog: undefined,
  subscriptionAbsences: undefined,
  error: undefined,
  setError: () => { },
  distributions: [],
  nextDistributionIndex: -1,
  absenceDistributionsIds: null,
  setAbsenceDistributionsIds: () => { },
  subscription: undefined,
  getSubscription: () => { },
  setSubscription: () => { },
  setSubscriptionAbsences: () => { },
  defaultOrder: {},
  setDefaultOrder: () => { },
  stocksPerProductDistribution: {},
  setStocksPerProductDistribution: () => { },
  adminMode: false,
  initialOrders: {},
  remainingDistributions: 0,
  cancelOrder: () => { },
  minSubscriptionOrder: 0,
});

const CsaCatalogContextProvider = ({
  children,
  catalogId,
  initialSubscriptionId,
  adminMode,
}: {
  children: React.ReactNode;
  initialSubscriptionId?: number;
} & Pick<CsaCatalogContextProps, 'catalogId'> &
  Pick<CsaCatalogContextProps, 'adminMode'>) => {
  const [updatedOrders, setUpdatedOrders] = React.useState<
    Record<number, Record<number, number>>
  >({}); // Matrices with distributionId as a key, and a value which is a record which maps productId to a quantity
  const [absenceDistributionsIds, setAbsenceDistributionsIds] = React.useState<
    number[] | null
  >(null);
  const [subscription, setSubscription] = React.useState<
    RestCsaSubscription | undefined
  >();
  const [subscriptionAbsences, setSubscriptionAbsences] = React.useState<
    RestCsaSubscriptionAbsences | undefined
  >();
  const [defaultOrder, setDefaultOrder] = React.useState<
    Record<number, number>
  >({});
  const [otherError, setOtherError] = React.useState<string | undefined>();
  const [stocksPerProductDistribution, setStocksPerProductDistribution] =
    React.useState<RestStocksPerProductDistribution | undefined>({});

  const { data: catalog, error: catalogError } = useRestCatalogGet(catalogId);
  const [
    getStocksPerProductDistribution,
    { data: stocksPerProductDistributionData, error: stocksError },
  ] = useRestStocksGet(catalogId);

  const [
    getSubscriptionAbsences,
    { data: subscriptionAbsencesData, error: absencesError },
  ] = useRestSubscriptionAbsencesLazyGet();

  React.useEffect(() => {
    if (!catalog?.absentDistribsMaxNb || !subscription) return;

    getSubscriptionAbsences(`${subscription.id}`);
  }, [catalog?.absentDistribsMaxNb, getSubscriptionAbsences, subscription]);

  const [
    getSubscription,
    { data: subscriptionData, error: subscriptionError },
  ] = useRestSubscriptionGet(initialSubscriptionId!);

  React.useEffect(() => {
    if (!initialSubscriptionId) return;
    getSubscription();
  }, [getSubscription, initialSubscriptionId]);

  React.useEffect(() => {
    setSubscription(subscriptionData);
  }, [subscriptionData]);

  React.useEffect(() => {
    setSubscriptionAbsences(subscriptionAbsencesData);
  }, [subscriptionAbsencesData]);

  React.useEffect(() => {
    setStocksPerProductDistribution(stocksPerProductDistributionData);
  }, [stocksPerProductDistributionData]);

  // reset stocks data whenever new stock information arrives with a subscription
  React.useEffect(() => {
    getStocksPerProductDistribution();
  }, [getStocksPerProductDistribution, subscription]);

  const distributions = React.useMemo(() => {
    if (!catalog) return [];

    const enrichedDistributions = catalog.distributions.map((d) =>
      getEnrichedDistribution(d, subscriptionAbsences?.absentDistribIds),
    );

    if (!subscription) return enrichedDistributions;

    return enrichedDistributions.filter(
      (d) => subscription.distributions.findIndex((d2) => d2.id === d.id) > -1,
    );
  }, [catalog, subscription, subscriptionAbsences?.absentDistribIds]);

  const nextDistributionIndex = React.useMemo(() => {
    if (!distributions.length) return 0;
    const index = distributions.findIndex(
      (d) => d.state === RestDistributionState.Open,
    );
    return index !== -1 ? index : 0;
  }, [distributions]);

  const initialOrders = React.useMemo(() => {
    if (!catalog || !subscription) return {};

    let initialOrders = subscription.distributions.reduce((acc, d) => {
      acc[d.id] = d.orders.reduce((acc2, o) => {
        acc2[o.productId] = o.qty;
        return acc2;
      }, {} as Record<number, number>);
      return acc;
    }, {} as Record<number, Record<number, number>>);

    // Check all other products to 0
    Object.keys(initialOrders).forEach((distributionIdString) => {
      const distributionId = parseInt(distributionIdString, 10);
      initialOrders[distributionId] = catalog.products.reduce((acc, p) => {
        if (initialOrders[distributionId][p.id]) {
          acc[p.id] = initialOrders[distributionId][p.id];
        } else {
          acc[p.id] = 0;
        }
        return acc;
      }, {} as Record<number, number>);
    });

    return initialOrders;
  }, [catalog, subscription]);

  const isConstOrders = React.useMemo(() => {
    if (!catalog) return false;
    return (
      restCsaCatalogTypeToType(catalog.type) === CatalogType.TYPE_CONSTORDERS
    );
  }, [catalog]);

  React.useEffect(() => {
    if (!subscription) {
      if(!catalog) return;
      // if no subscription, initialize the default order with 0 for all products
      setDefaultOrder(
        catalog.products.reduce((acc, p) => {
          acc[p.id] = 0;
          return acc;
        }, {} as Record<number, number>),
      );
    } else {
      if (isConstOrders) {
        setDefaultOrder(
          subscription.distributions[0].orders.reduce((acc, d) => {
            acc[d.productId] = d.qty;
            return acc;
          }, {} as Record<number, number>),
        );
      } else {
        setDefaultOrder(
          subscription.defaultOrder.reduce((acc, d) => {
            acc[d.productId] = d.quantity;
            return acc;
          }, {} as Record<number, number>),
        );
      }
    }
  }, [isConstOrders, setDefaultOrder, subscription, catalog]);

  const cancelOrder = useCallback((distributionId: number) => {
    const upd = { ...updatedOrders };

    if (!upd[distributionId]) {
      upd[distributionId] = {};
    }
    catalog?.products.forEach(p => {
      upd[distributionId][p.id] = 0;
    })

    setUpdatedOrders(upd);
  }, [catalog?.products, updatedOrders, setUpdatedOrders]);

  const setDefaultOrderWithStockTracking = useCallback((newDefaultOrder: Record<number, number>) => {
    setUpdatedOrders(updatedOrders => {
      const upd = { ...updatedOrders };
      for (const d of distributions) {
        if (d.state === RestDistributionState.NotYetOpen || d.state === RestDistributionState.Open) {
          upd[d.id] = { ...newDefaultOrder };
        }
      }
      return upd
    });
    setDefaultOrder(newDefaultOrder);
  }, [distributions]);

  const remainingDistributions = React.useMemo(() => {
    return distributions.filter(
      d => {
        if (subscription) {
          return subscription.distributions.some(d2 => d2.id === d.id) &&
            isAfter(new Date(d.distributionStartDate), new Date()) &&
            d.state !== RestDistributionState.Absent
        } else {
          return isAfter(new Date(d.distributionStartDate), new Date()) &&
            d.state !== RestDistributionState.Absent
        }
      }).length;
  }, [subscription, distributions]);

  const minSubscriptionOrder = React.useMemo(() => {
    return !!subscription
      ? subscription?.minSubscriptionOrder
      : Math.floor((catalog?.catalogMinOrdersTotal ?? 0) / distributions.length * remainingDistributions);
  }, [subscription, catalog, distributions, remainingDistributions]);

  /** */
  return (
    <CsaCatalogContext.Provider
      value={{
        catalogId,
        initialSubscriptionId,
        isConstOrders,
        updatedOrders,
        setUpdatedOrders,
        catalog,
        subscriptionAbsences,
        error:
          catalogError ||
          absencesError ||
          subscriptionError ||
          otherError ||
          stocksError,
        setError: setOtherError,
        distributions,
        nextDistributionIndex,
        absenceDistributionsIds,
        setAbsenceDistributionsIds,
        subscription,
        getSubscription,
        setSubscription,
        setSubscriptionAbsences,
        defaultOrder,
        setDefaultOrder: setDefaultOrderWithStockTracking,
        stocksPerProductDistribution,
        setStocksPerProductDistribution,
        adminMode,
        initialOrders,
        remainingDistributions,
        cancelOrder,
        minSubscriptionOrder,
      }}
    >
      {children}
    </CsaCatalogContext.Provider>
  );
};

export default CsaCatalogContextProvider;
