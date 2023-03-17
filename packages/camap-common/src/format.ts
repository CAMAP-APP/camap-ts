export const formatCurrency = (value: number, currency: string = "EUR") => {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(
    value
  );
};

export const formatAddress = ({
  city,
  zipCode,
  address1,
  address2,
}: {
  city?: string | null;
  zipCode?: string | null;
  address1?: string | null;
  address2?: string | null;
}): string => {
  let res = "";

  if (city) res = city;
  if (zipCode) res = `${res} (${zipCode})`;

  let address = "";
  if (address1) address = `${address1}`;
  if (address2) address = `${address} ${address2}`;

  if (address) res = `${address} - ${res}`;

  return res;
};
