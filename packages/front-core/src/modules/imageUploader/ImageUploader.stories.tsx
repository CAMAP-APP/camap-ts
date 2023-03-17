import { ApolloProvider } from '@apollo/client';
import React from 'react';
import initApolloClient from '../../lib/initApollo';
import ImageUploaderModule, {
  ImageUploaderContext,
} from './ImageUploader.module';

const apolloClient = initApolloClient({});

const Template = () => {
  return (
    <ApolloProvider client={apolloClient}>
      <ImageUploaderModule
        width={300}
        height={300}
        entityId={1}
        context={ImageUploaderContext.GROUP}
      />
    </ApolloProvider>
  );
};

export const Default = Template.bind({});

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  title: 'modules/ImageUploader',
  component: ImageUploaderModule,
};
