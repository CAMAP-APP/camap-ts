import { Product as ProductType } from '@gql';
import { Box, Typography } from '@mui/material';
import { formatUnit } from '@utils/fomat';
import { useCamapTranslation } from '@utils/hooks/use-camap-translation';
import { formatCurrency } from 'camap-common';
import OutOfStockMessage from './OutOfStockMessage';
import ProductAvatar from './ProductAvatar';

interface ProductProps {
  product: Pick<
    ProductType,
    'image' | 'name' | 'qt' | 'unitType' | 'price' | 'active' | 'stock'
  >;
  disabled?: boolean;
  showOutOfStockMessage?: boolean;
}

const Product = ({
  product,
  disabled = false,
  showOutOfStockMessage = false,
}: ProductProps) => {
  const { tUnit } = useCamapTranslation({
    tUnit: 'unit',
  });
  return (
    <Box
      display="flex"
      flexDirection={'row'}
      alignItems="center"
      textAlign="left"
      sx={
        !product.active
          ? {
              opacity: 0.5,
            }
          : undefined
      }
    >
      <ProductAvatar
        product={product}
        sx={{
          display: {
            xs: 'none',
            sm: 'block',
          },
          opacity: disabled
            ? (theme) => theme.palette.action.disabledOpacity
            : 1,
        }}
      />
      <Box ml={1}>
        <Typography>
          <b>
            {product.name} {product.qt}{' '}
            {formatUnit(product.unitType, product.qt, tUnit)}
          </b>
        </Typography>
        {showOutOfStockMessage ? (
          <OutOfStockMessage disabled={disabled} />
        ) : (
          <Typography>{formatCurrency(product.price)}</Typography>
        )}
      </Box>
    </Box>
  );
};

export default Product;
