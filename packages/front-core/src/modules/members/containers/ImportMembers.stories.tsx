import { ApolloProvider } from '@apollo/client';
import { Meta } from '@storybook/react/types-6-0';
import { CaveaRouter } from '@utils/cavea-router';
import { Route, Routes } from 'react-router-dom';
import initApolloClient from '../../../lib/initApollo';
import ImportMembers from './ImportMembers';

const apolloClient = initApolloClient({});

export const Default = () => {
  return (
    <ApolloProvider client={apolloClient}>
      <CaveaRouter>
        <Routes>
          <Route path="/" element={<ImportMembers />} />
        </Routes>
      </CaveaRouter>
    </ApolloProvider>
  );
};

export default {
  title: 'modules/Members/ImportMembers',
  component: ImportMembers,
} as Meta;
