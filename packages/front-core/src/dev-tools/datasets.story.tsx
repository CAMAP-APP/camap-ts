/* eslint-disable i18next/no-literal-string */
import { useApolloClient } from '@apollo/client';
import BugReportIcon from '@mui/icons-material/BugReport';
import PersonIcon from '@mui/icons-material/Person';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import {
  Alert,
  AppBar,
  Box,
  IconButton,
  LinearProgress,
  Toolbar,
  Typography,
} from '@mui/material';
import React from 'react';
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  UseMutationResult,
  useQuery,
} from 'react-query';
import { useLoginMutation, useLogoutMutation, useMeQuery } from '../gql';
import { getCookie, setCookie } from '../utils/cookie';

export interface DatasetProviderProps {
  children: React.ReactNode;
  extendedToolbar?: React.ReactNode;
  islet: string;
  resetApolloStore?: boolean;
  withToolbar?: boolean;
  loginAs?: (data: any) => string;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchInterval: false,
      retry: false,
      cacheTime: 0,
    },
  },
});

const DatasetContext = React.createContext<
  { data: any; mutation: UseMutationResult } | undefined
>(undefined);

const ApolloStoreReseter = ({ data }: { data: any }) => {
  const client = useApolloClient();

  React.useEffect(() => {
    client.resetStore();
  }, [data, client]);

  return <></>;
};

const DatasetToolbar = ({
  islet,
  loading,
  logged,
  extendedToolbar,
  onRefreshClick,
}: {
  islet: string;
  loading: boolean;
  logged?: string;
  extendedToolbar?: React.ReactNode;
  onRefreshClick: () => void;
}) => {
  /** */
  return (
    <>
      <AppBar
        position="relative"
        sx={{ mb: extendedToolbar ? 0 : 4 }}
        // id={PAGE_HEADER_ID}
      >
        <Toolbar>
          <BugReportIcon />
          <Box sx={{ ml: 1 }}>
            <Typography>{islet}</Typography>
          </Box>

          <Box
            sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
              {logged && <PersonIcon sx={{ mr: 1 }} />}
              <Typography>{logged || 'not logged'}</Typography>
            </Box>

            <IconButton
              color="inherit"
              disabled={loading}
              onClick={onRefreshClick}
            >
              <RestartAltIcon color="inherit" />
            </IconButton>
          </Box>
        </Toolbar>

        {loading && (
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: 4,
            }}
          >
            <LinearProgress />
          </Box>
        )}
      </AppBar>
      {extendedToolbar && <Box sx={{ mb: 4 }}>{extendedToolbar}</Box>}
    </>
  );
};

const Provider = ({
  children,
  extendedToolbar,
  islet,
  resetApolloStore = false,
  withToolbar = true,
  loginAs,
}: DatasetProviderProps) => {
  // const [refetcher, setRefetcher] = React.useState(0);
  const refreshIslet = React.useRef(false);
  const needReRender = React.useRef(false);
  const [preRendering, setPreRendering] = React.useState(false);
  const {
    data,
    error: fetchError,
    isLoading,
    refetch,
  } = useQuery([islet], async () => {
    return fetch(
      `http://localhost:6007/islets/${islet}?refresh=${
        refreshIslet.current ? 'true' : 'false'
      }`,
    ).then((res) => res.json());
  });
  const apolloClient = useApolloClient();
  const {
    data: meData,
    loading: meLoading,
    error: meError,
  } = useMeQuery({ skip: !Boolean(getCookie('Refresh')) });
  const [login, { loading: loginLoading, error: loginError }] =
    useLoginMutation();
  const [logout, { loading: logoutLoading, error: logoutError }] =
    useLogoutMutation();
  const mutation = useMutation((props: any) =>
    fetch(`http://localhost:6007/islets/${islet}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(props),
    }),
  );

  const loading =
    isLoading || meLoading || loginLoading || logoutLoading || preRendering;
  // || mutation.isLoading;
  const error = fetchError || meError || loginError || logoutError;

  /** */
  const handleRefreshClick = async () => {
    refreshIslet.current = true;
    await refetch();
  };

  /** */
  React.useEffect(() => {
    const run = async () => {
      if (loginAs) {
        await fetch('http://localhost/api/createSid')
          .then((res) => res.json())
          .then((res) => {
            setCookie('sid', res.sid);
          });

        await login({
          variables: {
            input: {
              email: loginAs(data),
              password: 'admin',
              sid: getCookie('sid') || '',
            },
          },
        });
        await apolloClient.resetStore();
      } else {
        await logout();
        await apolloClient.clearStore();
      }
    };

    if (!data) {
      return;
    }

    run();
  }, [data, loginAs, login, logout, apolloClient]);

  React.useEffect(() => {
    if (mutation.isLoading) {
      needReRender.current = true;
    } else if (needReRender.current) {
      setPreRendering(true);
      setTimeout(() => {
        setPreRendering(false);
      }, 10);

      needReRender.current = false;
    }
  }, [mutation, needReRender]);

  /** */
  return (
    <DatasetContext.Provider
      value={{
        data,
        mutation,
      }}
    >
      {resetApolloStore && <ApolloStoreReseter data={data} />}

      {withToolbar && (
        <DatasetToolbar
          extendedToolbar={extendedToolbar}
          islet={islet}
          loading={loading}
          logged={meData?.me.email}
          onRefreshClick={handleRefreshClick}
        />
      )}

      {error && <Alert severity="error">Error</Alert>}
      {!error && !loading && data && children}
    </DatasetContext.Provider>
  );
};

export const DatasetProvider = (props: DatasetProviderProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider {...props} />
    </QueryClientProvider>
  );
};

export const useDataset = () => {
  const ctx = React.useContext(DatasetContext);
  if (!ctx) {
    throw new Error('');
  }
  return ctx;
};
