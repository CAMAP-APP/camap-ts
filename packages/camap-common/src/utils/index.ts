import { format } from "date-fns";
import {
  FRANCE_ISO_3166_1_ALPHA2,
  FRENCH_OVERSEAS_ISO_3166_1_ALPHA2,
} from "../constants";

export const simpleHash = (value: string) => {
  let hash = 0;
  if (value.length == 0) return hash;
  for (let i = 0; i < value.length; i++) {
    const char = value.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};

export const isPromise = (promise: any) => {
  return !!promise && typeof promise.then === "function";
};

// Given an ISO 3166 1 ALPHA2 country code, returns whether or not it is in France
// It takes into account French overseas departments and collectivity
export const isFrenchCountryCode = (countryCode: string) => {
  if (countryCode.toLowerCase() === FRANCE_ISO_3166_1_ALPHA2) {
    return true;
  }
  if (FRENCH_OVERSEAS_ISO_3166_1_ALPHA2.includes(countryCode.toLowerCase())) {
    return true;
  }
  return false;
};

export const computeUserOrderAmount = (userOrder: {
  quantity: number;
  productPrice: number;
  feesRate?: number;
}) =>
  roundPrice(
    roundPrice(userOrder.quantity * userOrder.productPrice) *
      (1 + (userOrder.feesRate || 0) / 100)
  );

export const computeUserOrdersAmount = (
  userOrders: { quantity: number; productPrice: number; feesRate?: number }[]
) =>
  userOrders.reduce(
    (total, order) => roundPrice(total + computeUserOrderAmount(order)),
    0
  );

export const generatePaymentCode = (
  multiDistrib: { placeId: number; distribStartDate: Date },
  user: { id: number }
) =>
  `${format(multiDistrib.distribStartDate, "yyyy-mm-dd")}-${
    multiDistrib.placeId
  }-${user.id}`;

export const roundPrice = (value: number) => Math.round(value * 100) / 100;
export type DateRange = { from: Date, to: Date }

export * from './user-utils';
