import { LoadingButton } from '@mui/lab';
import { Box, ButtonBase, InputAdornment, TextField, Tooltip, Typography } from '@mui/material';
import { StockTracking } from 'camap-common';
import React from 'react';
import Block from '../../../components/utils/Block/Block';
import { CamapIconId } from '../../../components/utils/CamapIcon';
import CircularProgressBox from '../../../components/utils/CircularProgressBox';
import Product from '../../../components/utils/Product/Product';
import ProductModal, {
  ProductInfos,
} from '../../../components/utils/Product/ProductModal';
import SuccessButton from '../../../components/utils/SuccessButton';
import { CatalogType } from '../../../gql';
import { useCamapTranslation } from '../../../utils/hooks/use-camap-translation';
import { CsaCatalogContext } from '../CsaCatalog.context';
import { restCsaCatalogTypeToType } from '../interfaces';
import MediumActionIcon from './MediumActionIcon';
import { formatUnit } from '@utils/fomat';

interface CsaCatalogDefaultOrderProps {
  onNext: (canceled?: boolean) => Promise<boolean | void>;
}

const CsaCatalogDefaultOrder = ({ onNext }: CsaCatalogDefaultOrderProps) => {
  const { t, tCommon } = useCamapTranslation(
    {
      t: 'csa-catalog',
    },
    true,
  );

  const {
    catalog,
    subscription,
    defaultOrder,
    setDefaultOrder,
    addedOrders,
    setAddedOrders,
    stocksPerProductDistribution,
  } = React.useContext(CsaCatalogContext);

  const [toggleSuccess, setToggleSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const isConstOrders = React.useMemo(() => {
    if (!catalog) return;
    return (
      restCsaCatalogTypeToType(catalog.type) === CatalogType.TYPE_CONSTORDERS
    );
  }, [catalog]);

  React.useEffect(() => {
    if (!subscription) return;
    if (isConstOrders) {
      setDefaultOrder(
        subscription.distributions[0].orders.reduce((acc, d) => {
          acc[d.productId] = d.qty;
          return acc;
        }, {} as Record<number, number>),
      );
    } else {
      setDefaultOrder(
        subscription.defaultOrder.reduce((acc, d) => {
          acc[d.productId] = d.quantity;
          return acc;
        }, {} as Record<number, number>),
      );
    }
  }, [isConstOrders, setDefaultOrder, subscription]);

  React.useEffect(() => {
    if (!catalog) return;
    if (!!subscription) return;
    setDefaultOrder(
      catalog.products.reduce((acc, p) => {
        acc[p.id] = 0;
        return acc;
      }, {} as Record<number, number>),
    );
  }, [catalog, setDefaultOrder, subscription]);

  const onSaveClick = async () => {
    setLoading(true);
    const success = await onNext(false);
    if (isConstOrders && success) {
      setToggleSuccess(true);
      setTimeout(() => {
        setToggleSuccess(false);
      }, 2000);
    }
    setLoading(false);
  };

  const onCancelClick = async () => {
    onNext(true);
  };

  const onOrderChange = (productId: number, newValue: number) => {
    if (addedOrders != null &&!addedOrders.hasOwnProperty(productId)) {
      addedOrders[productId] = defaultOrder[productId];
      setAddedOrders(addedOrders);
    }
    let adaptedNewValue = newValue;
    if (isNaN(newValue)) adaptedNewValue = 0;
    if (defaultOrder && defaultOrder[productId] === adaptedNewValue) return;
    const newDefaultOrder = { ...defaultOrder };
    newDefaultOrder[productId] = adaptedNewValue;
    setDefaultOrder(newDefaultOrder);
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.select();
  };

  const [modalProduct, setModalProduct] = React.useState<ProductInfos>();

  const onProductModalClose = () => {
    setModalProduct(undefined);
  };

  if (!catalog) return <CircularProgressBox />;

  return (
    <Block
      title={t(isConstOrders ? 'subscription' : 'enterYourDefaultOrder')}
      icon={<MediumActionIcon id={CamapIconId.basket} />}
      sx={{
        height: '100%',
        width: '100%'
      }}
      contentSx={{
        maxHeight: 'calc(100vh - 132px)',
        overflowY: 'auto',
      }}
    >
      <Typography
        sx={{
          whiteSpace: 'pre-wrap',
          textAlign: isConstOrders ? 'left' : 'center',
        }}
      >
        {t(
          isConstOrders
            ? 'defaultOrderInfosConstOrder'
            : 'defaultOrderInfosVarOrder',
        )}
      </Typography>

      <Box width="100%" my={2}>
        {catalog.products.map((p) => {
          let lowestStock:number | null = null;
          const hasStockTracking = p.stockTracking != null
            && p.stockTracking !== StockTracking.Disabled
            && stocksPerProductDistribution != null
            && stocksPerProductDistribution.hasOwnProperty(p.id)

          const isGlobalStockTracking = hasStockTracking && p.stockTracking === StockTracking.Global
          let distribCount = 1;
          if (hasStockTracking) {
            const stocksPerDistrib = stocksPerProductDistribution[p.id];
            const now = new Date();
            distribCount = catalog.distributions.filter(d => now <= new Date(d.distributionStartDate)).length
            if (subscription != null) distribCount -= subscription.absentDistribIds.length
            if (stocksPerDistrib != null) {
              const allStocks = Object.values(stocksPerDistrib);
              lowestStock = allStocks.length <= 0 ? 0 : Math.round(allStocks.reduce((acc, v) => Math.min(acc, v), Number.MAX_VALUE));
              var liveDiff = addedOrders != null && addedOrders.hasOwnProperty(p.id) ? (defaultOrder[p.id] ?? 0) - (addedOrders[p.id] ?? 0) : 0;
              lowestStock -= liveDiff * (isGlobalStockTracking ? distribCount : 1);
            }
          }

          const q = defaultOrder[p.id] ?? 0;

          return (
            <Box
              key={`product_${p.id}`}
              width="100%"
              display="flex"
              flexDirection={'row'}
              flexWrap={'wrap'}
              alignItems="center"
              justifyContent={'space-between'}
              mb={1}
              gap={1}
            >
              <ButtonBase
                onClick={() => setModalProduct(p)}
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  textAlign: 'left',
                  justifyContent: 'start',
                  flex: 1,
                  borderRadius: 1,
                  minWidth: 250
                }}
              >
                <Product product={p} />
                {catalog.hasStockManagement && isGlobalStockTracking && lowestStock != null && (
                  <Typography align="center" color="grey" fontSize="0.8em" position="absolute" top={22} right={0} whiteSpace="nowrap">
                    <Tooltip title={<><div>{t('Available')} (global): {lowestStock}</div><div>×{distribCount}&nbsp;distributions</div></>}>
                      <span><i className="icon icon-wholesale" style={{fontSize: '0.9em'}}/> {lowestStock}</span>
                    </Tooltip>
                  </Typography>
                )}
              </ButtonBase>
              <Box
                width={100}
                position="relative"
                justifySelf='flex-end'
                justifyContent='flex-end'
              >
                <TextField
                  size="small"
                  fullWidth
                  inputProps={{
                    type: 'number',
                    style: {
                        textAlign: 'right'
                    }
                  }}
                  InputProps={{
                    endAdornment: p.bulk
                        ? <InputAdornment
                            position="end"
                        >
                            {formatUnit(p.unitType, 1, t)}
                            </InputAdornment>
                        : undefined
                  }}
                  defaultValue={
                    p.bulk
                    ? q*p.qt
                    : q
                  }
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    onOrderChange(p.id,
                      p.bulk
                      ? parseFloat(event.target.value)/p.qt
                      : parseInt(event.target.value, 10)
                    )
                  }
                  onBlur={(event: React.FocusEvent<HTMLInputElement>) =>
                    event.target.value = (
                      p.bulk
                      ? q*p.qt
                      : q
                    ).toString()
                  }
                  hiddenLabel
                  disabled={loading}
                />
                {catalog.hasStockManagement && !isGlobalStockTracking && lowestStock != null && (
                  <Typography align="center" color="grey" fontSize="0.8em" position="absolute" bottom={2} right={5} whiteSpace="nowrap">
                    <Tooltip title={`${t('Available')}: ${lowestStock}`}>
                      <span><i className="icon icon-wholesale" style={{fontSize: '0.9em'}}/> {lowestStock}</span>
                    </Tooltip>
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })}
        <ProductModal product={modalProduct} onClose={onProductModalClose} />
      </Box>

      <Box
        width="100%"
        display="flex"
        justifyContent={isConstOrders ? 'right' : 'center'}
        mt={1}
      >
        {!!subscription && !isConstOrders && (
          <LoadingButton
            loading={loading}
            variant="outlined"
            onClick={onCancelClick}
            sx={{ mr: 2 }}
          >
            {tCommon('cancel')}
          </LoadingButton>
        )}
        <SuccessButton
          toggleSuccess={toggleSuccess}
          loading={loading}
          variant="contained"
          onClick={onSaveClick}
        >
          {tCommon('save')}
        </SuccessButton>
      </Box>
    </Block>
  );
};

export default CsaCatalogDefaultOrder;
