import CloseIcon from '@mui/icons-material/Close';
import { Box, IconButton, SxProps, Theme } from '@mui/material';
import React from 'react';
import DialogTitleActions from '../DialogTitleActions';

export interface DialogTitleClosableProps {
  children: React.ReactNode;
  disableCloseBtn?: boolean;
  onClose?: () => void;
  sx?: SxProps<Theme>;
}

const DialogTitleClosable = ({
  children,
  disableCloseBtn = false,
  onClose,
  sx,
}: DialogTitleClosableProps) => {
  return (
    <DialogTitleActions
      actions={
        <Box display="flex" alignItems="center">
          {onClose && (
            <IconButton disabled={disableCloseBtn} onClick={onClose}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      }
      sx={{
        '& div': {
          alignItems: 'center',
        },
        ...sx,
      }}
    >
      {children}
    </DialogTitleActions>
  );
};

export default DialogTitleClosable;
