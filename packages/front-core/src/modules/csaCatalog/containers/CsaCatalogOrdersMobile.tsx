import {
  Box,
  Button,
  Tooltip,
  Typography
} from '@mui/material';
import React, { useCallback, useEffect, useMemo } from 'react';
import CamapIcon, { CamapIconId } from '../../../components/utils/CamapIcon';
import CircularProgressBox from '../../../components/utils/CircularProgressBox';
import ProductModal, {
  ProductInfos,
} from '../../../components/utils/Product/ProductModal';
import SuccessButton from '../../../components/utils/SuccessButton';
import { CatalogType } from '../../../gql';
import { useCamapTranslation } from '../../../utils/hooks/use-camap-translation';
import { useUnsavedChangesPrompt } from '../../../utils/hooks/use-unsaved-changes-prompt';
import { CsaCatalogContext } from '../CsaCatalog.context';
import { restCsaCatalogTypeToType, RestDistributionState } from '../interfaces';
import { useRestUpdateSubscriptionDefaultOrderPost } from '../requests';
import { CsaCatalogOrdersMobileHeader } from '../components/CsaCatalogOrdersMobileHeader';
import CsaCatalogOrdersMobileProduct from '../components/CsaCatalogOrdersMobileProduct';
import { MobileContainer } from './MobileContainer';
import { formatCurrency } from 'camap-common';
import { formatAbsoluteDate } from '@utils/fomat';

interface CsacatalogProps {
  adminMode?: boolean;
  onNext: () => Promise<boolean>;
  mode?: 'initialOrders' | 'defaultOrder' | 'orders';
}

