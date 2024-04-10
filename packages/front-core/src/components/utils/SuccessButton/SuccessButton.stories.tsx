import { Box } from '@mui/material';
import { Meta } from '@storybook/react';
import React from 'react';
import SuccessButton, { SuccessButtonProps } from './SuccessButton';

type TemplateProps = Omit<SuccessButtonProps, 'loading' | 'onClick'>;

const Template = (props: TemplateProps) => {
  const [loading, toggleLoaging] = React.useState(false);
  const [toggleSuccess, setToggleSuccess] = React.useState(false);

  const onClick = () => {
    toggleLoaging(true);
    setTimeout(() => {
      setToggleSuccess(true);
      toggleLoaging(false);
      setTimeout(() => {
        setToggleSuccess(false);
      }, 2000);
    }, 1000);
  };

  return (
    <Box p={2} maxWidth="875px">
      <SuccessButton
        {...props}
        loading={loading}
        toggleSuccess={toggleSuccess}
        onClick={onClick}
      >
        A BUTTON
      </SuccessButton>
    </Box>
  );
};

export const Default = Template.bind({});
Default.args = {
  loading: true,
  variant: 'outlined',
  color: 'primary',
} as TemplateProps;

export default {
  title: 'components/utils/SuccessButton',
  component: SuccessButton,
} as Meta;
