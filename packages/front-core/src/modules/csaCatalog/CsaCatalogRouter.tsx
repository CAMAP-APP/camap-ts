import Block from '@components/utils/Block/Block';
import { CamapIconId } from '@components/utils/CamapIcon';
import { Alert, Box } from '@mui/material';
import React from 'react';
import { useCamapTranslation } from '../../utils/hooks/use-camap-translation';
import { CsaCatalogContext } from './CsaCatalog.context';
import CsaCatalogAbsences from './containers/CsaCatalogAbsences';
import CsaCatalogDefaultOrder from './containers/CsaCatalogDefaultOrder';
import CsaCatalogOrdersMobile from './containers/CsaCatalogOrdersMobile';
import CsaCatalogPresentation from './containers/CsaCatalogPresentation';
import CsaCatalogSubscription from './containers/CsaCatalogSubscription';
import MediumActionIcon from './containers/MediumActionIcon';
import {
  useRestCheckSubscriptionDefaultOrderPost,
  useRestSubscriptionPost,
  useRestUpdateSubscriptionDefaultOrderPost,
  useRestUpdateSubscriptionOrdersPost,
} from './requests';
import CircularProgressBox from '@components/utils/CircularProgressBox';

interface CsaCatalogRouterProps {
  userId: number;
}

const CsaCatalogRouter = ({ userId }: CsaCatalogRouterProps) => {
  const { t } = useCamapTranslation({
    t: 'csa-catalog',
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

  const [step, setStep] = React.useState<'presentation' | 'absences' | 'defaultOrder' | 'review'>(
    !initialSubscriptionId ? 'presentation' : 'review'
  );
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
  const [checkSubscriptionDefaultOrder, { error: checkDefaultOrderError }] =
    useRestCheckSubscriptionDefaultOrderPost(catalogId);

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

  const gotoDefaultOrder = () => {
    console.log(isConstOrders, catalog?.distribMinOrdersTotal);
    if (!isConstOrders && (catalog?.distribMinOrdersTotal ?? 0) === 0) {
      gotoAbsences();
    } else {
      setStep('defaultOrder');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const gotoAbsences = async () => {
    console.log(catalog?.absentDistribsMaxNb);
    if ((catalog?.absentDistribsMaxNb ?? 0) <= 0) {
      onAbsencesNext();
    } else {
      setStep('absences');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const checkDefaultOrderAndContinue = async () => {
    const checkDefaultOrderData = await checkSubscriptionDefaultOrder(
      Object.keys(defaultOrder).map((productId) => {
        const productIdNumber = parseInt(productId, 10);
        const product = catalog!.products.find((p) => p.id === productIdNumber);
        return {
          productId: productIdNumber,
          quantity: defaultOrder[productIdNumber],
          productPrice: product!.price,
        };
      }),
    );

    if (!checkDefaultOrderData) return false;

    gotoAbsences();
    return true;
  };

  const onAbsencesNext = async () => {
    const subscriptionSucceeded = await createSubscription({
      userId,
      catalogId,
      defaultOrder: Object.keys(defaultOrder).map((productId) => ({
        productId: parseInt(productId, 10),
        quantity: defaultOrder[parseInt(productId, 10)],
      })),
      absentDistribIds: absenceDistributionsIds
    });

    if (!subscriptionSucceeded) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setStep('review');
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
    updateDefaultOrderError ||
    checkDefaultOrderError;

  if (!catalog) return <CircularProgressBox />;

  return (
    <>
      {error && (
        <Box mb={2}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      {subscriptionData && (
        <Box mb={2}>
          <Alert severity="success">
            {t('yourSubscriptionHasBeenCreated')}
          </Alert>
        </Box>
      )}

      {/* This is the flow when user is not subscribed */}
      {step === 'presentation' && (
        <CsaCatalogPresentation onNext={gotoDefaultOrder} />
      )}
      {step === 'defaultOrder' && (
        <Box
          width={'100%'}
        >
          <CsaCatalogDefaultOrder onNext={checkDefaultOrderAndContinue} />
        </Box>
      )}
      {step === 'absences' && <CsaCatalogAbsences onNext={onAbsencesNext} adminMode={adminMode} />}

      {/* This is the end of the flow once subscribed */}
      {step === 'review' && !isConstOrders && (
        <CsaCatalogOrdersMobile onNext={onOrderNext} adminMode={adminMode} />
      )}
      {step === 'review' && !!subscription && !adminMode && (
        <Box mt={3}>
          <Block
            title={t('mySubscription')}
            icon={<MediumActionIcon id={CamapIconId.subscription} />}
            sx={{ height: '100%' }}
            contentSx={{ textAlign: 'center' }}
          >
            <CsaCatalogSubscription />
          </Block>
        </Box>
      )}

      {/* repeat error messages for visibility */}
      {error && (
        <Box mb={2}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}
    </>
  );
};

export default CsaCatalogRouter;
