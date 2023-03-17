import { Alert, AlertColor, AlertTitle, Typography } from '@mui/material';
import React from 'react';

export interface AlertErrorProps {
  message: string;
  details?: string;
  severity?: AlertColor;
}

const AlertError = ({
  message,
  details,
  severity = 'error',
}: AlertErrorProps) => {
  return (
    <Alert severity={severity}>
      {details && <AlertTitle>{message}</AlertTitle>}
      <Typography>{details || message}</Typography>
    </Alert>
  );
};

export default AlertError;
