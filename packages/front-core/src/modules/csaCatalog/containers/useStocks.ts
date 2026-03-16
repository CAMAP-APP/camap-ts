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
        stocksPerProductDistribution,
        initialOrders,
        updatedOrders
    } = useContext(CsaCatalogContext);

    /*
     * If the stock tracking isnot global and distribution == null,
     * meaning this is the context of a default order or const order,
     * we may return a "least stock" value, which is the lowest the stock will go
     */
    const [stocks, isLeast] = useMemo(() => {

        if (catalog == null || !catalog.hasStockManagement || stocksPerProductDistribution == null)
            return [null, false];

        const productStockPerDistribution = stocksPerProductDistribution[product.id];
        const diffForDistribution = (dId: number) => {
            var initialOrder: number =
                initialOrders[dId] != null && initialOrders[dId][product.id] != null
                    ? initialOrders[dId][product.id]
                    : 0;
            var updatedOrder: number =
                updatedOrders[dId] != null && updatedOrders[dId][product.id] != null
                    ? updatedOrders[dId][product.id]
                    : initialOrder;
            return updatedOrder - initialOrder;
        }
        const stockForDistribution = (dId: number) => {
            if (productStockPerDistribution[dId] != null) {
                let distributionStock = productStockPerDistribution[dId];
                return distributionStock - diffForDistribution(dId);
            }
            return null;
        }

        if (product.stockTracking === StockTracking.Global) {
            // initialize with lowest stock value in a distribution from the server (even though should all be equel)
            let globalStock = Object.values(productStockPerDistribution)
                .reduce(
                    (min: number, v: number): number => Math.min(min, v),
                    Number.MAX_VALUE
                );
            // add/remove stock variation of current edit
            globalStock = Object.keys(productStockPerDistribution)
                .reduce(
                    (acc: number, dId: string): number =>
                        acc - diffForDistribution(parseInt(dId, 10))
                    ,
                    globalStock
                );

            return globalStock === Number.MAX_VALUE ? [null, false] : [globalStock, false];
        } else {
            if (productStockPerDistribution == null)
                return [null, false];
            if (distribution != null) {
                return [stockForDistribution(distribution.id), false];
            }
            const distributions = distribution != null ? [distribution] : catalog.distributions;
            const distributionStock = distributions.reduce((acc, d) => {
                const stock = stockForDistribution(d.id);
                return Math.min(acc, stock ?? Number.MAX_VALUE);
            }, Number.MAX_VALUE);
            return distributionStock === Number.MAX_VALUE ? [null, false] : [distributionStock, true];
        }

    }, [product, catalog, stocksPerProductDistribution, initialOrders, updatedOrders, distribution]);

    return [stocks, isLeast] as const;

}