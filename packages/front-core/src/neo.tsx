import CircularProgressBox from '@components/utils/CircularProgressBox';
import { ThemeProvider } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format } from 'date-fns';
import frLocale from 'date-fns/locale/fr';
import React from 'react';
import { createRoot } from 'react-dom/client';
import './lib/i18n';
import withApollo from './lib/withApollo';
import theme from './theme';

class LocalizedUtils extends AdapterDateFns {
  getDatePickerHeaderText(date: Date) {
    return format(date, 'd MMM yyyy', { locale: this.locale });
  }
}

const PlaceModule = React.lazy(() => import('./modules/places/PlaceModule'));
const PlaceDialogModule = React.lazy(
  () => import('./modules/places/PlaceDialogModule'),
);
const MessagesModule = React.lazy(
  () => import('./modules/messages/Messages.module'),
);
const MembersModule = React.lazy(
  () => import('./modules/members/Members.module'),
);
const MembershipDialogModule = React.lazy(
  () => import('./modules/membership/MembershipDialog.module'),
);
const GroupMapModule = React.lazy(
  () => import('./modules/groupMap/GroupMap.module'),
);
const UserAccountModule = React.lazy(
  () => import('./modules/users/UserAccountModule/user-account.module'),
);
const EditNotificationsModule = React.lazy(
  () => import('./modules/users/EditNotifications/EditNotifications.module'),
);
const QuitGroupModule = React.lazy(
  () => import('./modules/users/QuitGroup/QuitGroup.module'),
);
const LoginRegistrationModule = React.lazy(
  () => import('./modules/loginRegistration/LoginRegistration.module'),
);
const LoginAsModule = React.lazy(
  () => import('./modules/loginRegistration/LoginAs.module'),
);
const ClassicContractAttendanceModule = React.lazy(
  () => import('./modules/csaAttendanceSheet/ClassicContractAttendanceModule'),
);
const VariableContractAttendanceModule = React.lazy(
  () => import('./modules/csaAttendanceSheet/VariableContractAttendanceModule'),
);
const ImageUploaderDialogModule = React.lazy(
  () => import('./modules/imageUploader/ImageUploader.module'),
);

const HaxeDatePicker = React.lazy(
  () => import('./modules/haxe-date-picker/HaxeDatePicker'),
);
const VatBox = React.lazy(() => import('./modules/vatBox/VatBox.module'));

const DeleteAccount = React.lazy(
  () => import('./modules/users/DeleteAccountModule/DeleteAccount.module'),
);

const CsaCatalog = React.lazy(
  () => import('./modules/csaCatalog/CsaCatalog.module'),
);

const VolunteersCalendar = React.lazy(
  () => import('./modules/volunteersCalendar/VolunteersCalendar.module'),
);

const GroupDisabled = React.lazy(
  () => import('./modules/groupDisabled/GroupDisabled.module'),
);

const Wrapper = ({
  children,
  showFallback = true,
}: {
  children: React.ReactNode;
  showFallback?: boolean;
}) => {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={LocalizedUtils} locale={frLocale}>
        <React.Suspense
          fallback={showFallback ? <CircularProgressBox /> : null}
        >
          {children}
        </React.Suspense>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

const ApolloWrapper = withApollo(Wrapper);

export const createNeoModule = (
  id: string,
  moduleName: string,
  props?: any,
) => {
  const container = document.getElementById(id);
  if (!container) throw new Error(`Could not get element by id: ${id}`);

  const root = createRoot(container);

  const unmountComponent = () => {
    root.unmount();
  };

  const renderModule = () => {
    if (process.env.NODE_ENV !== 'development') {
      // eslint-disable-next-line no-console
      console.log(
        `[Neo] renderModule ${moduleName} ${props ? `with props: ${JSON.stringify(props)}` : 'with no props'
        }`,
      );
    }

    if (moduleName === 'place') {
      return (
        <ApolloWrapper>
          <PlaceModule {...props} />
        </ApolloWrapper>
      );
    }

    if (moduleName === 'place-dialog') {
      const onClose = () => {
        unmountComponent();
      };

      return (
        <ApolloWrapper>
          <PlaceDialogModule onClose={onClose} {...props} />
        </ApolloWrapper>
      );
    }

    if (moduleName === 'messages') {
      return (
        <ApolloWrapper>
          <MessagesModule {...props} />
        </ApolloWrapper>
      );
    }

    if (moduleName === 'members') {
      return (
        <ApolloWrapper>
          <MembersModule {...props} />
        </ApolloWrapper>
      );
    }

    if (moduleName === 'membershipDialog') {
      return (
        <ApolloWrapper>
          <MembershipDialogModule {...props} />
        </ApolloWrapper>
      );
    }

    if (moduleName === 'groupMap') {
      return (
        <ApolloWrapper>
          <GroupMapModule {...props} />
        </ApolloWrapper>
      );
    }

    if (moduleName === 'userAccount') {
      return (
        <ApolloWrapper>
          <UserAccountModule {...props} />
        </ApolloWrapper>
      );
    }

    if (moduleName === 'editNotifications') {
      return (
        <ApolloWrapper>
          <EditNotificationsModule {...props} />
        </ApolloWrapper>
      );
    }

    if (moduleName === 'quitGroup') {
      return (
        <ApolloWrapper>
          <QuitGroupModule {...props} />
        </ApolloWrapper>
      );
    }

    if (moduleName === 'loginRegistration') {
      return (
        <ApolloWrapper>
          <LoginRegistrationModule {...props} />
        </ApolloWrapper>
      );
    }

    if (moduleName === 'loginAs') {
      return (
        <ApolloWrapper>
          <LoginAsModule {...props} />
        </ApolloWrapper>
      );
    }

    if (moduleName === 'classicContractAttendance') {
      return (
        <ApolloWrapper>
          <ClassicContractAttendanceModule {...props} />
        </ApolloWrapper>
      );
    }

    if (moduleName === 'imageUploaderDialog') {
      const onClose = () => {
        unmountComponent();
      };

      return (
        <ApolloWrapper>
          <ImageUploaderDialogModule onClose={onClose} {...props} />
        </ApolloWrapper>
      );
    }

    if (moduleName === 'variableContractAttendance') {
      return (
        <ApolloWrapper>
          <VariableContractAttendanceModule {...props} />
        </ApolloWrapper>
      );
    }

    if (moduleName === 'haxeDatePicker') {
      return (
        <Wrapper>
          <HaxeDatePicker {...props} />
        </Wrapper>
      );
    }

    if (moduleName === 'vatBox') {
      return (
        <Wrapper>
          <VatBox {...props} />
        </Wrapper>
      );
    }

    if (moduleName === 'deleteAccount') {
      return (
        <ApolloWrapper>
          <DeleteAccount {...props} />
        </ApolloWrapper>
      );
    }

    if (moduleName === 'csaCatalog') {
      return (
        <Wrapper showFallback={false}>
          <CsaCatalog {...props} />
        </Wrapper>
      );
    }

    if (moduleName === 'volunteersCalendar') {
      return (
        <Wrapper showFallback={false}>
          <VolunteersCalendar {...props} />
        </Wrapper>
      );
    }

    if (moduleName === 'groupDisabled') {
      return (
        <ApolloWrapper>
          <GroupDisabled {...props} />
        </ApolloWrapper>
      );
    }

    throw new Error(`Unknown module: ${moduleName}`);
  };

  root.render(<>{renderModule()}</>);
};
