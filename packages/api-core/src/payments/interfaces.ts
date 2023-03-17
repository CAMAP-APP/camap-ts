export enum PaymentContext {
  PCAll = 'PCAll',
  PCGroupAdmin = 'PCGroupAdmin',
  PCPayment = 'PCPayment',
  PCManualEntry = 'PCManualEntry',
}

export enum PaymentTypeId {
  cash = 'cash',
  check = 'check',
  transfer = 'transfer',
  onthespot = 'onthespot',
  moneypot = 'moneypot',
  cardTerminal = 'card-terminal',
}

export interface PaymentType {
  id: PaymentTypeId; // unique string id
  onTheSpot: boolean; // is this payment made "on the spot"
}

export const cashPaymentType: PaymentType = {
  id: PaymentTypeId.cash,
  onTheSpot: true,
};

export const checkPaymentType: PaymentType = {
  id: PaymentTypeId.check,
  onTheSpot: true,
};

export const transferPaymentType: PaymentType = {
  id: PaymentTypeId.transfer,
  onTheSpot: false,
};

export const moneyPotPaymentType: PaymentType = {
  id: PaymentTypeId.moneypot,
  onTheSpot: false,
};

export const onTheSpotPaymentType: PaymentType = {
  id: PaymentTypeId.onthespot,
  onTheSpot: false,
};

export const onTheSpotCardTerminalPaymentType: PaymentType = {
  id: PaymentTypeId.cardTerminal,
  onTheSpot: true,
};
