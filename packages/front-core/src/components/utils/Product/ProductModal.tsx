import { Close } from '@mui/icons-material';
import {
  Box,
  Dialog,
  Grid,
  IconButton,
  styled,
  Tooltip,
  Typography,
} from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Product } from '../../../gql';
import { formatUnit } from '../../../utils/fomat';
import ProductLabels from './ProductLabels';
import DOMPurify from 'dompurify';

const ImgCover = styled('img')(() => ({
  maxWidth: '100%',
  maxHeight: '400px',
}));

const GridItemSx = {
  overflow: 'hidden',
};

export type ProductInfos = Pick<
  Product,
  | 'id'
  | 'image'
  | 'name'
  | 'variablePrice'
  | 'qt'
  | 'unitType'
  | 'desc'
  | 'organic'
  | 'bulk'
>;

interface ProductModalProps {
  product?: ProductInfos;
  onClose: () => void;
}

const ProductModal = ({ product, onClose }: ProductModalProps) => {
  const { t } = useTranslation(['shop/default']);
  const { t: tUnit } = useTranslation(['unit']);

  // eslint-disable-next-line no-empty-pattern
  const [] = React.useState();

  if (!product) return null;

  return (
    <Dialog open onClose={onClose} maxWidth="md" scroll="body">
      <Box p={3}>
        <Tooltip title={`${t('close')}`}>
          <IconButton
            onClick={onClose}
            sx={{
              top: (theme) => theme.spacing(0.5),
              position: 'absolute',
              right: (theme) => theme.spacing(0.5),
            }}
            size="large"
          >
            <Close />
          </IconButton>
        </Tooltip>

        <Grid container spacing={2}>
          <Grid item sm={4} xs={12} sx={GridItemSx}>
            <Box textAlign="center" position="relative">
              <ImgCover src={product.image} alt={product.name} />
              <Box
                display="flex"
                flexDirection="row"
                mb={0.5}
                position="absolute"
                top={10}
                left={10}
              >
                <ProductLabels product={product} />
              </Box>
            </Box>
          </Grid>

          <Grid item sm={8} xs={12} sx={GridItemSx}>
            <Typography
              component="h3"
              sx={{
                fontSize: '1.4rem',
                textTransform: 'uppercase',
                mb: 1,
                mr: 4,
              }}
            >
              {product.name}
              {product.variablePrice && (
                <Typography
                  component="span"
                  sx={{
                    fontSize: '1.4rem',
                    textTransform: 'initial',
                  }}
                >
                  {/* eslint-disable-next-line i18next/no-literal-string */}
                  {' ≈ '}
                  {product.qt}
                  {formatUnit(
                    product.unitType || undefined,
                    product.qt || 0,
                    tUnit,
                  )}
                </Typography>
              )}
            </Typography>
            <Grid
              container
              sx={{
                flexDirection: {
                  xs: 'column-reverse',
                  sm: 'column',
                },
              }}
              spacing={1}
            >
              {product.desc && (
                <Grid item>
                  <Typography
                    sx={{ whiteSpace: 'break-spaces' }}
                    component="p"
                    lineHeight={1}
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.desc) }}
                  />
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Dialog>
  );
};

export default ProductModal;
