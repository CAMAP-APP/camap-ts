import { Box, Collapse } from '@mui/material';
import { Alert } from '@mui/material';
import React from 'react';
import { UserList } from '../../../gql';
import { MembersContext } from '../MembersContext';

const MembersAlert = () => {
  const { success, errors, resetAlerts, selectedUserList } = React.useContext(MembersContext);
  const [openErrors, setOpenErrors] = React.useState<boolean>(false);
  const [openSuccess, setOpenSuccess] = React.useState<boolean>(false);

  const previousSelectedUserList = React.useRef<UserList>();

  React.useEffect(() => {
    if (errors.length === 0) setOpenErrors(false);
    else setOpenErrors(true);
  }, [errors]);

  React.useEffect(() => {
    if (!success) setOpenSuccess(false);
    else setOpenSuccess(true);
  }, [success]);

  React.useEffect(() => {
    if (previousSelectedUserList.current && selectedUserList.type !== previousSelectedUserList.current.type) {
      resetAlerts();
    }
    previousSelectedUserList.current = selectedUserList;
  }, [selectedUserList]);

  return (
    <>
      {errors.map((error, index) => (
        <Collapse
          key={error}
          in={openErrors}
          timeout={{ enter: (index + 1) * 250 }}
          style={{ transitionDelay: `${index * 250}ms` }}
        >
          <Box my={2}>
            <Alert severity="error">{error}</Alert>
          </Box>
        </Collapse>
      ))}
      {success && (
        <Collapse
          in={openSuccess}
          timeout={{ enter: (errors.length + 1) * 250 }}
          style={{ transitionDelay: `${errors.length * 500}ms` }}
        >
          <Box my={2}>
            <Alert severity="success">{success}</Alert>
          </Box>
        </Collapse>
      )}
    </>
  );
};

export default MembersAlert;
