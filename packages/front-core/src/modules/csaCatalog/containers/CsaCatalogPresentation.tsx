import { ChevronRight } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import { formatAddress } from 'camap-common';
import { isBefore } from 'date-fns';
import React from 'react';
import Block from '../../../components/utils/Block/Block';
import { CamapIconId } from '../../../components/utils/CamapIcon';
import CircularProgressBox from '../../../components/utils/CircularProgressBox';
import Product from '../../../components/utils/Product/Product';
import ProductModal, {
  ProductInfos,
} from '../../../components/utils/Product/ProductModal';
import theme from '../../../theme';
import { formatAbsoluteDate } from '../../../utils/fomat';
import { useCamapTranslation } from '../../../utils/hooks/use-camap-translation';
import CsaCatalogCoordinatorBlock from '../components/CsaCatalogCoordinatorBlock';
import CsaCatalogInformationBlock from '../components/CsaCatalogInformationBlock';
import { CsaCatalogContext } from '../CsaCatalog.context';
import { restCsaCatalogTypeToType } from '../interfaces';
import MediumActionIcon from './MediumActionIcon';

interface CsaCatalogPresentationProps {
  onNext?: () => void;
}

const CsaCatalogPresentation = ({ onNext }: CsaCatalogPresentationProps) => {
  const { t, tCommon, tUnit } = useCamapTranslation(
    { t: 'csa-catalog', tUnit: 'unit' },
    true,
  );

  const { catalog, distributions, nextDistributionIndex } =
    React.useContext(CsaCatalogContext);

  const elementRef = React.useRef<HTMLLIElement>(null);

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      if (
        !elementRef.current ||
        !elementRef.current.parentElement ||
        !elementRef.current.parentElement.parentElement ||
        !elementRef.current.parentElement.parentElement.parentElement
      )
        return;
      elementRef.current.parentElement.parentElement.parentElement.scrollTop =
        elementRef.current.offsetTop + 16;

      clearInterval(intervalId);
    });
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const [modalProduct, setModalProduct] = React.useState<ProductInfos>();

  const onProductModalClose = () => {
    setModalProduct(undefined);
  };

  if (!catalog || !distributions) return <CircularProgressBox />;

  return (
    <Box>
      <Grid container spacing={2} direction="row">
        <Grid item md sm={12} xs={12} container spacing={2} direction="column">
          {/* Informations */}
          {(catalog.description || catalog.documents.length > 0) && (
            <Grid item sx={{ pl: 0, width: '100%' }}>
              <CsaCatalogInformationBlock catalog={catalog} />
            </Grid>
          )}

          {/* Distributions */}
          <Grid item flex={1}>
            <Block
              title={t('distribution', {
                count: catalog.distributions.length,
              })}
              icon={<MediumActionIcon id={CamapIconId.calendar} />}
              contentSx={{
                overflow: 'auto',
                maxHeight:
                  catalog.description || catalog.documents.length > 0
                    ? {
                      xs: 138,
                      sm: 206,
                      md: 275,
                    }
                    : 450,
              }}
            >
              <List sx={{ py: 0 }}>
                {distributions.map((d, index) => {
                  const startDate = new Date(d.distributionStartDate);
                  const isPassed = isBefore(startDate, new Date());
                  return (
                    <Box key={`distribution_${d.id}`}>
                      <ListItem
                        disablePadding
                        ref={
                          distributions[nextDistributionIndex].id === d.id
                            ? elementRef
                            : null
                        }
                      >
                        <ListItemText
                          primary={formatAbsoluteDate(startDate)}
                          secondary={d.place.name}
                          sx={{
                            '& .MuiListItemText-secondary, & .MuiListItemText-primary':
                            {
                              color: isPassed
                                ? theme.palette.action.disabled
                                : 'inherit',
                            },
                          }}
                        />
                      </ListItem>
                      {index !== distributions.length - 1 && (
                        <Divider component="li" light />
                      )}
                    </Box>
                  );
                })}
              </List>
            </Block>
          </Grid>
        </Grid>

        <Grid item md sm={6} xs={12} container spacing={2} direction={'column'}>
          {/* Vendor */}
          <Grid item>
            <Block
              title={t('vendor')}
              icon={<MediumActionIcon id={CamapIconId.farmer} />}
              sx={{ display: 'flex', flexDirection: 'column' }}
              contentSx={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Box textAlign="center">
                <Avatar
                  src={
                    catalog.vendor.images.portrait ||
                    catalog.vendor.image ||
                    undefined
                  }
                  sx={{
                    width: '100px',
                    height: '100px',
                    mx: 'auto',
                    mb: 2,
                  }}
                />
                <>
                  <Typography variant="h4">
                    <b>{catalog.vendor.name}</b>
                  </Typography>
                  <Typography>{formatAddress(catalog.vendor)}</Typography>
                </>
              </Box>
            </Block>
          </Grid>

          {/* Products */}
          <Grid item>
            <Block
              title={t('products')}
              icon={<MediumActionIcon id={CamapIconId.products} />}
              contentSx={{
                overflow: 'auto',
                maxHeight: {
                  xs: 150,
                  sm: 225,
                  md: 300,
                },
              }}
            >
              <List sx={{ py: 0 }}>
                {catalog.products.map((p, index) => (
                  <Box key={`product_${p.id}`}>
                    <ListItem disablePadding>
                      <ListItemButton onClick={() => setModalProduct(p)}>
                        <Product product={p} />
                      </ListItemButton>
                    </ListItem>
                    {index !== catalog.products.length - 1 && (
                      <Divider component="li" light sx={{ my: 0.5 }} />
                    )}
                  </Box>
                ))}
              </List>
              <ProductModal
                product={modalProduct}
                onClose={onProductModalClose}
              />
            </Block>
          </Grid>
        </Grid>

        <Grid item md sm={6} xs={12} container spacing={2} direction={'column'}>
          {/* Conditions */}
          <Grid item flex={1} display="flex">
            <Block
              title={t('conditions')}
              icon={<MediumActionIcon id={CamapIconId.file} />}
              sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}
              contentSx={{
                flex: 1,
                display: 'flex',
                justifyContent: 'space-evenly',
                flexDirection: 'column',
              }}
            >
              <Typography paragraph>
                <b>{t(restCsaCatalogTypeToType(catalog.type))}</b>
              </Typography>
              <Typography paragraph>
                <b>{t('engagementPeriod')} : </b>
                {`${tCommon('from')} ${formatAbsoluteDate(
                  new Date(catalog.startDate),
                  false,
                  false,
                  true,
                )} ${tCommon('to')} ${formatAbsoluteDate(
                  new Date(catalog.endDate),
                  false,
                  false,
                  true,
                )}`}
              </Typography>
              <Typography paragraph>
                <b>{t('engagement')} : </b>
                {catalog.constraints ? (
                  <span
                    dangerouslySetInnerHTML={{ __html: catalog.constraints }}
                  />
                ) : (
                  t('noConstraints')
                )}
              </Typography>
              <Typography paragraph>
                <b>{t('absences')} : </b>
                {catalog.absences}
              </Typography>
            </Block>
          </Grid>

          {/* Coordinator */}
          <Grid item display="flex">
            <CsaCatalogCoordinatorBlock catalog={catalog} />
          </Grid>
        </Grid>
      </Grid>

      <Box width="100%" textAlign="center" mt={3}>
        <Button
          variant="contained"
          startIcon={<ChevronRight />}
          onClick={onNext}
        >
          {t('subscribeToThisContract')}
        </Button>
      </Box>
    </Box>
  );
};

export default CsaCatalogPresentation;
