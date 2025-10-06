import { RemoveCircleOutline, ShoppingBag } from '@mui/icons-material';
import { Alert, Box, Button, Grid, Modal, Typography } from '@mui/material';
import { formatCurrency } from 'camap-common';
import React from 'react';
import SubBlock from '../../../components/utils/Block/SubBlock';
import CircularProgressBox from '../../../components/utils/CircularProgressBox';
import { formatAbsoluteDate } from '../../../utils/fomat';
import { useCamapTranslation } from '../../../utils/hooks/use-camap-translation';
import CsaCatalogCoordinatorBlock from '../components/CsaCatalogCoordinatorBlock';
import CsaCatalogInformationBlock from '../components/CsaCatalogInformationBlock';
import { CsaCatalogContext } from '../CsaCatalog.context';
import { useRestUpdateSubscriptionAbsencesPost } from '../requests';
import CsaCatalogAbsences from './CsaCatalogAbsences';
import CsaCatalogSubscriptionSold from './CsaCatalogSubscriptionSold';

const CsaCatalogSubscription = () => {
  const { t, tCommon } = useCamapTranslation(
    {
      t: 'csa-catalog',
    },
    true,
  );

  const {
    subscription,
    distributions,
    subscriptionAbsences,
    absenceDistributionsIds,
    setSubscriptionAbsences,
    catalog,
    adminMode
  } = React.useContext(CsaCatalogContext);

  const [
    updateSubscriptionAbsences,
    { data: postAbsencesData, error: postAbsencesError },
  ] = useRestUpdateSubscriptionAbsencesPost(subscription!.id);

  React.useEffect(() => {
    setSubscriptionAbsences(postAbsencesData);
  }, [postAbsencesData, setSubscriptionAbsences]);

  const [absencesModalOpen, setAbsencesModalOpen] = React.useState(false);

  const onAbsencesChangeClick = () => {
    setAbsencesModalOpen(true);
  };

  const onCloseAbsencesModal = () => {
    setAbsencesModalOpen(false);
  };

  const handleAbsences = async () => {
    await updateSubscriptionAbsences({
      absentDistribIds: absenceDistributionsIds as number[],
    });
    onCloseAbsencesModal();
  };

  if (
    !subscription ||
    !distributions ||
    (subscription.absentDistribIds.length > 0 && !subscriptionAbsences)
  )
    return <CircularProgressBox />;

  return (
      <Box>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <SubBlock title={t('engagement')}>
              <Typography>
                {subscription.constraints ? (
                  <span
                    dangerouslySetInnerHTML={{
                      __html: subscription.constraints,
                    }}
                  />
                ) : (
                  t('noConstraints')
                )}
              </Typography>
            </SubBlock>
          </Grid>
          <Grid item xs={12} md={6}>
            <SubBlock title={t('engagementPeriod')}>
              <Typography>
                {`${tCommon('from')} ${formatAbsoluteDate(
                  new Date(subscription.startDate),
                  false,
                  false,
                  true,
                )} ${tCommon('to')} ${formatAbsoluteDate(
                  new Date(subscription.endDate),
                  false,
                  false,
                  true,
                )}`}
              </Typography>
            </SubBlock>
          </Grid>
          <Grid item xs={12} md={6}>
            <SubBlock title={t('myAbsences')}>
              {(subscription.absentDistribIds.length > 0 || adminMode) ? (
                <>
                  {postAbsencesError && (
                    <Alert severity="error">{postAbsencesError}</Alert>
                  )}
                  {subscriptionAbsences?.absentDistribIds.map((id) => {
                    const distribution = distributions.find((d) => d.id === id);
                    if (!distribution) return null;
                    return (
                      <Typography key={`absent_distribution_${id}`}>
                        {formatAbsoluteDate(
                          distribution.distributionStartDate,
                          false,
                          true,
                          true,
                        )}
                      </Typography>
                    );
                  })}
                  <Button
                    variant="outlined"
                    sx={{ mt: 1 }}
                    onClick={onAbsencesChangeClick}
                  >
                    {tCommon('change')}
                  </Button>
                </>
              ) : (
                <Typography>{t('noAbsencePossible')}</Typography>
              )}
            </SubBlock>
          </Grid>
          <Grid item xs={12} md={6}>
            <SubBlock title={t('distributions')}>
              <Typography>
                {!subscription.absentDistribIds.length
                  ? `${t('distribution', {
                      count: subscription.distributions.length,
                    })} ${t('onYourEngagementPeriod')}`
                  : t('numberOfDistributionsWithAbsences', {
                      distributions: subscription.distributions.length,
                      absences: subscriptionAbsences!.absentDistribIds.length,
                      effectiveDistributions:
                        subscription.distributions.length -
                        subscriptionAbsences!.absentDistribIds.length,
                    })}
              </Typography>
            </SubBlock>
          </Grid>
          <Grid item xs={12} md={6}>
            <SubBlock title={t('totalOrdered')}>
              <Typography variant="h5">
                <b>{formatCurrency(subscription.totalOrdered)}</b>
              </Typography>
            </SubBlock>
          </Grid>
          <Grid item xs={12} md={6}>
            <CsaCatalogSubscriptionSold withButton />
          </Grid>
          {catalog && (
            <>
              {(catalog.description || catalog.documents.length > 0) && (
                <Grid item xs={12} md={6}>
                  <CsaCatalogInformationBlock catalog={catalog} isSubBlock />
                </Grid>
              )}
              <Grid
                item
                xs={12}
                md={
                  catalog.description || catalog.documents.length > 0 ? 6 : 12
                }
              >
                <CsaCatalogCoordinatorBlock catalog={catalog} isSubBlock />
              </Grid>
            </>
          )}
        </Grid>

        <Box mt={2} textAlign={{ xs: 'center', sm: 'start' }}>
          <Button
            variant="outlined"
            sx={{ mr: { xs: 0, sm: 2 }, mb: { xs: 1, sm: 0 } }}
            startIcon={<ShoppingBag />}
            href={`/history/subscriptionOrders/${subscription.id}`}
          >
            {t('orders')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<RemoveCircleOutline />}
            href={`/subscriptions/delete/${subscription.id}`}
          >
            {t('cancelSubscription')}
          </Button>
        </Box>

        <Modal
          open={absencesModalOpen}
          onClose={onCloseAbsencesModal}
          onBackdropClick={onCloseAbsencesModal}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              minWidth: '90%',
            }}
          >
            <CsaCatalogAbsences onNext={handleAbsences} />
          </Box>
        </Modal>
      </Box>
  );
};

export default CsaCatalogSubscription;
