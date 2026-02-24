import { Box } from '@mui/material';
import theme from '@theme/default/theme';
import React, { MouseEvent, PropsWithChildren } from 'react';

interface EditorButtonType {
  active: boolean;
  onMouseDown: (event: MouseEvent<HTMLElement>) => void;
  onMouseUp?: (event: MouseEvent<HTMLElement>) => void;
}

export const TextEditorToolbarButton = ({
  active,
  onMouseDown,
  onMouseUp,
  children,
}: PropsWithChildren<EditorButtonType>) => {
  return (
    <Box
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      color={`${active ? theme.palette.text.primary : theme.palette.text.disabled
        }`}
      sx={{ cursor: 'pointer' }}
      p={theme.spacing(1)}
    >
      {children}
    </Box>
  );
};
