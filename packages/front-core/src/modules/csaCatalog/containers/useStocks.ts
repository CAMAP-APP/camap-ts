import { useContext, useMemo } from "react";
import { CsaCatalogContext } from "../CsaCatalog.context";
import { StockTracking } from "camap-common";
import { RestCsaCatalog } from "../interfaces";
import { Distribution } from "@gql";

export default function useStocks(product: RestCsaCatalog['products'][number], distribution: Distribution) {

    const {
        catalog,
        addedOrders,
        stocksPerProductDistribution,
        initialOrders,
        updatedOrders
    } = useContext(CsaCatalogContext);

    const stocks = useMemo(() => {

        const isGlobalStock =
            catalog?.hasStockManagement &&
            product.stockTracking === StockTracking.Global &&
            stocksPerProductDistribution != null;

        if (isGlobalStock) {
            var globalStock = 0;
            if (
                isGlobalStock &&
                stocksPerProductDistribution[product.id] != null &&
                addedOrders != null
            ) {
                globalStock = Object.values(
                    stocksPerProductDistribution[product.id],
                ).reduce((acc, v) => Math.min(acc, v), Number.MAX_VALUE);
                globalStock -= addedOrders.hasOwnProperty(product.id)
                    ? addedOrders[product.id]
                    : 0;
            }

            return globalStock;
        } else {
            const isDistributionStock =
                catalog != null &&
                catalog.hasStockManagement &&
                stocksPerProductDistribution != null &&
                stocksPerProductDistribution[product.id] != null &&
                stocksPerProductDistribution[product.id][distribution.id] != null;
            let distributionStock = null;
            if (isDistributionStock) {
                distributionStock = stocksPerProductDistribution[product.id][distribution.id];
                var initialOrder: number =
                    initialOrders[distribution.id] != null && initialOrders[distribution.id][product.id] != null
                        ? initialOrders[distribution.id][product.id]
                        : 0;
                var updatedOrder: number =
                    updatedOrders[distribution.id] != null && updatedOrders[distribution.id][product.id] != null
                        ? updatedOrders[distribution.id][product.id]
                        : initialOrder;
                var added = updatedOrder - initialOrder;
                distributionStock -= added;
            }
            return distributionStock;
        }

    }, [product, catalog, addedOrders, stocksPerProductDistribution, initialOrders, updatedOrders, distribution]);

    return [stocks];

}