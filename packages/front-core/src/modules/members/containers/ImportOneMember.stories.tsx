import { ApolloProvider } from '@apollo/client';
import { Meta } from '@storybook/react';
import { CaveaRouter } from '@utils/cavea-router';
import { Route, Routes } from 'react-router-dom';
import initApolloClient from '../../../lib/initApollo';
import ImportOneMember from './ImportOneMember';

const apolloClient = initApolloClient({});

export const Default = () => {
  return (
    <ApolloProvider client={apolloClient}>
      <CaveaRouter>
        <Routes>
          <Route path="/" element={<ImportOneMember />} />
        </Routes>
      </CaveaRouter>
    </ApolloProvider>
  );
};

export default {
  title: 'modules/Members/ImportOneMember',
  component: ImportOneMember,
} as Meta;
