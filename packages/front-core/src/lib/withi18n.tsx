import React from 'react';
import './i18n';
import { Box, CircularProgress } from '@mui/material';

const withi18n = <T extends object>(Wrapped: React.ComponentType<T>) => {
  const Wrapper = (props: T) => {
    /** */
    return (
      <React.Suspense
        fallback={
          <Box p={2}>
            <CircularProgress />
          </Box>
        }
      >
        <Wrapped {...props} />
      </React.Suspense>
    );
  };

  return Wrapper;
};

export default withi18n;
