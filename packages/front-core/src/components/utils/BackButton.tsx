import { Button, ButtonProps } from '@mui/material';
import React from 'react';
import { useCamapTranslation } from '../../utils/hooks/use-camap-translation';
import CamapIcon, { CamapIconId } from './CamapIcon';

export interface BackButtonProps {
  buttonProps?: ButtonProps;
  onClick: () => void;
  children?: React.ReactNode;
}

const BackButton = ({ buttonProps, onClick, children }: BackButtonProps) => {
  const { tCommon } = useCamapTranslation({}, true);
  return (
    <Button
      variant="outlined"
      startIcon={<CamapIcon id={CamapIconId.chevronLeft} />}
      onClick={onClick}
      {...buttonProps}
    >
      {children || tCommon('back')}
    </Button>
  );
};

export default BackButton;
