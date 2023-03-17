import { Box, DialogTitle, DialogTitleProps } from '@mui/material';
import React from 'react';

export interface DialogTitleActionsProps extends DialogTitleProps {
  actions?: React.ReactNode;
}

const DialogTitleActions = ({
  actions,
  children,
  ...otherProps
}: DialogTitleActionsProps) => {
  return (
    <DialogTitle {...otherProps}>
      <Box display="flex" justifyContent="space-between">
        {children}
        {actions}
      </Box>
    </DialogTitle>
  );
};

export default DialogTitleActions;
