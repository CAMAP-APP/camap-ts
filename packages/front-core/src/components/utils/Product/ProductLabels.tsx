import { Avatar, Tooltip } from '@mui/material';
import { Colors } from '@theme/commonPalette';
import { useTranslation } from 'react-i18next';
import CamapIcon, { CamapIconId } from '../CamapIcon';
import { ProductInfos } from './ProductModal';

interface ProductLabelsProps {
  product: ProductInfos;
}

const ProductLabels = ({ product }: ProductLabelsProps) => {
  const { t } = useTranslation(['shop/default']);

  const label = (iconId: CamapIconId, name: string, organic = false) => {
    return (
      <Tooltip key={iconId} title={name}>
        <Avatar
          sx={{
            backgroundColor: Colors.white,
            width: '2.2rem',
            height: '2.2rem',
            marginRight: 0.5,
            boxShadow: 1,

            ...(organic && {
              backgroundColor: (theme) => theme.palette.success.main,
              paddingRight: 0.25,
              paddingBottom: 0.25,
            }),
          }}
        >
          <CamapIcon
            id={iconId}
            sx={{
              fontSize: '1rem',
              color: organic ? 'white' : 'text.primary',
              overflow: 'visible',
              textAlign: 'center',
            }}
          />
        </Avatar>
      </Tooltip>
    );
  };

  const labels = [];

  // bio
  if (product.organic) {
    labels.push(label(CamapIconId.bio, t('organicAgriculture'), true));
  }

  // bulk
  if (product.bulk) {
    labels.push(label(CamapIconId.bulk, t('soldInBulk')));
  }

  /* Ignore Wholesale for the moment
  // wholesale
  if (product.wholesale) {
    labels.push(label(CamapIconId.wholesale, t('thisProductIsWholesale')));
  }
  */

  return <>{labels}</>;
};

export default ProductLabels;