const CsaCatalogOrdersMobile = ({
  adminMode,
  onNext,
  mode = 'orders'
}: CsacatalogProps) => {

  const { t, tCommon } = useCamapTranslation(
    {
      t: 'csa-catalog',
    },
    true,
  );

  const {
    isConstOrders,
    updatedOrders,
    setUpdatedOrders,
    catalog,
    subscription,
    distributions: allDistributions,
    nextDistributionIndex,
    setSubscription,
    defaultOrder,
    setError,
    initialOrders,
    setDefaultOrder,
    remainingDistributions,
    cancelOrder,
    minSubscriptionOrder,
    absenceDistributionsIds,
  } = React.useContext(CsaCatalogContext);

  const isConstOrDefaults = (mode === 'defaultOrder') || isConstOrders;

  const [toggleSuccess, setToggleSuccess] = React.useState(false);
  const [toggleSetDefaultOrderSuccess, setToggleSetDefaultOrderSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const distributions = useMemo(() => {
    if (mode === 'initialOrders') {
      return allDistributions
        .filter(d => [RestDistributionState.Open, RestDistributionState.NotYetOpen].includes(d.state))
        .map(d => ({
          ...d,
          state: absenceDistributionsIds?.includes(d.id) ? RestDistributionState.Absent : RestDistributionState.Open
        }));
    }
    return allDistributions;
  }, [allDistributions, mode, absenceDistributionsIds]);

  const [distributionIndex, setDistributionIndex] = React.useState(0);

  useEffect(() => {
    setDistributionIndex(
      distributions.findIndex(d => d.id === allDistributions[nextDistributionIndex].id)
    );
  }, [nextDistributionIndex, allDistributions, distributions])

  const [
    updateSubscriptionDefaultOrder,
    { data: updatedSubscriptionData, error: updateError },
  ] = useRestUpdateSubscriptionDefaultOrderPost();

  React.useEffect(() => {
    setError(updateError);
  }, [setError, updateError]);

  React.useEffect(() => {
    if (!updatedSubscriptionData) return;
    setSubscription(updatedSubscriptionData);
  }, [setSubscription, updatedSubscriptionData]);

  // user modified order
  const onOrderChange = (
    distributionId: number,
    productId: number,
    newValue: number,
  ) => {
    let adaptedNewValue = newValue;
    if (isNaN(newValue)) adaptedNewValue = 0;
    if (
      updatedOrders &&
      updatedOrders[distributionId] &&
      updatedOrders[distributionId][productId] === adaptedNewValue
    ) {
      return;
    }
    const newOrders = { ...updatedOrders };
    if (!newOrders[distributionId]) {
      newOrders[distributionId] = {};
    }
    newOrders[distributionId][productId] = adaptedNewValue;
    setUpdatedOrders(newOrders);
  };

  // get orders from updatedOrders
  const orders = React.useMemo(() => {
    if (!catalog) return {};

    // performant deep copy to prevent mutation on initialOrders
    const os = (mode === 'initialOrders') ? {} : structuredClone(initialOrders);
    distributions.forEach(({ id: distributionId }) => {
      os[distributionId] = catalog.products.reduce((acc, p) => {
        const updatedDistribution = updatedOrders[distributionId];
        const updatedOrder = updatedDistribution && updatedDistribution[p.id];
        if (updatedOrder !== undefined) {
          acc[p.id] = updatedOrder;
        } else {
          acc[p.id] = os[distributionId]?.[p.id] ?? 0;
        }
        return acc;
      }, {} as Record<number, number>);
    });
    return os;
  }, [catalog, initialOrders, updatedOrders, mode, distributions]);

  const hasProductOrder = useCallback((distributionId: number) => {
    return Object.keys(orders[distributionId]).some((productId) =>
      orders[distributionId][parseInt(productId)] > 0);
  }, [orders]);

  const hasChanges = React.useMemo(() => {
    return Object.entries(updatedOrders).some(
      ([distributionIdString, productOrders]) => {
        const distributionId = parseInt(distributionIdString, 10);
        return Object.entries(productOrders).some(([productIdString, qty]) => {
          const productId = parseInt(productIdString, 10);
          const initialQty = initialOrders[distributionId]?.[productId] ?? 0;
          return qty !== initialQty;
        });
      },
    );
  }, [initialOrders, updatedOrders]);

  const onPreviousDistribution = () => {
    setDistributionIndex(Math.max(distributionIndex - 1, 0));
  };
  const onNextDistribution = () => {
    setDistributionIndex(Math.min(distributionIndex + 1, distributions.length - 1));
  };

  const distribution = (distributionIndex < 0)
    ? distributions[0]
    : distributionIndex >= distributions.length
      ? distributions[distributions.length - 1]
      : distributions[distributionIndex];

  const computeOrderTotal = useCallback((order: Record<number, number>) => {
    if(order == null) return 0;
    return Object.keys(order).reduce((acc, pid) => {
      const product = catalog?.products.find(
        (p) => p.id === parseInt(pid, 10),
      );
      if (!product) return acc;
      return acc + (order[parseInt(pid, 10)] ?? 0) * product.price;
    }, 0);
  }, [catalog?.products]);

  const total = useMemo(
    () => computeOrderTotal(orders?.[distribution.id]),
    [orders, distribution.id, computeOrderTotal],
  );

  const defaultOrderTotal = useMemo(
    () => computeOrderTotal(defaultOrder),
    [defaultOrder, computeOrderTotal]
  );

  const contractTotal = useMemo(
    () => distributions.reduce((acc, distribution) => acc + computeOrderTotal(orders?.[distribution.id]), 0),
    [orders, distributions, computeOrderTotal]
  );
  const contractBalance = useMemo(() => {
    const initialBalance = subscription?.balance ?? 0;
    const initialOrdersTotal = distributions.reduce((acc, distribution) => acc + computeOrderTotal(initialOrders?.[distribution.id]), 0);
    return initialBalance + initialOrdersTotal - contractTotal;
  }, [subscription?.balance, initialOrders, contractTotal, distributions, computeOrderTotal]);

  useUnsavedChangesPrompt({
    when: hasChanges,
    message: t('unsavedOrdersConfirmLeave'),
  });

  const [defaultOrdersMode, setDefaultOrdersMode] =
    React.useState(isConstOrDefaults);

  const onDefaultOrderChange = useCallback((productId: number, quantity: number) => {
    setDefaultOrder({
      ...defaultOrder,
      [productId]: quantity
    });
  }, [defaultOrder, setDefaultOrder]);

  const updateDefaultOrders = async () => {
    if (!subscription) return;
    await updateSubscriptionDefaultOrder(
      Object.keys(defaultOrder).map((productId) => ({
        productId: parseInt(productId, 10),
        quantity: defaultOrder[parseInt(productId, 10)],
      })),
      `${subscription.id}`,
    );
  };

  const onSaveClick = async () => {
    setLoading(true);
    const success = await onNext();
    if (success) {
      setToggleSuccess(true);
      setTimeout(() => {
        setToggleSuccess(false);
      }, 2000);
    }
    setLoading(false);
  };

  const onCancelOrder = useCallback(() => {
    cancelOrder(distribution.id);
    void onNext();
  }, [distribution.id, cancelOrder, onNext]);

  const setCurrentDistributionAsDefaultOrder = useCallback(() => {
    if (!catalog) return;
    (async () => {
      const defaultOrderProducts = catalog.products.map(p => {
        return {
          productId: p.id,
          quantity: orders[distribution.id][p.id] ?? 0
        }
      });
      setDefaultOrder(Object.fromEntries(defaultOrderProducts.map(p => [p.productId, p.quantity])));

      if (subscription) {
        setToggleSetDefaultOrderSuccess(true);
        const rqStart = Date.now();
        await updateSubscriptionDefaultOrder(
          defaultOrderProducts,
          `${subscription.id}`,
        )
        setTimeout(() => {
          setToggleSetDefaultOrderSuccess(false);
        }, 2000 - (Date.now() - rqStart));
      }
    })();
  }, [subscription, catalog, orders, distribution.id, updateSubscriptionDefaultOrder, setDefaultOrder])

  const [modalProduct, setModalProduct] = React.useState<ProductInfos>();

  const onProductModalClose = () => {
    setModalProduct(undefined);
  };

  if (!catalog || (mode !== 'defaultOrder' && !distributions) || !Object.keys(orders).length) {
    return <CircularProgressBox />;
  }

  const title = isConstOrders
    ? t('constOrder')
    : defaultOrdersMode ? t('defaultOrder') : (adminMode ? t('changeOrders') : t('changeMyOrders'));

  const buttons = [];
  if (defaultOrdersMode) {
    buttons.push(<Tooltip key="update-default-order" title={t('setAsDefaultOrder', { distrib: remainingDistributions })}>
      <span>{/* prevents disable state to inhibit tooltip */}
        <SuccessButton
          variant="contained"
          disabled={isConstOrders ? defaultOrderTotal === 0 : (catalog?.distribMinOrdersTotal ?? 0) > defaultOrderTotal}
          onClick={async () => {
            await updateDefaultOrders();
            if (isConstOrDefaults) {
              void onNext();
            }
          }}
        >
          {isConstOrDefaults ? tCommon('save') : t('setAsDefaultOrderBtn')}
        </SuccessButton>
      </span>
    </Tooltip>)
  } else if (distribution.state !== RestDistributionState.Absent) {
    if (mode !== 'initialOrders' && distribution.state === RestDistributionState.Open && hasProductOrder(distribution.id)) {
      buttons.push(<Button
        key="cancel-order"
        variant="outlined"
        disabled={(catalog?.distribMinOrdersTotal ?? 0) > 0}
        onClick={onCancelOrder}
      >
        {t('cancelOrder')}
      </Button>)
    }
    if (restCsaCatalogTypeToType(catalog?.type ?? 0) === CatalogType.TYPE_VARORDER) {
      buttons.push(
        <Tooltip key="set-default-order" title={t('setAsDefaultOrder', { distrib: remainingDistributions })}>
            <SuccessButton
              variant="contained"
              color="primary"
              toggleSuccess={toggleSetDefaultOrderSuccess}
              disabled={(catalog?.distribMinOrdersTotal ?? 0) > total}
              onClick={setCurrentDistributionAsDefaultOrder}
            >
              {t('setAsDefaultOrderBtn')}
            </SuccessButton>
        </Tooltip>);
    }
    if (distribution.state === RestDistributionState.Open) {
      buttons.push(<SuccessButton
        key="save-order"
        loading={loading}
        toggleSuccess={toggleSuccess}
        variant="contained"
        color="primary"
        disabled={!hasChanges || (catalog?.distribMinOrdersTotal ?? 0) > total || minSubscriptionOrder > contractTotal}
        onClick={onSaveClick}
      >
        {tCommon('save')}
      </SuccessButton>
      );
    }
  }

  const errors = [];
  if (distribution.state !== RestDistributionState.Absent) {
    if (catalog?.distribMinOrdersTotal && catalog.distribMinOrdersTotal > 0) {
      if (!defaultOrdersMode) {
        for(const d of distributions) {
          if(d.state === RestDistributionState.Absent || absenceDistributionsIds?.includes(d.id)) continue;
          const ditribTotal = computeOrderTotal(orders?.[d.id]);
          if(ditribTotal < catalog.distribMinOrdersTotal) {
            if(d.id !== distribution.id) {
              errors.push(<Typography key="error-total-distrib" color="error">{t('totalOrderTooLowAt', { minOrderTotal: formatCurrency(catalog.distribMinOrdersTotal), distrib: formatAbsoluteDate(d.distributionStartDate, false, true, true)})}</Typography>);
            } else {
              errors.push(<Typography key="error-total-distrib" color="error">{t('totalOrderTooLow', { minOrderTotal: formatCurrency(catalog.distribMinOrdersTotal) })}</Typography>);
            }
            break;
          }
        }
      }
      if (defaultOrdersMode && catalog.distribMinOrdersTotal > defaultOrderTotal) {
        errors.push(<Typography key="error-total-distrib" color="error">{t('totalOrderTooLow', { minOrderTotal: formatCurrency(catalog.distribMinOrdersTotal) })}</Typography>);
      }
    }
  }
  if (minSubscriptionOrder > contractTotal) {
    errors.push(<Typography key="error-total-contract" color="error">{t('totalContractTooLow', { minOrderTotal: formatCurrency(minSubscriptionOrder) })}</Typography>);
  }

  return (
    <MobileContainer title={title}
      icon={isConstOrders ? CamapIconId.constOrders : CamapIconId.varOrders}
      actions={<>
        {mode !== 'defaultOrder' && (
          <Button
            color="lightgrey"
            variant="contained"
            value="default-order"
            onClick={() => setDefaultOrdersMode(!defaultOrdersMode)}
            sx={{
              maxWidth: {'xs': '170px', 'sm': 'unset'},
              fontSize: {'xs': '0.875rem', 'sm': '1rem'},
              padding: {'xs': '4px 8px', 'sm': '10px 20px'},
            }}  
          >
            {defaultOrdersMode ? t('changeOrders') : t('defaultOrderBtn')}
          </Button>
        )}
      </>}>
      <CsaCatalogOrdersMobileHeader
        distribution={distribution}
        distributions={distributions}
        onPreviousDistribution={onPreviousDistribution}
        onNextDistribution={onNextDistribution}
        distributionIndex={distributionIndex}
        orders={orders}
        orderTotal={total}
        defaultOrderTotal={defaultOrderTotal}
        contractBalance={contractBalance}
        contractTotal={contractTotal}
        defaultOrdersMode={defaultOrdersMode} />

      {!defaultOrdersMode && distribution.state === RestDistributionState.Absent
        ? <>
          <Box display='flex' justifyContent='center' my={4}>
            <Typography variant='h5'>{t("absent")}</Typography>
            <CamapIcon id={CamapIconId.absent} />
          </Box>
        </>
        : <>
          {/* Products */}
          <Box display="grid" gridTemplateColumns='repeat(auto-fill, minmax(150px, 1fr))' gap={1} justifyItems={'center'}>
            {catalog?.products?.map(
              (p) =>
                <CsaCatalogOrdersMobileProduct
                  key={p.id}
                  product={p}
                  orderedQuantity={
                    (defaultOrdersMode ? defaultOrder[p.id] : orders[distribution.id][p.id]) ?? 0
                  }
                  onClick={() => setModalProduct(p)}
                  onQuantityChange={(q) => {
                    defaultOrdersMode
                      ? onDefaultOrderChange(p.id, q)
                      : onOrderChange(distribution.id, p.id, q)
                  }}
                  editable={defaultOrdersMode || distribution.state === RestDistributionState.Open}
                  distribution={distribution}
                  defaultOrdersMode={defaultOrdersMode}
                />
            )}
            <ProductModal product={modalProduct} onClose={onProductModalClose} />
          </Box>
        </>
      }

      {/* Buttons */}
      <Box
        width="100%"
        display="flex"
        flexDirection={{ xs: 'column', sm: 'row' }}
        flexWrap="wrap"
        justifyContent='flex-end'
        mt={2}
      >
        {errors.length > 0 && <Box
            display="flex"
            flexDirection="column"
            flexWrap="wrap"
            alignItems='flex-end'
          >
            {errors}
          </Box>
        }
        <Box
          width="100%"
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row' }}
          flexWrap="wrap"
          justifyContent='flex-end'
          mt={2}
        >
          {buttons}
        </Box>
      </Box>
    </MobileContainer>
  );
};

export default CsaCatalogOrdersMobile;
