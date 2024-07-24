import { ArrowBack, ArrowForward } from '@mui/icons-material';
import {
  Box,
  Button,
  ButtonBase,
  Divider,
  Modal,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { formatCurrency, StockTracking } from 'camap-common';
import React from 'react';
import Block from '../../../components/utils/Block/Block';
import { CamapIconId } from '../../../components/utils/CamapIcon';
import CircularProgressBox from '../../../components/utils/CircularProgressBox';
import Product from '../../../components/utils/Product/Product';
import ProductModal, {
  ProductInfos,
} from '../../../components/utils/Product/ProductModal';
import SuccessButton from '../../../components/utils/SuccessButton';
import {
  getSlideContainerSx,
  getSlideItemSx,
  SlideDirection,
} from '../../../components/utils/Transitions/slide';
import { CatalogType } from '../../../gql';
import theme from '../../../theme';
import { useCamapTranslation } from '../../../utils/hooks/use-camap-translation';
import { CsaCatalogContext } from '../CsaCatalog.context';
import CsaCatalogDistribution from '../components/CsaCatalogDistribution';
import { restCsaCatalogTypeToType, RestDistributionState } from '../interfaces';
import { useRestUpdateSubscriptionDefaultOrderPost } from '../requests';
import CsaCatalogDefaultOrder from './CsaCatalogDefaultOrder';
import CsaCatalogSubscriptionSold from './CsaCatalogSubscriptionSold';
import MediumActionIcon from './MediumActionIcon';

interface CsacatalogProps {
  adminMode?: boolean;
  onNext: () => Promise<boolean>;
}

const CsaCatalogOrders = ({ adminMode, onNext }: CsacatalogProps) => {
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

  const isUpLg = useMediaQuery(theme.breakpoints.up('lg'));
  const isUpMd = useMediaQuery(theme.breakpoints.up('md'));
  const isUpSm = useMediaQuery(theme.breakpoints.up('sm'));

  // override this, because we don't want to display default order if thre is no minimum order
  const displayDefaultOrder =
    adminMode && (catalog?.distribMinOrdersTotal || 0) > 0;

  let maxNbDistribToShow = 1;
  if (isUpSm && !isUpMd) {
    maxNbDistribToShow = 2;
  } else if (isUpMd && !isUpLg) {
    maxNbDistribToShow = 3;
  } else if (isUpLg) {
    maxNbDistribToShow = 4;
  }
  // hide 1 column distribution if displaying default order
  if (displayDefaultOrder) {
    maxNbDistribToShow -= 1;
  }

  const [firstDistributionIndex, setFirstDistributionIndex] = React.useState(0);

  const [
    updateSubscriptionDefaultOrder,
    { data: updatedSubscriptionData, error: updateError },
  ] = useRestUpdateSubscriptionDefaultOrderPost();

  // recalculate firstDistributionIndex when distributions or screen size changes
  React.useEffect(() => {
    let idx = nextDistributionIndex;
    if (nextDistributionIndex + maxNbDistribToShow > distributions.length) {
      idx = Math.max(0, distributions.length - maxNbDistribToShow);
    }
    setFirstDistributionIndex(idx);
  }, [distributions, maxNbDistribToShow, nextDistributionIndex]);

  React.useEffect(() => {
    setError(updateError);
  }, [setError, updateError]);

  React.useEffect(() => {
    if (!updatedSubscriptionData) return;
    setSubscription(updatedSubscriptionData);
  }, [setSubscription, updatedSubscriptionData]);

  const [isAnimating, setIsAnimating] = React.useState<SlideDirection>();

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
    const newOrders = { ...updatedOrders };
    if (!newOrders[distributionId]) {
      newOrders[distributionId] = {};
    }
    newOrders[distributionId][productId] = adaptedNewValue;
    setUpdatedOrders(newOrders);

    // Count "added orders" for global stock estimations
    // initialOrders is what we received from server
    // updatedOrders is the current user input
    // addedOrders keep track of the difference between initialOrders and current use input
    // Estimating the next stock according to current user input is then done by subtracting addedOrders from initialStock
    if (catalog != null && catalog.hasStockManagement && addedOrders != null) {
      let prevValue =
        updatedOrders[distributionId] != null &&
        updatedOrders[distributionId][productId] != null
          ? updatedOrders[distributionId][productId]
          : null;
      if (prevValue == null)
        prevValue =
          initialOrders[distributionId] != null &&
          initialOrders[distributionId][productId] != null
            ? initialOrders[distributionId][productId]
            : 0;
      var addedOrder = adaptedNewValue - prevValue;
      if (!addedOrders.hasOwnProperty(productId)) {
        addedOrders[productId] = 0;
      }
      addedOrders[productId] += addedOrder;
      setAddedOrders(addedOrders);

      newOrders[distributionId][productId] = adaptedNewValue;
      setUpdatedOrders(newOrders);
    }
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
    if (isAnimating) return;
    setIsAnimating('right');
    setTimeout(() => {
      setFirstDistributionIndex(firstDistributionIndex - 1);
      setIsAnimating(undefined);
    }, theme.transitions.duration.short);
  };
  const onNextDistribution = () => {
    if (isAnimating) return;
    setIsAnimating('left');
    setTimeout(() => {
      setFirstDistributionIndex(firstDistributionIndex + 1);
      setIsAnimating(undefined);
    }, theme.transitions.duration.short);
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.select();
  };

  const slicedDistributions = React.useMemo(() => {
    const start = firstDistributionIndex > 0 ? firstDistributionIndex - 1 : 0;
    const end =
      firstDistributionIndex + maxNbDistribToShow !== distributions.length
        ? firstDistributionIndex + maxNbDistribToShow + 1
        : firstDistributionIndex + maxNbDistribToShow;

    return distributions.slice(start, end);
  }, [distributions, firstDistributionIndex, maxNbDistribToShow]);

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
    <Box>
      <Block
        title={adminMode ? t('changeOrders') : t('changeMyOrders')}
        icon={<MediumActionIcon id={CamapIconId.basket} />}
        sx={{
          height: '100%',
        }}
        contentSx={{
          p: {
            xs: 1,
            sm: 2,
          },
        }}
      >
        {/* Sold and distributions row */}
        <Box display="flex" flexDirection={'row'}>
          {/* Sold box */}
          <Box
            width={{
              xs: 'calc(100% - 150px)',
              sm: 200,
            }}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <CsaCatalogSubscriptionSold />
          </Box>

          {/* Default order label */}
          {displayDefaultOrder && (
            <Box key="default" display="flex" alignSelf="center">
              <span>{t('defaultOrder')}</span>
            </Box>
          )}

          {/* Distributions box & arrow buttons */}
          <Box
            display="flex"
            flexDirection={'column'}
            flex={1}
            overflow="hidden"
          >
            {/* Distributions box */}
            <Box
              display="flex"
              justifyContent="space-evenly"
              flex={1}
              minWidth={150}
              position="relative"
              sx={getSlideContainerSx(maxNbDistribToShow, 150, isAnimating)}
            >
              {slicedDistributions.map((d) => (
                <Box
                  key={`distribution_${d.id}`}
                  sx={getSlideItemSx(
                    maxNbDistribToShow,
                    150,
                    firstDistributionIndex,
                    distributions.length,
                  )}
                >
                  <CsaCatalogDistribution distribution={d} />
                </Box>
              ))}
            </Box>

            {/* Arrow buttons */}
            <Box display={'flex'} justifyContent="space-evenly" mt={1}>
              <Button
                variant="outlined"
                size="small"
                onClick={onPreviousDistribution}
                sx={{ minWidth: 'auto', width: 150 }}
                disabled={firstDistributionIndex === 0}
              >
                <ArrowBack />
              </Button>

              {/* Display as much <Box> thant space to display*/}
              {/* This part is a bit tricky to understand but globally, we want add
								box when we have less than maxNbDistribToShow distributions
								and we have more than 2 distributions to display.
								We using a array to use this length and generate the <Box> to display
							 */}
              {Array.from(
                Array(
                  Math.max(
                    0,
                    Math.min(maxNbDistribToShow, slicedDistributions.length) -
                      2,
                  ),
                ).keys(),
              ).map((i) => (
                <Box key={`box_${i}`} width={150} />
              ))}

              <Button
                variant="outlined"
                size="small"
                onClick={onNextDistribution}
                sx={{ minWidth: 'auto', width: 150 }}
                disabled={
                  firstDistributionIndex + maxNbDistribToShow >=
                  distributions.length
                }
              >
                <ArrowForward />
              </Button>
            </Box>
          </Box>
        </Box>
        <Box my={2}>
          {/* Product line */}
          {catalog.products.map((p) => {
            const isGlobalStock =
              catalog.hasStockManagement &&
              (p.stockTracking as StockTracking) == StockTracking.Global &&
              stocksPerProductDistribution != null;
            var globalStock = 0;
            if (
              isGlobalStock &&
              stocksPerProductDistribution[p.id] != null &&
              addedOrders != null
            ) {
              globalStock = Object.values(
                stocksPerProductDistribution[p.id],
              ).reduce((acc, v) => Math.min(acc, v), Number.MAX_VALUE);
              globalStock -= addedOrders.hasOwnProperty(p.id)
                ? addedOrders[p.id]
                : 0;
            }

            return (
              <Box key={`product_${p.id}`}>
                <Divider sx={{ my: 1 }} />
                <Box display="flex" flexDirection={'row'} mb={1}>
                  <ButtonBase
                    sx={{
                      width: {
                        xs: 'calc(100% - 150px)',
                        sm: 200,
                      },
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      textAlign: 'left',
                    }}
                    onClick={() => setModalProduct(p)}
                  >
                    <Product product={p} />
                    {isGlobalStock && (
                      <Typography
                        align="center"
                        color="grey"
                        fontSize="0.8em"
                        position="absolute"
                        top={28}
                        right={-54}
                        whiteSpace="nowrap"
                      >
                        <Tooltip
                          title={`${t('Available')} (global): ${globalStock}`}
                        >
                          <span>
                            <i
                              className="icon icon-wholesale"
                              style={{ fontSize: '0.9em' }}
                            />{' '}
                            {globalStock}
                          </span>
                        </Tooltip>
                      </Typography>
                    )}
                  </ButtonBase>

                  {displayDefaultOrder && (
                    <Box key="order_default">
                      <TextField
                        sx={{ width: 150 }}
                        value={
                          subscription?.defaultOrder.find(
                            (d) => d.productId === p.id,
                          )?.quantity || 0
                        }
                        disabled
                        hiddenLabel
                      />
                    </Box>
                  )}

                  <Box display="flex" flex={1} overflow="hidden">
                    <Box
                      display="flex"
                      justifyContent="space-evenly"
                      flex={1}
                      alignItems="center"
                      sx={getSlideContainerSx(
                        maxNbDistribToShow,
                        150,
                        isAnimating,
                      )}
                    >
                      {slicedDistributions.map((d) => {
                        const distributionStock = getStockValue(
                          isGlobalStock,
                          p,
                          d,
                        );

                        return (
                          <Box
                            position="relative"
                            key={`order_${d.id}_${p.id}`}
                            sx={getSlideItemSx(
                              maxNbDistribToShow,
                              150,
                              firstDistributionIndex,
                              distributions.length,
                            )}
                          >
                            {d.state !== RestDistributionState.Absent ? (
                              <>
                                <TextField
                                  disabled={
                                    (d.state !== RestDistributionState.Open &&
                                      !adminMode) ||
                                    loading ||
                                    d.distributionStartDate < new Date()
                                  }
                                  sx={{ width: 150 }}
                                  inputProps={{
                                    inputMode: 'numeric',
                                    pattern: '[0-9]*',
                                  }}
                                  value={orders[d.id][p.id]}
                                  onChange={(
                                    event: React.ChangeEvent<HTMLInputElement>,
                                  ) =>
                                    onOrderChange(
                                      d.id,
                                      p.id,
                                      parseInt(event.target.value, 10),
                                    )
                                  }
                                  onFocus={onFocus}
                                  hiddenLabel
                                />
                                {distributionStock != null && (
                                  <Typography
                                    align="center"
                                    color="grey"
                                    fontSize="0.8em"
                                    position="absolute"
                                    bottom={2}
                                    right={5}
                                    whiteSpace="nowrap"
                                  >
                                    <Tooltip
                                      title={`${t(
                                        'Available',
                                      )}: ${distributionStock}`}
                                    >
                                      <span>
                                        <i
                                          className="icon icon-wholesale"
                                          style={{ fontSize: '0.9em' }}
                                        />
                                        &nbsp;{distributionStock}
                                      </span>
                                    </Tooltip>
                                  </Typography>
                                )}
                              </>
                            ) : (
                              <Box width={150} minHeight={56} />
                            )}
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                </Box>
              </Box>
            );
          })}
          <ProductModal product={modalProduct} onClose={onProductModalClose} />
        </Box>
        {/* Total row */}
        <Box
          sx={{
            backgroundColor: (theme) => theme.palette.action.selected,
          }}
          width="100%"
          display="flex"
          flexDirection={'row'}
          py={1}
          mb={2}
        >
          <Box
            width={{
              xs: 'calc(100% - 150px)',
              sm: 200,
            }}
            display="flex"
            flexDirection={'row'}
            alignItems="center"
            justifyContent={'flex-end'}
          >
            <Typography>{t('total')} : </Typography>
          </Box>
          {displayDefaultOrder && (
            <Typography
              key="total_default"
              sx={{
                width: 150,
                textAlign: 'center',
                color: (theme) => 'initial',
              }}
            >
              <b>{getTotalFromDefaultOrder()}</b>
            </Typography>
          )}
          <Box overflow="hidden" display="flex" flex={1}>
            <Box
              display="flex"
              flexDirection={'row'}
              justifyContent="space-evenly"
              flex={1}
              sx={getSlideContainerSx(maxNbDistribToShow, 150, isAnimating)}
            >
              {slicedDistributions.map((d) => (
                <Typography
                  key={`total_${d.id}`}
                  sx={{
                    width: 150,
                    textAlign: 'center',
                    color: (theme) =>
                      d.state === RestDistributionState.Open ||
                      (adminMode && d.distributionStartDate > new Date())
                        ? 'initial'
                        : theme.palette.action.disabled,
                    ...getSlideItemSx(
                      maxNbDistribToShow,
                      150,
                      firstDistributionIndex,
                      distributions.length,
                    ),
                  }}
                >
                  {d.state !== RestDistributionState.Absent && (
                    <b>{getTotalFromDistribution(d.id)}</b>
                  )}
                </Typography>
              ))}
            </Box>
          </Box>
        </Box>
        {/* Buttons */}
        <Box
          width="100%"
          textAlign="end"
          display={{ xs: 'flex', sm: 'block' }}
          flexDirection="column"
          mt={1}
        >
          {(restCsaCatalogTypeToType(catalog.type) ===
            CatalogType.TYPE_CONSTORDERS ||
            catalog?.distribMinOrdersTotal > 0 ||
            displayDefaultOrder) && (
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
        onBackdropClick={() => handleDefaultOrders(true)}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: 600,
          }}
        >
          <CsaCatalogDefaultOrder onNext={handleDefaultOrders} />
        </Box>
      </Modal>
    </Box>
  );
};

export default CsaCatalogOrders;
