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

const Wrapper = ({
  children,
  showFallback = true,
}: {
  children: React.ReactNode;
  showFallback?: boolean;
}) => {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={LocalizedUtils} adapterLocale={frLocale}>
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

const modules: Record<string, {
  module: React.LazyExoticComponent<any>;
  wrapper?: React.ComponentType<any>;
  props?: Record<string, any>;
}> = {
  batchOrder: {
    module: React.lazy(() => import('./modules/batchOrder/BatchOrder.module')),
    wrapper: ApolloWrapper
  },
  classicContractAttendance: {
    module: React.lazy(() => import('./modules/csaAttendanceSheet/ClassicContractAttendanceModule')),
    wrapper: ApolloWrapper
  },
  csaCatalog: {
    module: React.lazy(() => import('./modules/csaCatalog/CsaCatalog.module')),
    props: { showFallback: false }
  },
  csaCatalogSubscription: {
    module: React.lazy(() => import('./modules/csaCatalog/CsaCatalogSubscription.module')),
    props: { showFallback: false }
  },
  deleteAccount: {
    module: React.lazy(() => import('./modules/users/DeleteAccountModule/DeleteAccount.module')),
    wrapper: ApolloWrapper
  },
  editNotifications: {
    module: React.lazy(() => import('./modules/users/EditNotifications/EditNotifications.module')),
    wrapper: ApolloWrapper
  },
  groupDisabled: {
    module: React.lazy(() => import('./modules/groupDisabled/GroupDisabled.module')),
    wrapper: ApolloWrapper
  },
  groupMap: {
    module: React.lazy(() => import('./modules/groupMap/GroupMap.module')),
    wrapper: ApolloWrapper
  },
  haxeDatePicker: {
    module: React.lazy(() => import('./modules/haxe-date-picker/HaxeDatePicker'))
  },
  imageUploaderDialog: {
    module: React.lazy(() => import('./modules/imageUploader/ImageUploader.module')),
    wrapper: ApolloWrapper
  },
  loginAs: {
    module: React.lazy(() => import('./modules/loginRegistration/LoginAs.module')),
    wrapper: ApolloWrapper
  },
  loginRegistration: {
    module: React.lazy(() => import('./modules/loginRegistration/LoginRegistration.module')),
    wrapper: ApolloWrapper
  },
  members: {
    module: React.lazy(() => import('./modules/members/Members.module')),
    wrapper: ApolloWrapper
  },
  membershipDialog: {
    module: React.lazy(() => import('./modules/membership/MembershipDialog.module')),
    wrapper: ApolloWrapper
  },
  messages: {
    module: React.lazy(() => import('./modules/messages/Messages.module')),
    wrapper: ApolloWrapper
  },
  place: {
    module: React.lazy(() => import('./modules/places/PlaceModule')),
    wrapper: ApolloWrapper
  },
  'place-dialog': {
    module: React.lazy(() => import('./modules/places/PlaceDialogModule')),
    wrapper: ApolloWrapper
  },
  quitGroup: {
    module: React.lazy(() => import('./modules/users/QuitGroup/QuitGroup.module')),
    wrapper: ApolloWrapper
  },
  userAccount: {
    module: React.lazy(() => import('./modules/users/UserAccountModule/user-account.module')),
    wrapper: ApolloWrapper
  },
  variableContractAttendance: {
    module: React.lazy(() => import('./modules/csaAttendanceSheet/VariableContractAttendanceModule')),
    wrapper: ApolloWrapper
  },
  vatBox: {
    module: React.lazy(() => import('./modules/vatBox/VatBox.module'))
  },
  vendorHomeWidget: {
    module: React.lazy(() => import('./modules/vendorDashboard/VendorHomeWidget.module'))
  },
  volunteersCalendar: {
    module: React.lazy(() => import('./modules/volunteersCalendar/VolunteersCalendar.module')),
    props: { showFallback: false }
  }
};

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

    if(!(moduleName in modules)) {
      throw new Error(`Unknown module: ${moduleName}`);
    }

    const moduleConfig = modules[moduleName as keyof typeof modules];

    const { module: ModuleComponent, wrapper: WrapperComponent = Wrapper, props: moduleProps = {} } = moduleConfig;
    
    const enhancedProps = { ...moduleProps, ...props };
    if (
        moduleName === 'place-dialog' ||
        moduleName === 'imageUploaderDialog'
    ) {
      enhancedProps.onClose = () => {
        unmountComponent();
      };
    }

    return (
      <WrapperComponent>
        <ModuleComponent {...enhancedProps} />
      </WrapperComponent>
    );
  };

  root.render(<>{renderModule()}</>);
};
