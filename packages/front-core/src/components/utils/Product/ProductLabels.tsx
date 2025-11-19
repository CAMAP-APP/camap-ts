import { Avatar, Tooltip } from '@mui/material';
import { useCamapTranslation } from '@utils/hooks/use-camap-translation';
import CamapIcon, { CamapIconId } from '../CamapIcon';
import { ProductInfos } from './ProductModal';

const Label = ({iconId, name, organic = false}
  : {
    iconId: CamapIconId,
    name: string,
    organic?: boolean
  }
) => {
  return (
    <Tooltip key={iconId} title={name}>
      <Avatar
        sx={{
          backgroundColor: 'white',
          width: '2.2rem',
          height: '2.2rem',
          marginRight: 0.5,
          boxShadow: 1,

          ...(organic && {
            backgroundColor: '#109c25', // official color of the AB label, do not change
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

function ProductLabels({ product }: {product: ProductInfos}) {
  const { t } = useCamapTranslation({ t: 'shop/default' });

  // if (product.wholesale) {
  //   labels.push(label(CamapIconId.wholesale, t('thisProductIsWholesale')));
  // }
  return <>
    {product.organic && <Label iconId={CamapIconId.bio} name={t('organicAgriculture')} organic />}
    {product.bulk && <Label iconId={CamapIconId.bulk} name={t('soldInBulk')} />}
  </>
};

export default ProductLabels;
