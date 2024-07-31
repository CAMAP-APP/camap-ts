import { Alert, Box, Button, Modal } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useCamapTranslation } from '../../utils/hooks/use-camap-translation';
import CsaCatalogDefaultOrder from '../csaCatalog/containers/CsaCatalogDefaultOrder';
import { CsaCatalogContext } from '../csaCatalog/CsaCatalog.context';
import { useRestSubscriptionPost } from '../csaCatalog/requests';

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
    createSub(
      Object.keys(defaultOrder).map((productId) => ({
        productId: parseInt(productId, 10),
        quantity: defaultOrder[parseInt(productId, 10)],
      })),
    );
  };

  const createSub = async (dOrder: any) => {
    await createSubscription({
      userId: selectedMember!,
      catalogId,
      defaultOrder: dOrder,
      absentDistribIds: [],
    });

    setShowDefaultOrderModal(false);

    // // we have to recall /api/subscription to refresh orders displaying
    refetchSubscriptions();
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
        onBackdropClick={() => setShowDefaultOrderModal(false)}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <CsaCatalogDefaultOrder onNext={() => handleDefaultOrder()} />
        </Box>
      </Modal>
    </>
  );
};

export default BatchOrderCreateSub;
