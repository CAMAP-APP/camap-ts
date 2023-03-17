import React from 'react';
import useRestGetApi from '../../lib/REST/useRestGetApi';
import useRestLazyGet from '../../lib/REST/useRestLazyGetApi';
import useRestPostApi from '../../lib/REST/useRestPostApi';
import {
  RestCsaCatalog,
  RestCsaCatalogAbsences,
  RestCsaDefaultOrder,
  RestCsaDefaultOrderWithPrice,
  RestCsaSubscription,
  RestCsaSubscriptionAbsences,
} from './interfaces';

/*
 * Get catalog infos
 */

export const useRestCatalogGet = (catalogId: number) => {
  const url = React.useMemo(
    () => `/catalog/${catalogId}`,

    [catalogId],
  );
  return useRestGetApi<RestCsaCatalog>(url);
};

/*
 * Get catalog possible absences
 */

export const useRestCatalogAbsencesLazyGet = (catalogId: number) => {
  const url = React.useMemo(
    () => `/catalog/catalogAbsences/${catalogId}`,

    [catalogId],
  );
  return useRestLazyGet<RestCsaCatalogAbsences>(url);
};

/*
 * Create subscription
 */

type PostSubscriptionBody = {
  userId: number;
  catalogId: number;
  defaultOrder: RestCsaDefaultOrder[];
  absentDistribIds: Array<number> | null;
};

export const useRestSubscriptionPost = () => {
  const url = React.useMemo(() => `/subscription`, []);
  return useRestPostApi<RestCsaSubscription, PostSubscriptionBody>(url);
};

/*
 * Update Orders
 */

type PostUpdateSubscriptionOrder = {
  productId: number;
  qty: number;
};

type PostUpdateSubscriptionOrdersBody = {
  distributions: Array<{
    id: number;
    orders: Array<PostUpdateSubscriptionOrder>;
  }>;
};

export const useRestUpdateSubscriptionOrdersPost = () => {
  const url = React.useMemo(() => `/subscription/updateOrders/`, []);
  return useRestPostApi<RestCsaSubscription, PostUpdateSubscriptionOrdersBody>(
    url,
  );
};

/*
 * Update default order
 */

export const useRestUpdateSubscriptionDefaultOrderPost = () => {
  const url = React.useMemo(() => `/subscription/updateDefaultOrder/`, []);
  return useRestPostApi<RestCsaSubscription, RestCsaDefaultOrder[]>(url);
};

/*
 * Get subscription infos
 */

export const useRestSubscriptionGet = (subscriptionId: number) => {
  const url = React.useMemo(
    () => `/subscription/${subscriptionId}`,

    [subscriptionId],
  );
  return useRestLazyGet<RestCsaSubscription>(url);
};

/*
 * Get subscription's absences
 */

export const useRestSubscriptionAbsencesLazyGet = () => {
  const url = React.useMemo(() => `/catalog/subscriptionAbsences/`, []);
  return useRestLazyGet<RestCsaSubscriptionAbsences>(url);
};

/*
 * Update subscription's absences
 */

type PostSubscriptionAbsencesBody = {
  absentDistribIds: Array<number>;
};

export const useRestUpdateSubscriptionAbsencesPost = (
  subscriptionId: number,
) => {
  const url = React.useMemo(
    () => `/catalog/subscriptionAbsences/${subscriptionId}`,

    [subscriptionId],
  );
  return useRestPostApi<
    RestCsaSubscriptionAbsences,
    PostSubscriptionAbsencesBody
  >(url);
};

/*
 * Check default order
 */

export const useRestCheckSubscriptionDefaultOrderPost = (catalogId: number) => {
  const url = React.useMemo(
    () => `/subscription/checkDefaultOrder/${catalogId}`,
    [catalogId],
  );
  return useRestPostApi<string, RestCsaDefaultOrderWithPrice[]>(url);
};
