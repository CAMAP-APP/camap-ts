import { Unit } from "./interfaces";

/**
 *  Display a unit
 */
export const formatUnit = (
  u?: Unit,
  quantity?: number,
  t?: (key: string) => string
): string => {
  switch (u) {
    case Unit.Kilogram:
      return "Kg.";
    case Unit.Gram:
      return "g.";
    case Unit.Litre:
      return "L.";
    case Unit.Centilitre:
      return "cl.";
    case Unit.Millilitre:
      return "ml.";
    case Unit.Piece:
    default:
      if (!t) return "";
      if (quantity === 1.0) return t("item");
      return t("item_plural");
  }
};

/**
  Display a number with a comma and 2 digits
* */
export const formatNumber = (n?: number): string => {
  if (n === undefined) return "";

  // arrondi a 2 apres virgule
  let out = (Math.round(n * 100) / 100).toString();

  // ajout un zéro, 1,8-->1,80
  if (out.indexOf(".") !== -1 && out.split(".")[1].length === 1) out += "0";

  // virgule et pas point
  return out.split(".").join(",");
};

export const hasSmartQt = (product: {
  wholesale: boolean;
  variablePrice: boolean;
  bulk: boolean;
}) => {
  return product.wholesale || product.variablePrice || product.bulk;
};

export const formatSmartQt = (
  product: {
    name: string;
    wholesale: boolean;
    variablePrice: boolean;
    bulk: boolean;
    qt: number | null;
    unitType: number;
  },
  userOrder: { quantity: number }
) => {
  let orderQt = userOrder.quantity || 1;
  let productQt = product.qt || 1;
  let unit = product.unitType || Unit.Piece;

  if (hasSmartQt(product)) {
    if (unit == Unit.Piece && productQt == 1) {
      return `${formatNumber(orderQt)} ${product.name}`;
    } else {
      return `${formatNumber(orderQt * productQt)}${formatUnit(unit)} ${
        product.name
      }`;
    }
  }

  const quantityStr = userOrder.quantity > 1 ? `${userOrder.quantity} x ` : "";

  if (unit == Unit.Piece && productQt == 1) {
    return `${quantityStr}${product.name}`;
  }

  return `${quantityStr}${product.name} ${product.qt}${formatUnit(
    product.unitType
  )}`;
};
