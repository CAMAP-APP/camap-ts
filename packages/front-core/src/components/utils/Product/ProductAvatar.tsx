import { styled, SxProps, Theme } from '@mui/material';
import { Product } from '../../../gql';

const StyledImage = styled('img')(({ theme }) => ({
  width: 64,
  height: 64,
  borderRadius: theme.shape.borderRadius,
}));

interface ProductAvatarProps {
  product: Pick<Product, 'image' | 'name'>;
  sx?: SxProps<Theme>;
}

const ProductAvatar = ({ product, sx }: ProductAvatarProps) => {
  return (
    <StyledImage
      src={product.image}
      alt={product.name}
      sx={{
        width: {
          xs: 32,
          sm: 48,
          md: 64,
        },
        height: {
          xs: 32,
          sm: 48,
          md: 64,
        },
        ...sx,
      }}
    />
  );
};

export default ProductAvatar;
