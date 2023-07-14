import { Box, Typography } from '@mui/material';
import { PropsWithChildren } from 'react';

interface EmptyProps {
  text: string;
}

export function Empty({ text }: PropsWithChildren<EmptyProps>) {
  return (
    <Box p={2} maxHeight={300} textAlign="center">
      <Typography component="p" gutterBottom color="#AAA">
        {text}
      </Typography>
    </Box>
  );
}
