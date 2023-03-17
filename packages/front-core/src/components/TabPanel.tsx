import { Box } from '@mui/material';
import React, { PropsWithChildren } from 'react';
import {
  TAB_ID,
  TAB_PANEL_ID,
} from '../modules/users/UserAccountModule/UserAccount';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export function TabPanel({
  children,
  index,
  value,
}: PropsWithChildren<TabPanelProps>) {
  return (
    <Box
      role="tabpanel"
      id={`${TAB_PANEL_ID}-${index}`}
      aria-labelledby={`${TAB_ID}-${index}`}
      hidden={value !== index}
    >
      {children}
    </Box>
  );
}
