import React from 'react';
import {
  getEnrichedDistribution,
  RestCsaCatalog,
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

type Orders = Record<number, Record<number, number>>;

interface CsaCatalogContextProps {
  catalogId: number;
  initialSubscriptionId?: number;
  updatedOrders: Orders;
  setUpdatedOrders: (value: Orders) => void;
  catalog?: RestCsaCatalog;
  subscriptionAbsences?: RestCsaSubscriptionAbsences;
  error?: string;
  setError: (value: string | undefined) => void;
  distributions: RestDistributionEnriched[];
  nextDistributionIndex: number;
  absenceDistributionsIds: (number | '')[] | null;
  setAbsenceDistributionsIds: (value: (number | '')[]) => void;
  subscription?: RestCsaSubscription;
  getSubscription: () => void;
  setSubscription: (value?: RestCsaSubscription) => void;
  setSubscriptionAbsences: (value?: RestCsaSubscriptionAbsences) => void;
  defaultOrder: Record<number, number>;
  setDefaultOrder: (value: Record<number, number>) => void;
  addedOrders: Record<number, number>;
  setAddedOrders: (value: Record<number, number>) => void;
  stocksPerProductDistribution: RestStocksPerProductDistribution | undefined;
  setStocksPerProductDistribution: (
    value: RestStocksPerProductDistribution | undefined,
  ) => void;
  adminMode?: boolean | undefined;
}

export const CsaCatalogContext = React.createContext<CsaCatalogContextProps>({
  catalogId: -1,
  initialSubscriptionId: undefined,
  updatedOrders: {},
  setUpdatedOrders: () => {},
  catalog: undefined,
  subscriptionAbsences: undefined,
  error: undefined,
  setError: () => {},
  distributions: [],
  nextDistributionIndex: -1,
  absenceDistributionsIds: null,
  setAbsenceDistributionsIds: () => {},
  subscription: undefined,
  getSubscription: () => {},
  setSubscription: () => {},
  setSubscriptionAbsences: () => {},
  defaultOrder: {},
  setDefaultOrder: () => {},
  addedOrders: {},
  setAddedOrders: () => {},
  stocksPerProductDistribution: {},
  setStocksPerProductDistribution: () => {},
  adminMode: false,
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
    (number | '')[] | null
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
  const [addedOrders, setAddedOrders] = React.useState<Record<number, number>>(
    {},
  );
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
    setAddedOrders({});
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

  /** */
  return (
    <CsaCatalogContext.Provider
      value={{
        catalogId,
        initialSubscriptionId,
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
        setDefaultOrder,
        addedOrders,
        setAddedOrders,
        stocksPerProductDistribution,
        setStocksPerProductDistribution,
        adminMode,
      }}
    >
      {children}
    </CsaCatalogContext.Provider>
  );
};

export default CsaCatalogContextProvider;
