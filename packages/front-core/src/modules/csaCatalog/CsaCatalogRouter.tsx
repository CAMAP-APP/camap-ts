import Block from '@components/utils/Block/Block';
import { CamapIconId } from '@components/utils/CamapIcon';
import { Alert, Box, Button } from '@mui/material';
import React, { useEffect } from 'react';
import { useCamapTranslation } from '../../utils/hooks/use-camap-translation';
import { CsaCatalogContext } from './CsaCatalog.context';
import CsaCatalogAbsences from './containers/CsaCatalogAbsences';
import CsaCatalogOrdersMobile from './containers/CsaCatalogOrdersMobile';
import CsaCatalogPresentation from './containers/CsaCatalogPresentation';
import CsaCatalogSubscription from './containers/CsaCatalogSubscription';
import MediumActionIcon from './containers/MediumActionIcon';
import {
  useRestSubscriptionPost,
  useRestUpdateSubscriptionDefaultOrderPost,
  useRestUpdateSubscriptionOrdersPost,
} from './requests';
import CircularProgressBox from '@components/utils/CircularProgressBox';

interface CsaCatalogRouterProps {
  userId: number;
}

const CsaCatalogRouter = ({ userId }: CsaCatalogRouterProps) => {
  const { t, tBatch } = useCamapTranslation({
    t: 'csa-catalog',
    tBatch: 'batch-order',
  });
  const {
    catalogId,
    subscription,
    catalog,
    updatedOrders,
    distributions,
    absenceDistributionsIds,
    setSubscription,
    defaultOrder,
    initialSubscriptionId,
    error: contextError,
    adminMode,
    isConstOrders
  } = React.useContext(CsaCatalogContext);

  console.log(initialSubscriptionId);

  const [step, setStep] = React.useState<'presentation' | 'absences' | 'requiredOrders' | 'review'>(
    !initialSubscriptionId ? 'presentation' : 'review'
  );

  useEffect(() => {
    setStep(!initialSubscriptionId ? 'presentation' : 'review')
  }, [initialSubscriptionId]);

  const [
    createSubscription,
    { data: subscriptionData, error: postSubscriptionError },
  ] = useRestSubscriptionPost();
  const [
    updateSubscriptionOrders,
    { data: updatedSubscriptionData, error: updatedSubscriptionError },
  ] = useRestUpdateSubscriptionOrdersPost();
  const [
    updateSubscriptionDefaultOrder,
    { data: updatedDefaultOrderData, error: updateDefaultOrderError },
  ] = useRestUpdateSubscriptionDefaultOrderPost();

  React.useEffect(() => {
    if (
      !postSubscriptionError &&
      !updatedSubscriptionError &&
      !contextError &&
      !updateDefaultOrderError
    )
      return;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [
    updatedSubscriptionError,
    postSubscriptionError,
    updateDefaultOrderError,
    contextError,
  ]);

  React.useEffect(() => {
    setSubscription(updatedSubscriptionData);
  }, [updatedSubscriptionData, setSubscription]);

  React.useEffect(() => {
    setSubscription(updatedDefaultOrderData);
  }, [updatedDefaultOrderData, setSubscription]);

  const gotoAbsences = async () => {
    console.log(catalog?.absentDistribsMaxNb);
    if ((catalog?.absentDistribsMaxNb ?? 0) <= 0) {
      gotoDefaultOrder();
    } else {
      setStep('absences');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const gotoDefaultOrder = () => {
    if (!isConstOrders && (catalog?.distribMinOrdersTotal ?? 0) === 0 && (catalog?.catalogMinOrdersTotal ?? 0) === 0) {
      finishWizard();
    } else {
      setStep('requiredOrders');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const finishWizard = async () => {
    const subscriptionSucceeded = await createSubscription({
      userId,
      catalogId,
      defaultOrder: Object.keys(defaultOrder).map((productId) => ({
        productId: parseInt(productId, 10),
        quantity: defaultOrder[parseInt(productId, 10)],
      })),
<<<<<<< HEAD
      absentDistribIds: absenceDistributionsIds,
      initialOrders: Object.keys(updatedOrders)
        .filter((distributionId) => !absenceDistributionsIds?.includes(parseInt(distributionId, 10)))
        .map((distributionId) => ({
          id: parseInt(distributionId, 10),
          orders: Object.keys(updatedOrders[parseInt(distributionId, 10)]).map((productId) => ({
            productId: parseInt(productId, 10),
            qty: updatedOrders[parseInt(distributionId, 10)][parseInt(productId, 10)],
          })).filter((order) => order.qty > 0),
      }))
=======
      absentDistribIds: absenceDistributionsIds
>>>>>>> 4589780 (v2.0.7 (#72))
    });

    if (!subscriptionSucceeded) return false;

    window.scrollTo({ top: 0, behavior: 'smooth' });

    setStep('review');
    return true;
  };

  React.useEffect(() => {
    setSubscription(subscriptionData);
  }, [subscriptionData, setSubscription]);

  const onOrderNext = async () => {
    if (step !== 'review' || !subscription || !catalog) return false;
    let success = false;
    if (isConstOrders) {
      success = await updateSubscriptionDefaultOrder(
        Object.keys(defaultOrder).map((productId) => ({
          productId: parseInt(productId, 10),
          quantity: defaultOrder[parseInt(productId, 10)],
        })),
        `${subscription.id}`,
      );
    } else {
      if (Object.keys(updatedOrders).length === 0) {
        return true;
      }

      success = await updateSubscriptionOrders(
        {
          distributions: distributions
            .filter((d) => {
              // in admin mode, this variable is set after the admin has set / unset absences
              // but we still want to update orders, so we ignore this
              if (absenceDistributionsIds && !adminMode) {
                return !absenceDistributionsIds.includes(d.id);
              }
              // return only updated orders on all distributions
              return !!updatedOrders[d.id];
            })
            .map((d) => ({
              // transform in expected API format
              id: d.id,
              orders: Object.keys(updatedOrders[d.id]).map((p) => ({
                productId: parseInt(p, 10),
                qty: updatedOrders[d.id][parseInt(p, 10)],
              })),
            })),
        },
        `${subscription.id}`,
      );
    }

    return success;
  };

  const error =
    updatedSubscriptionError ||
    postSubscriptionError ||
    contextError ||
    updateDefaultOrderError;

  if (!catalog) return <CircularProgressBox />;

  return (
    <>
      {error && (
        <Box mb={2}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      <Box mb={2}>        
        {subscriptionData && (
          <Box mb={2}>
            <Alert severity="success">
              {t('yourSubscriptionHasBeenCreated')}
            </Alert>
          </Box>
        )}

<<<<<<< HEAD
        {/* This is the flow when user is not subscribed */}
        {step === 'presentation' && (
          adminMode 
          ? <>
              <Alert severity="warning" sx={{ margin: '16px 0px' }}>
                {tBatch('userHasNoSubscription')}
              </Alert>
        
              {/* Create subscription button*/}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <Button variant="contained" onClick={() => gotoAbsences()}>
                  {tBatch('createSubscription')}
                </Button>
              </div>
            </>
          : <CsaCatalogPresentation onNext={gotoAbsences} />
        )}
        {step === 'absences' && <CsaCatalogAbsences onNext={async () => gotoDefaultOrder()} adminMode={adminMode} />}
        {step === 'requiredOrders' && (
          <Box
            width={'100%'}
          >
            <CsaCatalogOrdersMobile onNext={finishWizard} mode={catalog?.catalogMinOrdersTotal > 0 ? 'initialOrders' : 'defaultOrder'}/>
          </Box>
        )}

        {/* This is the end of the flow once subscribed */}
        {step === 'review' && !isConstOrders && (
          <CsaCatalogOrdersMobile onNext={onOrderNext} />
        )}
        {step === 'review' && !!subscription && !adminMode && (
          <Box mt={3}>
            <Block
              title={t('mySubscription')}
              icon={<MediumActionIcon id={CamapIconId.subscription} />}
=======
      {showPresentation && (
        <CsaCatalogPresentation onNext={onPresentationNext} />
      )}
      {showDefaultOrder && (
        <Box
          width={{
            xs: '100%',
            sm: '75%',
            md: '50%',
          }}
          mx="auto"
        >
          <CsaCatalogDefaultOrder onNext={checkDefaultOrderAndContinue} />
        </Box>
      )}
      {showAbsences && <CsaCatalogAbsences onNext={onAbsencesNext} adminMode={adminMode} />}
      {showOrders && catalog && (
        <>
          {isConstOrders ? (
            <CsaCatalogDefaultOrder onNext={onOrderNext} />
          ) : (
            <CsaCatalogOrders onNext={onOrderNext} adminMode={adminMode} />
          )}
        </>
      )}
      {showOrders && !!subscription && !adminMode && (
        <Box mt={3}>
            <Block
              title={t('mySubscription')}
              icon={<MediumActionIcon id={CamapIconId.info} />}
>>>>>>> 4589780 (v2.0.7 (#72))
              sx={{ height: '100%' }}
              contentSx={{ textAlign: 'center' }}
            >
              <CsaCatalogSubscription />
            </Block>
<<<<<<< HEAD
          </Box>
        )}
      </Box>

      {/* repeat error messages for visibility */}
      {error && (
        <Box mb={2}>
          <Alert severity="error">{error}</Alert>
=======
>>>>>>> 4589780 (v2.0.7 (#72))
        </Box>
      )}
    </>
  );
};

export default CsaCatalogRouter;
