import CircularProgressBox from '@components/utils/CircularProgressBox';
import { Alert, Box, Modal } from '@mui/material';
import { CsaCatalogContext } from 'modules/csaCatalog/CsaCatalog.context';
import CsaCatalogRouter from 'modules/csaCatalog/CsaCatalogRouter';
import CsaCatalogAbsences from 'modules/csaCatalog/containers/CsaCatalogAbsences';
import { useRestUpdateSubscriptionAbsencesPost } from 'modules/csaCatalog/requests';
import React, { useEffect } from 'react';

interface BatchOrderPageProps {
  selectedSubscription: number;
  showAbsencesModal: boolean;
  setShowAbsencesModal: (show: boolean) => void;
  setAbsencesAutorized: (b: boolean) => void;
}

const BatchOrderPage = ({
  selectedSubscription,
  showAbsencesModal,
  setShowAbsencesModal,
  setAbsencesAutorized,
}: BatchOrderPageProps) => {
  const {
    absenceDistributionsIds,
    setSubscriptionAbsences,
    subscriptionAbsences,
    getSubscription,
  } = React.useContext(CsaCatalogContext);

  /**
   * Absences
   */
  const [
    updateSubscriptionAbsences,
    { data: postAbsencesData, error: postAbsencesError },
  ] = useRestUpdateSubscriptionAbsencesPost(selectedSubscription || 0);

  useEffect(() => {
    setSubscriptionAbsences(postAbsencesData);
  }, [postAbsencesData, setSubscriptionAbsences]);

  useEffect(() => {
    setAbsencesAutorized(subscriptionAbsences != null);
  }, [setAbsencesAutorized, subscriptionAbsences]);

  const handleAbsences = async () => {
    const ids = (absenceDistributionsIds?.filter((d) => d !== 0) ||
      []) as number[];

    await updateSubscriptionAbsences({
      absentDistribIds: ids,
    });
    setShowAbsencesModal(false);

    // we have to recall /api/subscription to refresh orders displaying
    getSubscription();
  };

  return (
    <>
      {postAbsencesError && <Alert severity="error">{postAbsencesError}</Alert>}
      {/* Absence modal */}
      <Modal
        open={showAbsencesModal}
        onClose={() => setShowAbsencesModal(false)}
        onBackdropClick={() => setShowAbsencesModal(false)}
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
          <CsaCatalogAbsences onNext={handleAbsences} adminMode={true} />
        </Box>
      </Modal>
      <br />
      {selectedSubscription ? (
        <CsaCatalogRouter userId={selectedSubscription} />
      ) : (
        <CircularProgressBox />
      )}
    </>
  );
};

export default BatchOrderPage;
