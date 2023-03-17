import withApollo from '../../lib/withApollo';
import LoginRegistrationModule, {
  LoginRegistrationProps,
} from './LoginRegistration.module';

export const Default = withApollo(
  ({
    redirectUrl,
    message,
    phoneRequired,
    addressRequired,
    openRegistration,
    asDialog,
    hideTitle,
  }: LoginRegistrationProps) => {
    let sid = '';
    const value = `; ${document.cookie}`;
    const parts = value.split(`; sid=`);
    if (parts && parts.length === 2) sid = parts.pop()!.split(';').shift()!;
    return (
      <LoginRegistrationModule
        redirectUrl={redirectUrl}
        sid={sid}
        message={message}
        phoneRequired={phoneRequired}
        addressRequired={addressRequired}
        openRegistration={openRegistration}
        invitedUserEmail="boby@camap.net"
        asDialog={asDialog}
        hideTitle={hideTitle}
      />
    );
  },
);

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  title: 'modules/LoginRegistration',
  component: LoginRegistrationModule,
  args: {
    redirectUrl: '/',
    message: '',
    addressRequired: true,
    phoneRequired: false,
    openRegistration: true,
    asDialog: true,
    hideTitle: false,
  },
};
