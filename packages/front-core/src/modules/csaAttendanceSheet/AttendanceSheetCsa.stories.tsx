import { ApolloProvider } from '@apollo/client';
import { Box } from '@mui/material';
import { Meta } from '@storybook/react/types-6-0';
import React from 'react';
import initApolloClient from '../../lib/initApollo';
import ClassicContractAttendanceModule from './ClassicContractAttendanceModule';
import VariableContractAttendanceModule from './VariableContractAttendanceModule';

const apolloClient = initApolloClient();

export const ClassicContractAttendanceModuleConnected = () => {
  return (
    <ApolloProvider client={apolloClient}>
      <ClassicContractAttendanceModule catalogId={1} />
    </ApolloProvider>
  );
};

export const VariableContractAttendanceModuleConnected = () => {
  return (
    <ApolloProvider client={apolloClient}>
      <VariableContractAttendanceModule
        catalogId={8973}
        distributionId={175544}
      />
    </ApolloProvider>
  );
};

export default {
  title: 'modules/CSA/AttendanceSheet',
  decorators: [
    (Story: React.ComponentType<{}>) => (
      <Box p={2} maxWidth={764}>
        <Story />
      </Box>
    ),
  ],
} as Meta;
