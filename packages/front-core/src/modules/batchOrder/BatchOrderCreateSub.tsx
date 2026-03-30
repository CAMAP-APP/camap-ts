import { Alert, Box, Button, Modal } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useCamapTranslation } from '../../utils/hooks/use-camap-translation';
import { CsaCatalogContext } from '../csaCatalog/CsaCatalog.context';
import { useRestSubscriptionPost } from '../csaCatalog/requests';
import CsaCatalogOrdersMobile from 'modules/csaCatalog/containers/CsaCatalogOrdersMobile';

interface BatchOrderCreateSubProps {
  selectedMember: number;
  refetchSubscriptions: () => void;
}

const BatchOrderCreateSub = ({
  selectedMember,
  refetchSubscriptions,
}: BatchOrderCreateSubProps) => {
  const { t } = useCamapTranslation({
    t: 'batch-order',
  });
  const { catalogId, defaultOrder, catalog } =
    React.useContext(CsaCatalogContext);

  const [showDefaultOrderModal, setShowDefaultOrderModal] = useState(false);

  const [createSubscription, { error: createError }] =
    useRestSubscriptionPost();

  useEffect(() => {}, [defaultOrder]);

  const handleCreateSub = async () => {
    if (catalog?.distribMinOrdersTotal) {
      setShowDefaultOrderModal(true);
    } else {
      await createSub([]);
    }
  };

  const handleDefaultOrder = async () => {
    return await createSub(
      Object.keys(defaultOrder).map((productId) => ({
        productId: parseInt(productId, 10),
        quantity: defaultOrder[parseInt(productId, 10)],
      })),
    );
  };

  const createSub = async (dOrder: any) => {
    const succeeded = await createSubscription({
      userId: selectedMember!,
      catalogId,
      defaultOrder: dOrder,
      absentDistribIds: [],
    });


    if(succeeded) {
      setShowDefaultOrderModal(false);

      // // we have to recall /api/subscription to refresh orders displaying
      refetchSubscriptions();
    }

    return succeeded;
  };

  return (
    <>
      {createError && <Alert severity="error">{createError}</Alert>}
      <Alert severity="warning" sx={{ margin: '16px 0px' }}>
        {t('userHasNoSubscription')}
      </Alert>

      {/* Create subscription button*/}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '16px',
        }}
      >
        <Button variant="contained" onClick={() => handleCreateSub()}>
          {t('createSubscription')}
        </Button>
      </div>

      {/* Default order modal */}
      <Modal
        open={showDefaultOrderModal}
        onClose={() => setShowDefaultOrderModal(false)}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <CsaCatalogOrdersMobile onNext={() => handleDefaultOrder()} mode="defaultOrder" />
        </Box>
      </Modal>
    </>
  );
};

export default BatchOrderCreateSub;
