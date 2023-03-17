import { Box } from '@mui/material';
import { Meta } from '@storybook/react';
import Product from './Product';
import { ProductUnit } from './ProductUnit';

const Template = () => (
  <Box p={2} maxWidth={200} bgcolor={'white'}>
    <Product
      product={{
        image: '/img/taxo/grey/legumes.png',
        name: 'Farine',
        price: 2.5,
        qt: 1,
        unitType: ProductUnit.Kilogram,
        active: true,
      }}
    />
  </Box>
);

export const Default = Template.bind({});

export default {
  title: 'components/utils/Product',
  component: Product,
} as Meta;
