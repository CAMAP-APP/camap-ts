import { Box } from '@mui/material';
import React, { MouseEvent, PropsWithChildren } from 'react';
import theme from '../../theme';

interface EditorButtonType {
  active: boolean;
  onMouseDown: (event: MouseEvent<HTMLElement>) => void;
  onMouseUp?: (event: MouseEvent<HTMLElement>) => void;
}

export const TextEditorComponents = ({
  active,
  onMouseDown,
  onMouseUp,
  children,
}: PropsWithChildren<EditorButtonType>) => {
  return (
    <Box
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      color={`${
        active ? theme.palette.text.primary : theme.palette.text.disabled
      }`}
      sx={{ cursor: 'pointer' }}
      p={theme.spacing(1)}
    >
      {children}
    </Box>
  );
};
