import { ArrowBack, ArrowForward } from '@mui/icons-material';
import {
  Box,
  Button,
  Modal,
  Theme,
  Typography
} from '@mui/material';
import { formatAbsoluteDate } from '@utils/fomat';
import { formatCurrency } from 'camap-common';
import React, { useEffect } from 'react';
import Block from '../../../components/utils/Block/Block';
import CamapIcon, { CamapIconId } from '../../../components/utils/CamapIcon';
import CircularProgressBox from '../../../components/utils/CircularProgressBox';
import ProductModal, {
  ProductInfos,
} from '../../../components/utils/Product/ProductModal';
import SuccessButton from '../../../components/utils/SuccessButton';
import { CatalogType } from '../../../gql';
import { useCamapTranslation } from '../../../utils/hooks/use-camap-translation';
import { CsaCatalogContext } from '../CsaCatalog.context';
import { colorForDistributionState } from '../components/CsaCatalogDistribution';
import { restCsaCatalogTypeToType } from '../interfaces';
import { useRestUpdateSubscriptionDefaultOrderPost } from '../requests';
import CsaCatalogDefaultOrder from './CsaCatalogDefaultOrder';
import CsaCatalogOrdersMobileProduct from './CsaCatalogOrdersMobileProduct';
import MediumActionIcon from './MediumActionIcon';

interface CsacatalogProps {
  adminMode?: boolean;
  onNext: () => Promise<boolean>;
}

