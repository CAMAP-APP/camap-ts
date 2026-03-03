import {
  Box,
  Button,
  ToggleButton,
  Tooltip,
  Typography
} from '@mui/material';
import React, { useCallback, useEffect } from 'react';
import Block from '../../../components/utils/Block/Block';
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
import { CsaCatalogOrdersMobileHeader } from './CsaCatalogOrdersMobileHeader';
import CsaCatalogOrdersMobileProduct from './CsaCatalogOrdersMobileProduct';
import MediumActionIcon from './MediumActionIcon';

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
    updatedOrders,
    setUpdatedOrders,
    catalog,
    subscription,
    distributions,
    nextDistributionIndex,
    setSubscription,
    defaultOrder,
    setError,
    addedOrders,
    setAddedOrders,
    initialOrders,
    setDefaultOrder,
    remainingDistributions,
  } = React.useContext(CsaCatalogContext);

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
    let prevValue = updatedOrders[distributionId]
      ? updatedOrders[distributionId][productId]
      : null;

    const newOrders = { ...updatedOrders };
    if (!newOrders[distributionId]) {
      newOrders[distributionId] = {};
    }
    newOrders[distributionId][productId] = adaptedNewValue;

    // Count "added orders" for global stock estimations
    // initialOrders is what we received from server
    // updatedOrders is the current user input
    // addedOrders keep track of the difference between initialOrders and current use input
    // Estimating the next stock according to current user input is then done by subtracting addedOrders from initialStock
    if (catalog != null && catalog.hasStockManagement && addedOrders != null) {
      let initialValue =
        initialOrders[distributionId] != null &&
          initialOrders[distributionId][productId] != null
          ? initialOrders[distributionId][productId]
          : 0;
      if (prevValue == null) {
        prevValue = initialValue;
      }

      var addedOrder = adaptedNewValue - prevValue;
      if (!addedOrders.hasOwnProperty(productId)) {
        addedOrders[productId] = 0;
      }
      addedOrders[productId] += addedOrder;
      setAddedOrders(addedOrders);

      newOrders[distributionId][productId] = adaptedNewValue;
    }
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

  useUnsavedChangesPrompt({
    when: hasChanges,
    message: t('unsavedOrdersConfirmLeave'),
  });

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

  const [defaultOrdersMode, setDefaultOrdersMode] =
    React.useState(mode === 'defaultOrder');

  const onDefaultOrderChange = (productId: number, quantity: number) => {
    const newDefaultOrder = { ...defaultOrder };
    newDefaultOrder[productId] = quantity;
    setDefaultOrder(newDefaultOrder);
  };

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
    const upd = { ...updatedOrders };
    const added = { ...addedOrders };

    if (!upd[distribution.id]) {
      upd[distribution.id] = {};
    }
    catalog?.products.forEach(p => {
      upd[distribution.id][p.id] = 0;
      added[p.id] = (added[p.id] ?? 0) - (initialOrders[distribution.id][p.id] ?? 0);
    })

    setUpdatedOrders(upd);
    setAddedOrders(added);
    void onNext();
  }, [distribution.id, catalog?.products, addedOrders, updatedOrders, initialOrders, setUpdatedOrders, setAddedOrders, onNext]);

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

  const title = defaultOrdersMode ? t('defaultOrder') : (adminMode ? t('changeOrders') : t('changeMyOrders'));

  const buttons = [];
  if (defaultOrdersMode) {
    buttons.push(<Button
      key="update-default-order"
      variant="contained"
      onClick={async () => {
        await updateDefaultOrders();
        if (mode === 'defaultOrder') {
          void onNext();
        }
      }}
    >
      {t('setAsDefaultOrderBtn')}
    </Button>)
  } else if (distribution.state !== RestDistributionState.Absent) {
    if (distribution.state === RestDistributionState.Open && hasProductOrder(distribution.id)) {
      buttons.push(<Button
        key="cancel-order"
        variant="outlined"
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
        disabled={!hasChanges}
        onClick={onSaveClick}
      >
        {tCommon('save')}
      </SuccessButton>
      );
    }
  }

  return (
    <MobileContainer title={title} actions={<>
      {restCsaCatalogTypeToType(catalog?.type ?? 0) === CatalogType.TYPE_VARORDER && mode === 'orders' && (
        <ToggleButton
          value="default-order"
          onClick={() => setDefaultOrdersMode(!defaultOrdersMode)}
          selected={defaultOrdersMode}
        >
          {defaultOrdersMode ? t('changeOrders') : t('defaultOrder')}
        </ToggleButton>
      )}
    </>}>
      <CsaCatalogOrdersMobileHeader
        distribution={distribution}
        onPreviousDistribution={onPreviousDistribution}
        onNextDistribution={onNextDistribution}
        distributionIndex={distributionIndex}
        orders={orders}
        defaultOrdersMode={defaultOrdersMode} />

      {!defaultOrdersMode && distribution.state === RestDistributionState.Absent
        ? <>
          <Box display='flex' justifyContent='center' my={4}>
            <Typography variant='h5'>{t("absent")}</Typography>
            <CamapIcon id={CamapIconId.vacation} />
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
        {buttons}
      </Box>
    </MobileContainer>
  );
};

const MobileContainer = ({
  children,
  title,
  actions
}: {
  children: React.ReactNode,
  title: string
  actions: React.ReactNode
}) => {
  return <Block
    title={title}
    icon={<MediumActionIcon id={CamapIconId.basket} />}
    sx={{
      height: '100%',
      overflow: 'clip'
    }}
    contentSx={{
      p: {
        xs: 0,
        sm: 2,
      },
    }}
    headerAction={actions}
  >
    {children}
  </Block>
};

export default CsaCatalogOrdersMobile;
