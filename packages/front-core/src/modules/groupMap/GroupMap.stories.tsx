import { ApolloProvider } from '@apollo/client';
import React from 'react';
import initApolloClient from '../../lib/initApollo';
import GroupMap, { GroupMapProps } from './GroupMap.module';

const apolloClient = initApolloClient({});

export const Default = ({ initLat, initLng, initAddress }: GroupMapProps) => {
  return (
    <ApolloProvider client={apolloClient}>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.6.0/dist/leaflet.css"
        integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=="
        crossOrigin=""
      />
      <GroupMap initAddress={initAddress} initLat={initLat} initLng={initLng} />
    </ApolloProvider>
  );
};

Default.args = {
  initAddress: 'Nantes',
};

export default {
  title: 'modules/GroupMap',
  component: GroupMap,
};
