import { Box, Button, Theme, Typography } from '@mui/material';
import { formatCurrency } from 'camap-common';
import React from 'react';
import SubBlock from '../../../components/utils/Block/SubBlock';
import { useCamapTranslation } from '../../../utils/hooks/use-camap-translation';
import { CsaCatalogContext } from '../CsaCatalog.context';

interface CsaCatalogSubscriptionSoldProps {
  withButton?: boolean;
}

const CsaCatalogSubscriptionSold = ({
  withButton = false,
}: CsaCatalogSubscriptionSoldProps) => {
  const { t } = useCamapTranslation({
    t: 'csa-catalog',
  });

  const { subscription } = React.useContext(CsaCatalogContext);

  if (!subscription) return null;

  return (
    <SubBlock
      title={t('paymentSold')}
      contentSx={{
        backgroundColor: (theme: Theme) =>
          subscription.balance >= 0
            ? theme.palette.success.main
            : theme.palette.error.main,
      }}
    >
      <Typography
        variant="h5"
        sx={{
          color: (theme) =>
            subscription.balance >= 0
              ? theme.palette.success.contrastText
              : theme.palette.error.contrastText,
          textAlign: 'center',
        }}
      >
        <b>{formatCurrency(subscription.balance)}</b>
      </Typography>
      {withButton && (
        <Box
          mt={1}
          bgcolor="white"
          width="fit-content"
          mx="auto"
          borderRadius={1}
          boxShadow={1}
        >
          <Button href={`/history/subscriptionPayments/${subscription.id}`}>
            {t('payments')}
          </Button>
        </Box>
      )}
    </SubBlock>
  );
};

export default CsaCatalogSubscriptionSold;