const CsaCatalogOrdersMobile = ({ adminMode, onNext }: CsacatalogProps) => {
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
    stocksPerProductDistribution,
  } = React.useContext(CsaCatalogContext);

  const [toggleSuccess, setToggleSuccess] = React.useState(false);
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

  const initialOrders = React.useMemo(() => {
    if (!catalog || !subscription) return {};

    let initialOrders = subscription.distributions.reduce((acc, d) => {
      acc[d.id] = d.orders.reduce((acc2, o) => {
        acc2[o.productId] = o.qty;
        return acc2;
      }, {} as Record<number, number>);
      return acc;
    }, {} as Record<number, Record<number, number>>);

    // Check all other products to 0
    Object.keys(initialOrders).forEach((distributionIdString) => {
      const distributionId = parseInt(distributionIdString, 10);
      initialOrders[distributionId] = catalog.products.reduce((acc, p) => {
        if (initialOrders[distributionId][p.id]) {
          acc[p.id] = initialOrders[distributionId][p.id];
        } else {
          acc[p.id] = 0;
        }
        return acc;
      }, {} as Record<number, number>);
    });

    return initialOrders;
  }, [catalog, subscription]);

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

  const getTotalFromDistribution = React.useCallback(
    (distributionId: number) => {
      if (!orders) return 0;

      return formatCurrency(
        Object.keys(orders[distributionId]).reduce((acc, pid) => {
          const product = catalog?.products.find(
            (p) => p.id === parseInt(pid, 10),
          );
          if (!product) return acc;
          const quantity = orders[distributionId][parseInt(pid, 10)];
          acc += quantity * product.price;
          return acc;
        }, 0),
      );
    },
    [catalog?.products, orders],
  );

  function getTotalFromDefaultOrder() {
    if (!subscription) return 0;
    return formatCurrency(
      subscription.defaultOrder.reduce((acc, d) => {
        const product: { price: number } | undefined = catalog?.products.find(
          (p) => p.id === d.productId,
        );
        if (!product) return acc;
        return acc + d.quantity * product.price;
      }, 0),
    );
  }

  const onPreviousDistribution = () => {
    setDistributionIndex(Math.max(distributionIndex - 1, 0));
  };
  const onNextDistribution = () => {
    setDistributionIndex(Math.min(distributionIndex + 1, distributions.length - 1));
  };

  const distribution = (distributionIndex < 0)
    ? distributions[0]
    : distributionIndex >= distributions.length
        ? distributions[distributions.length-1]
        : distributions[distributionIndex];

  const [defaultOrdersModalOpen, setDefaultOrdersModalOpen] =
    React.useState(false);

  const onDefaultOrdersChangeClick = () => {
    setDefaultOrdersModalOpen(true);
  };

  const onCloseDefaultOrdersModal = () => {
    setDefaultOrdersModalOpen(false);
  };

  const handleDefaultOrders = async (canceled?: boolean) => {
    if (!subscription) return;
    if (!canceled) {
      await updateSubscriptionDefaultOrder(
        Object.keys(defaultOrder).map((productId) => ({
          productId: parseInt(productId, 10),
          quantity: defaultOrder[parseInt(productId, 10)],
        })),
        `${subscription.id}`,
      );
    }
    onCloseDefaultOrdersModal();
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const onCancelOrder = async () => {
    const newOrders = { ...updatedOrders };
    
    newOrders[distribution.id] = catalog?.products
      .reduce((o, p) => ({...o, [p.id]:0}), {}) ?? {};
    
    // TODO manage stocks

    setUpdatedOrders(newOrders);
    await onNext();
  };

  const [modalProduct, setModalProduct] = React.useState<ProductInfos>();

  const onProductModalClose = () => {
    setModalProduct(undefined);
  };

  if (!catalog || !distributions || !Object.keys(orders).length) {
    return <CircularProgressBox />;
  }

  function getStockValue(
    isGlobalStock: boolean,
    p: { id: number },
    d: { id: number },
  ) {
    const isDistributionStock =
      catalog != null &&
      catalog.hasStockManagement &&
      !isGlobalStock &&
      stocksPerProductDistribution != null &&
      stocksPerProductDistribution[p.id] != null &&
      stocksPerProductDistribution[p.id][d.id] != null;
    let distributionStock = null;
    if (isDistributionStock) {
      distributionStock = stocksPerProductDistribution[p.id][d.id];
      var initialOrder: number =
        initialOrders[d.id] != null && initialOrders[d.id][p.id] != null
          ? initialOrders[d.id][p.id]
          : 0;
      var updatedOrder: number =
        updatedOrders[d.id] != null && updatedOrders[d.id][p.id] != null
          ? updatedOrders[d.id][p.id]
          : initialOrder;
      var added = updatedOrder - initialOrder;
      distributionStock -= added;
    }
    return distributionStock;
  }

  return (
    <Box
        sx={{
            mx: {
                xs: 0,
                sm: 1
            }
        }}
    >
      <Block
        title={adminMode ? t('changeOrders') : t('changeMyOrders')}
        icon={<MediumActionIcon id={CamapIconId.basket} />}
        sx={{
          height: '100%',
        }}
        contentSx={{
          p: {
            xs: 0,
            sm: 2,
          },
        }}
      >
        <Box>

          {/* Default order label */}
          {/* {displayDefaultOrder && (
            <Box key="default" display="flex" alignSelf="center">
              <span>{t('defaultOrder')}</span>
            </Box>
          )} */}

          {/* Distributions box & arrow buttons */}
          <Box
            display="flex"
            overflow="hidden"
          >
            {/* Arrow Prev */}
            <Button
              variant="outlined"
              size="small"
              onClick={onPreviousDistribution}
              disabled={distributionIndex === 0}
            >
              <ArrowBack />
            </Button>
            
            {/* Distributions box */}
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-evenly"
              flex={1}
              position="relative"
              sx={{
                ...colorForDistributionState(distribution)
              }}
            >
                <Typography
                    textAlign="center"
                    fontWeight="bold"
                >
                    {formatAbsoluteDate(
                        distribution.distributionStartDate,
                        false,
                        true,
                        true,
                    )}
                </Typography>
            </Box>

            {/* Arrow Next */}
            <Button
                variant="outlined"
                size="small"
                onClick={onNextDistribution}
                disabled={
                  distributionIndex >= distributions.length
                }
              >
                <ArrowForward />
              </Button>
          </Box>
        </Box>

        
        <Box
            display="flex"
            gap={1}
            fontSize={{ xs: 14, sm: 16 }}
            justifyContent='space-between'
            mx={1}
            mb={1}
            >
            {/* Sold box */}
            <Box display="flex" alignItems="center" gap={1}>
                <Box>
                    <Typography
                        fontSize="inherit"
                        fontWeight="bold"
                        lineHeight="1em"
                    >{t('paymentSold')}</Typography>
                </Box>
                {subscription !== undefined && <Box
                    sx={{
                        backgroundColor: (theme: Theme) =>
                            subscription.balance >= 0
                            ? theme.palette.success.main
                            : theme.palette.error.main,
                    }}
                    p={1}
                >
                    <Typography
                        fontSize="inherit"
                        fontWeight="bold"
                        sx={{
                            color: (theme) =>
                            subscription.balance >= 0
                                ? theme.palette.success.contrastText
                                : theme.palette.error.contrastText,
                            textAlign: 'center',
                        }}
                    >
                        {formatCurrency(subscription.balance)}
                    </Typography>
                </Box>}
            </Box>
            {/* Total */}
            <Box
                display="flex"
                gap={1}
                alignItems="center"
            >
                <Typography
                    fontSize="inherit"
                    fontWeight="bold"
                    lineHeight="1em"
                >{t('orderValue')}</Typography>
                <CamapIcon id={CamapIconId.basket} sx={{
                        color: 'primary.main'
                    }}/>
                <Typography
                    fontSize="1.2em"
                    fontWeight="bold"
                    sx={{
                        color: 'primary.main'
                    }}
                >{getTotalFromDistribution(distribution.id)}</Typography>
            </Box>
        </Box>

        {/* Products */}
        <Box display="flex" flexWrap='wrap' gap={1} justifyContent={'center'}>
          {catalog.products.map(
            (p) => 
                <CsaCatalogOrdersMobileProduct
                    product={p}
                    orderedQuantity={orders[distribution.id][p.id]}
                    onClick={() => setModalProduct(p)}
                    onQuantityChange={(q) => onOrderChange(
                        distribution.id,
                        p.id,
                        q
                    )}
                />
          )}
          <ProductModal product={modalProduct} onClose={onProductModalClose} />
        </Box>

        {/* Buttons */}
        <Box
          width="100%"
          textAlign="end"
          display={{ xs: 'flex', sm: 'block' }}
          flexDirection="column"
          mt={2}
        >
          {/* <Button
            variant="outlined"
            onClick={onCancelOrder}
            sx={{ mr: { xs: 0, sm: 2 }, mb: { xs: 1, sm: 0 } }}
          >
            {t('cancelOrder')}
          </Button> */}
          {(restCsaCatalogTypeToType(catalog.type) === CatalogType.TYPE_CONSTORDERS
            || catalog?.distribMinOrdersTotal > 0) && (
            <Button
              variant="outlined"
              onClick={onDefaultOrdersChangeClick}
              sx={{ mr: { xs: 0, sm: 2 }, mb: { xs: 1, sm: 0 } }}
            >
              {t('defaultOrder')}
            </Button>
          )}
          <SuccessButton
            loading={loading}
            toggleSuccess={toggleSuccess}
            variant="contained"
            color="primary"
            onClick={onSaveClick}
          >
            {tCommon('save')}
          </SuccessButton>
        </Box>
      </Block>
      <Modal
        open={defaultOrdersModalOpen}
        onClose={() => handleDefaultOrders(true)}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: 600,
            width: {
                xs: '96%',
                sm: '600px'
            }
          }}
        >
          <CsaCatalogDefaultOrder onNext={handleDefaultOrders} />
        </Box>
      </Modal>
    </Box>
  );
};

export default CsaCatalogOrdersMobile;
