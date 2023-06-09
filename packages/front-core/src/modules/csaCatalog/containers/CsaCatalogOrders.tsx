import { ArrowBack, ArrowForward } from '@mui/icons-material';
import {
  Box,
  Button,
  ButtonBase,
  Divider,
  Modal,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { formatCurrency } from 'camap-common';
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
import CsaCatalogDistribution from '../components/CsaCatalogDistribution';
import { CsaCatalogContext } from '../CsaCatalog.context';
import { restCsaCatalogTypeToType, RestDistributionState } from '../interfaces';
import { useRestUpdateSubscriptionDefaultOrderPost } from '../requests';
import CsaCatalogDefaultOrder from './CsaCatalogDefaultOrder';
import CsaCatalogSubscriptionSold from './CsaCatalogSubscriptionSold';
import MediumActionIcon from './MediumActionIcon';

interface CsacatalogProps {
  onNext: () => Promise<boolean>;
}

const CsaCatalogOrders = ({ onNext }: CsacatalogProps) => {
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
  } = React.useContext(CsaCatalogContext);

  const [toggleSuccess, setToggleSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

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

  const [maxNbDistribToShow, setMaxNbDistribToShow] = React.useState(1);

  const [firstDistributionIndex, setFirstDistributionIndex] = React.useState(0);

  React.useEffect(() => {
    if (nextDistributionIndex + maxNbDistribToShow > distributions.length) {
      const adaptedIndex = distributions.length - maxNbDistribToShow;

      setFirstDistributionIndex(adaptedIndex >= 0 ? adaptedIndex : 0);
    }
    setFirstDistributionIndex(nextDistributionIndex);
  }, [distributions.length, maxNbDistribToShow, nextDistributionIndex]);

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

  const orders = React.useMemo(() => {
    if (!catalog) return {};

    const os = initialOrders;
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

  const isUpLg = useMediaQuery(theme.breakpoints.up('lg'));
  const isUpMd = useMediaQuery(theme.breakpoints.up('md'));
  const isUpSm = useMediaQuery(theme.breakpoints.up('sm'));

  React.useEffect(() => {
    if (isUpSm && !isUpMd) {
      setMaxNbDistribToShow(2);
    } else if (isUpMd && !isUpLg) {
      setMaxNbDistribToShow(3);
    } else if (isUpLg) {
      setMaxNbDistribToShow(4);
    } else {
      setMaxNbDistribToShow(1);
    }
  }, [isUpSm, isUpMd, isUpLg]);

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

  const slicedDistributions = React.useMemo(
    () =>
      distributions.slice(
        firstDistributionIndex > 0 ? firstDistributionIndex - 1 : 0,
        firstDistributionIndex + maxNbDistribToShow !== distributions.length
          ? firstDistributionIndex + maxNbDistribToShow + 1
          : firstDistributionIndex + maxNbDistribToShow,
      ),
    [distributions, firstDistributionIndex, maxNbDistribToShow],
  );

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

  return (
    <Box>
      <Block
        title={t('changeMyOrders')}
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
        <Box display="flex" flexDirection={'row'}>
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
          <Box
            display="flex"
            flexDirection={'column'}
            flex={1}
            overflow="hidden"
          >
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
              {maxNbDistribToShow >= 3 && <Box width={150} />}
              {maxNbDistribToShow >= 4 && <Box width={150} />}
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
          {catalog.products.map((p) => (
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
                </ButtonBase>

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
                    {slicedDistributions.map((d) => (
                      <Box
                        key={`order_${d.id}_${p.id}`}
                        sx={getSlideItemSx(
                          maxNbDistribToShow,
                          150,
                          firstDistributionIndex,
                          distributions.length,
                        )}
                      >
                        {d.state !== RestDistributionState.Absent ? (
                          <TextField
                            disabled={
                              d.state !== RestDistributionState.Open || loading
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
                        ) : (
                          <Box width={150} minHeight={56} />
                        )}
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
          <ProductModal product={modalProduct} onClose={onProductModalClose} />
        </Box>

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
                      d.state === RestDistributionState.Open
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

        <Box
          width="100%"
          textAlign="end"
          display={{ xs: 'flex', sm: 'block' }}
          flexDirection="column"
          mt={1}
        >
          {(restCsaCatalogTypeToType(catalog.type) ===
            CatalogType.TYPE_CONSTORDERS ||
            catalog?.distribMinOrdersTotal > 0) && (
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
