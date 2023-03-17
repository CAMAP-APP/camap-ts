import React from 'react';
import { Box, BoxProps, CircularProgress, CircularProgressProps } from '@mui/material';

export interface CircularProgressBoxProps {
  boxProps?: Omit<BoxProps, 'children'>;
  circularProgressProps?: CircularProgressProps;
}

const CircularProgressBox = ({ boxProps, circularProgressProps }: CircularProgressBoxProps) => {
  return (
    <Box p={2} display="flex" justifyContent="center" {...boxProps}>
      <CircularProgress {...circularProgressProps} />
    </Box>
  );
};

export default CircularProgressBox;
