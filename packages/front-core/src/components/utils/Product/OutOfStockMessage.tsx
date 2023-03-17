import { Typography } from '@mui/material';
import { Colors } from '@theme/commonPalette';
import { useTranslation } from 'react-i18next';

const OutOfStockMessage = ({ disabled = false }: { disabled?: boolean }) => {
  const { t } = useTranslation(['shop/default']);

  return (
    <Typography
      component="span"
      color={Colors.carotteDark}
      whiteSpace="pre-wrap"
      sx={{
        opacity: disabled ? (theme) => theme.palette.action.disabledOpacity : 1,
      }}
    >
      {t('outOfStock')}
    </Typography>
  );
};

export default OutOfStockMessage;
