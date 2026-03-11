import { useContext, useMemo } from "react";
import { CsaCatalogContext } from "../CsaCatalog.context";
import { StockTracking } from "camap-common";
import { RestCsaCatalog } from "../interfaces";
import { Distribution } from "@gql";

export default function useStocks(
    product: RestCsaCatalog['products'][number],
    distribution?: Distribution
) {

    const {
        catalog,
        addedOrders,
        stocksPerProductDistribution,
        initialOrders,
        updatedOrders
    } = useContext(CsaCatalogContext);

    const [stocks, isLeast] = useMemo(() => {

        if (catalog == null || !catalog.hasStockManagement || stocksPerProductDistribution == null)
            return null;

        if (product.stockTracking === StockTracking.Global) {
            var globalStock = 0;
            globalStock = Object.values(
                stocksPerProductDistribution[product.id],
            ).reduce((acc, v) => Math.min(acc, v), Number.MAX_VALUE);
            if (addedOrders != null) {
                globalStock -= addedOrders.hasOwnProperty(product.id)
                    ? addedOrders[product.id]
                    : 0;
            }

            return globalStock === Number.MAX_VALUE ? [null, false] : [globalStock, false];
        } else {
            const productStockPerDistribution = stocksPerProductDistribution[product.id];
            if (productStockPerDistribution == null)
                return null;

            const stockForDistribution = (d: Distribution) => {
                if (productStockPerDistribution[d.id] != null) {
                    let distributionStock = productStockPerDistribution[d.id];
                    var initialOrder: number =
                        initialOrders[d.id] != null && initialOrders[d.id][product.id] != null
                            ? initialOrders[d.id][product.id]
                            : 0;
                    var updatedOrder: number =
                        updatedOrders[d.id] != null && updatedOrders[d.id][product.id] != null
                            ? updatedOrders[d.id][product.id]
                            : initialOrder;
                    var added = updatedOrder - initialOrder;
                    distributionStock -= added;
                    return distributionStock;
                }
                return 0;
            }
            if (distribution != null) {
                return [stockForDistribution(distribution), false];
            }
            const distributions = distribution != null ? [distribution] : catalog.distributions;
            const distributionStock = distributions.reduce((acc, d) => {

                return acc;
            }, Number.MAX_VALUE);
            return distributionStock === Number.MAX_VALUE ? null : distributionStock;
        }

    }, [product, catalog, addedOrders, stocksPerProductDistribution, initialOrders, updatedOrders, distribution]);

    return [stocks, isLeast];

}