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

interface CsacatalogProps {
  adminMode?: boolean;
  onNext: () => Promise<boolean>;
  mode?: 'defaultOrder' | 'orders';
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
    distributions,
    nextDistributionIndex,
    setSubscription,
    defaultOrder,
    setError,
    initialOrders,
    setDefaultOrder,
    remainingDistributions,
    cancelOrder,
  } = React.useContext(CsaCatalogContext);

  const isConstOrDefaults = mode === 'defaultOrder' || isConstOrders;

  const [toggleSuccess, setToggleSuccess] = React.useState(false);
  const [toggleSetDefaultOrderSuccess, setToggleSetDefaultOrderSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const [distributionIndex, setDistributionIndex] = React.useState(nextDistributionIndex);

  useEffect(() => {
    setDistributionIndex(nextDistributionIndex);
  }, [nextDistributionIndex])

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
    const os = structuredClone(initialOrders);
    Object.keys(os).forEach((distributionIdString) => {
      const distributionId = parseInt(distributionIdString, 10);
      os[distributionId] = catalog.products.reduce((acc, p) => {
        const updatedDistribution = updatedOrders[distributionId];
        const updatedOrder = updatedDistribution && updatedDistribution[p.id];
        if (updatedOrder !== undefined) {
          acc[p.id] = updatedOrder;
        } else {
          acc[p.id] = os[distributionId][p.id];
        }
        return acc;
      }, {} as Record<number, number>);
    });
    return os;
  }, [catalog, initialOrders, updatedOrders]);

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

  const total = useMemo(
    () => {
      if (!orders || !distribution.id || !orders[distribution.id]) return 0;

      return Object.keys(orders[distribution.id]).reduce((acc, pid) => {
        const product = catalog?.products.find(
          (p) => p.id === parseInt(pid, 10),
        );
        if (!product) return acc;
        const quantity = orders[distribution.id][parseInt(pid, 10)];
        acc += quantity * product.price;
        return acc;
      }, 0)
    },
    [catalog?.products, orders, distribution.id],
  );

  const defaultOrderTotal = useMemo(
    () => {
      return Object.entries(defaultOrder).reduce((acc, [productId, quantity]) => {
        const product: { price: number } | undefined = catalog?.products.find(
          (p) => p.id === parseInt(productId, 10),
        );
        if (!product) return acc;
        return acc + quantity * product.price;
      }, 0);
    }, [catalog?.products, defaultOrder]
  );

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
    if (!subscription || !catalog) return;
    (async () => {
      const defaultOrderProducts = catalog.products.map(p => {
        return {
          productId: p.id,
          quantity: orders[distribution.id][p.id] ?? 0
        }
      });

      setToggleSetDefaultOrderSuccess(true);
      const rqStart = Date.now();
      await updateSubscriptionDefaultOrder(
        defaultOrderProducts,
        `${subscription.id}`,
      )

      setTimeout(() => {
        setToggleSetDefaultOrderSuccess(false);
      }, 2000 - (Date.now() - rqStart));
    })();
  }, [subscription, catalog, orders, distribution.id, updateSubscriptionDefaultOrder])

  const [modalProduct, setModalProduct] = React.useState<ProductInfos>();

  const onProductModalClose = () => {
    setModalProduct(undefined);
  };

  if (mode !== 'defaultOrder' && (!catalog || !distributions || !Object.keys(orders).length)) {
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
          disabled={(catalog?.distribMinOrdersTotal ?? 0) > defaultOrderTotal}
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
    if (distribution.state === RestDistributionState.Open && hasProductOrder(distribution.id)) {
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
          <span>{/* prevents disable state to inhibit tooltip */}
            <SuccessButton
              variant="contained"
              color="primary"
              toggleSuccess={toggleSetDefaultOrderSuccess}
              disabled={(catalog?.distribMinOrdersTotal ?? 0) > total}
              onClick={setCurrentDistributionAsDefaultOrder}
            >
              {t('setAsDefaultOrderBtn')}
            </SuccessButton>
          </span>
        </Tooltip>);
    }
    if (distribution.state === RestDistributionState.Open) {
      buttons.push(<SuccessButton
        key="save-order"
        loading={loading}
        toggleSuccess={toggleSuccess}
        variant="contained"
        color="primary"
        disabled={!hasChanges || (catalog?.distribMinOrdersTotal ?? 0) > total}
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
      if (!defaultOrdersMode && catalog.distribMinOrdersTotal > total) {
        errors.push(<Typography key="error-total" color="error">{t('totalOrdersTooLow', { minOrderTotal: formatCurrency(catalog.distribMinOrdersTotal) })}</Typography>);
      }
      if (defaultOrdersMode && catalog.distribMinOrdersTotal > defaultOrderTotal) {
        errors.push(<Typography key="error-total" color="error">{t('totalOrdersTooLow', { minOrderTotal: formatCurrency(catalog.distribMinOrdersTotal) })}</Typography>);
      }
    }
  }

  return (
    <MobileContainer title={title}
      icon={isConstOrders ? CamapIconId.constOrders : CamapIconId.varOrders}
      actions={<>
        {restCsaCatalogTypeToType(catalog?.type ?? 0) === CatalogType.TYPE_VARORDER && mode === 'orders' && (
          <Button
            color="primary"
            variant="contained"
            value="default-order"
            onClick={() => setDefaultOrdersMode(!defaultOrdersMode)}
          >
            {defaultOrdersMode ? t('changeOrders') : t('defaultOrderBtn')}
          </Button>
        )}
      </>}>
      <CsaCatalogOrdersMobileHeader
        distribution={distribution}
        onPreviousDistribution={onPreviousDistribution}
        onNextDistribution={onNextDistribution}
        distributionIndex={distributionIndex}
        orders={orders}
        total={total}
        defaultOrderTotal={defaultOrderTotal}
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
        {errors.length > 0 && <Box>
          {errors}
        </Box>}
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
