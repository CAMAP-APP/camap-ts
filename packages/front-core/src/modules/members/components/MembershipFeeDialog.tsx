import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  TextField,
} from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface MembershipFeeDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (amount: number) => void;
}

const MembershipFeeDialog = ({
  open,
  onCancel,
  onConfirm,
}: MembershipFeeDialogProps) => {
  const { t: tBasics } = useTranslation(['translation']);
  const { t } = useTranslation(['membership/default']);

  const [amount, setAmount] = React.useState<number | undefined>(undefined);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    setAmount(Number.isNaN(value) ? undefined : value);
  };

  const handleConfirm = () => {
    if (amount === undefined) return;
    onConfirm(amount);
  };

  return (
    <Dialog open={open}>
      <DialogTitle>{t('pleaseInsertSubscriptionAmount')}</DialogTitle>
      <DialogContent>
        <TextField
          label={t('subscriptionAmount')}
          type="number"
          fullWidth
          value={amount}
          onChange={handleChange}
          InputProps={{
            endAdornment: <InputAdornment position="end">€</InputAdornment>,
          }}
          // eslint-disable-next-line react/jsx-no-duplicate-props
          inputProps={{
            min: 0,
            step: 0.01,
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onCancel}>
          {tBasics('cancel')}
        </Button>
        <Button
          disabled={!amount}
          autoFocus
          variant="contained"
          onClick={handleConfirm}
        >
          {tBasics('confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MembershipFeeDialog;
