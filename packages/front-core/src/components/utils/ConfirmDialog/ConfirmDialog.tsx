import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  Typography,
} from '@mui/material';
import React from 'react';

export interface ConfirmDialogProps extends Pick<DialogProps, 'fullWidth'> {
  open: boolean;
  cancelButtonLabel?: string;
  confirmButtonLabel?: string;
  title?: string;
  message?: string;
  content?: React.ReactNode;
  onCancel?: () => void;
  onConfirm: () => void;
  useBigTitle?: boolean;
}

const ConfirmDialog = ({
  open,
  cancelButtonLabel = 'Cancel',
  confirmButtonLabel = 'Confirm',
  title,
  message,
  content,
  onCancel,
  onConfirm,
  useBigTitle,
  ...props
}: ConfirmDialogProps) => {
  return (
    <Dialog open={open} {...props}>
      {title && (
        <DialogTitle>
          {useBigTitle ? <Typography variant="h3">{title}</Typography> : title}
        </DialogTitle>
      )}
      {message && (
        <DialogContent>
          <Typography>{message}</Typography>
        </DialogContent>
      )}
      {content && <DialogContent>{content}</DialogContent>}
      <DialogActions>
        {onCancel && (
          <Button variant="outlined" onClick={onCancel}>
            {cancelButtonLabel}
          </Button>
        )}
        <Button autoFocus variant="contained" onClick={onConfirm}>
          {confirmButtonLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
