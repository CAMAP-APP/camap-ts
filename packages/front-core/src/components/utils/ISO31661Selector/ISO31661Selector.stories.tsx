/* eslint-disable import/no-extraneous-dependencies */
import { Box } from '@mui/material';
import React from 'react';
import ISO31661Selector, {
  FRANCE_ISO_3166_1,
  ISO31661SelectorProps,
} from './ISO31661Selector';

const Template = (props: ISO31661SelectorProps) => (
  <Box p={2} maxWidth="875px">
    <ISO31661Selector {...props} />
  </Box>
);

export const Default = Template.bind({});
Default.args = {
  defaultValue: FRANCE_ISO_3166_1,
  format: 'alpha3',
  autocompleteProps: { noOptionsText: 'Aucune' },
  textFieldProps: { label: 'ISO-3166-1', required: true },
  onChange: () => {},
  value: 'fr',
} as ISO31661SelectorProps;

export default {
  title: 'components/utils/ISO31661Selector',
  component: ISO31661Selector,
};
