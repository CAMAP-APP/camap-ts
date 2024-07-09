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
	setAbsencesAutorized
}: BatchOrderPageProps) => {
  const { absenceDistributionsIds, setSubscriptionAbsences,subscriptionAbsences } =
    React.useContext(CsaCatalogContext);

		useEffect(() => {
		setAbsencesAutorized(subscriptionAbsences != null)
		}, [setAbsencesAutorized, subscriptionAbsences])
		
  /**
   * Absences
   */
  const [
    updateSubscriptionAbsences,
    { data: postAbsencesData, error: postAbsencesError },
  ] = useRestUpdateSubscriptionAbsencesPost(selectedSubscription || 0);

  React.useEffect(() => {
    setSubscriptionAbsences(postAbsencesData);
  }, [postAbsencesData, setSubscriptionAbsences]);

  const handleAbsences = async () => {
		if (absenceDistributionsIds && absenceDistributionsIds.length > 0) {
			await updateSubscriptionAbsences({
				absentDistribIds: absenceDistributionsIds as number[],
			});
		}
    setShowAbsencesModal(false);
  };

  return (
    <>
      {postAbsencesError && <Alert severity="error">{postAbsencesError}</Alert>}
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
        <CsaCatalogRouter
          userId={selectedSubscription}
        />
      ) : (
        <CircularProgressBox />
      )}
    </>
  );
};

export default BatchOrderPage;
