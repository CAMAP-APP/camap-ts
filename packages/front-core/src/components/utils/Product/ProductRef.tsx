import { Box } from '@mui/material';
import React from 'react';

interface ProductRefProps {
  reference?: string;
}

const ProductRef = ({ reference }: ProductRefProps) => {
  return (
    <Box color={'#666'} fontFamily="monospace" fontSize="0.9em">
      {reference}
    </Box>
  );
};

export default ProductRef;
