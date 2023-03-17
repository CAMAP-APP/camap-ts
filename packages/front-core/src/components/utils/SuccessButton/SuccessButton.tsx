import { LoadingButton } from '@mui/lab';
import { Box, ButtonProps, CircularProgressProps } from '@mui/material';
import React from 'react';
import Check from '../../svg/Check';

export interface SuccessButtonProps extends ButtonProps {
  loading?: boolean;
  toggleSuccess?: boolean;
  circularProgressProps?: CircularProgressProps;
}

const SuccessButton = ({
  loading = false,
  toggleSuccess = false,
  variant,
  color,
  disabled,
  children,
  circularProgressProps,
  startIcon,
  ...other
}: SuccessButtonProps) => {
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    if (!toggleSuccess) return;

    setSuccess(true);
    const timeoutId = setTimeout(() => {
      setSuccess(false);
    }, 2000);
    return () => {
      if (!timeoutId) return;
      setSuccess(false);
      clearTimeout(timeoutId);
    };
  }, [toggleSuccess]);

  /** */
  return (
    <LoadingButton
      {...other}
      loading={loading}
      variant={variant}
      color={color}
      disabled={disabled || success}
      startIcon={startIcon}
      sx={{
        ...other.sx,

        '& .MuiButton-startIcon': {
          visibility: success ? 'hidden' : 'visible',
        },
      }}
    >
      <Box position="relative">
        <Box visibility={success ? 'hidden' : 'visible'}>{children}</Box>
        {success && (
          <Box
            position="absolute"
            top={0}
            bottom={0}
            left={startIcon ? -20 : 0}
            right={0}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Check isAnimated />
          </Box>
        )}
      </Box>
    </LoadingButton>
  );
};

export default SuccessButton;
