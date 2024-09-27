import { isAfter, isBefore } from 'date-fns';
import { Catalog, CatalogType, Distribution, User } from '../../gql';

export const restCsaCatalogTypeToType = (type: 0 | 1): CatalogType => {
  return type === 0 ? CatalogType.TYPE_CONSTORDERS : CatalogType.TYPE_VARORDER;
};

interface RestCsaCatalogDocument {
  name: string;
  url: string;
}

type RestDistribution = Distribution & {
  distributionStartDate: string;
  orderEndDate: string;
  orderStartDate: string;
};

export type RestCsaCatalog = Pick<
  Catalog,
  'id' | 'name' | 'startDate' | 'endDate' | 'vendor' | 'products'
> & {
  absences: string;
  documents: RestCsaCatalogDocument[];
  constraints?: string;
  description?: string;
  type: 0 | 1;
  distributions: RestDistribution[];
  contact?: User;
  absentDistribsMaxNb?: number;
  distribMinOrdersTotal: number;
  hasStockManagement: boolean;
};

export type RestStocksPerProductDistribution = { [productId: number]: { [distribId: number]: number } };

export type RestCsaCatalogAbsences = {
  startDate: string;
  endDate: string;
  absentDistribsMaxNb?: number;
  possibleAbsentDistribs: RestDistribution[];
};

export enum RestDistributionState {
  Open,
  NotYetOpen,
  Closed,
  Absent,
}

export type RestDistributionEnriched = Distribution & {
  state: RestDistributionState;
  distributionStartDate: Date;
};

export const getEnrichedDistribution = (
  restDistribution: RestDistribution,
  absentDistribIds?: number[],
): RestDistributionEnriched => {
  const orderStartDate = new Date(restDistribution.orderStartDate);
  const orderEndDate = new Date(restDistribution.orderEndDate);
  const now = new Date();
  let state = RestDistributionState.Open;
  const isAbsent = absentDistribIds?.includes(restDistribution.id);
  if (isAbsent) {
    state = RestDistributionState.Absent;
  } else if (isAfter(orderStartDate, now)) {
    state = RestDistributionState.NotYetOpen;
  } else if (isBefore(orderEndDate, now)) {
    state = RestDistributionState.Closed;
  }

  return {
    ...restDistribution,
    distributionStartDate: new Date(restDistribution.distributionStartDate),
    orderEndDate,
    orderStartDate,
    state,
  };
};

export type RestCsaCatalogSubscriptionDistributionOrder = {
  id: number;
  productId: number;
  qty: number;
};

export type RestCsaCatalogSubscriptionDistribution = {
  id: number;
  orders: RestCsaCatalogSubscriptionDistributionOrder[];
};

export type RestCsaDefaultOrder = {
  productId: number;
  quantity: number;
};

export type RestCsaDefaultOrderWithPrice = RestCsaDefaultOrder & {
  productPrice: number;
};

export type RestCsaSubscription = {
  catalogId: number;
  startDate: string;
  endDate: string;
  id: number;
  distributions: RestCsaCatalogSubscriptionDistribution[];
  absentDistribIds: number[];
  constraints: string;
  totalOrdered: number;
  balance: number;
  defaultOrder: RestCsaDefaultOrder[];
};

export type RestCsaSubscriptionAbsences = RestCsaCatalogAbsences & {
  absentDistribIds: number[];
};
