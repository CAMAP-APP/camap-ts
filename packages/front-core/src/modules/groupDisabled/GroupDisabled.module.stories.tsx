import { Meta } from '@storybook/react';
import withApollo from '../../lib/withApollo';
import Component from './GroupDisabled.module';

export const GroupDisabled = withApollo(() => {
  return <Component groupId={1} />;
});

export default {
  title: 'modules/GroupDisabled',
  component: Component,
} as Meta;
