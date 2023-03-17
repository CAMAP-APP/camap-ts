/* eslint-disable import/no-extraneous-dependencies */
import { ApolloProvider } from '@apollo/client';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import React from 'react';
import { useLoginMutation, useLogoutMutation, useMeQuery } from '../src/gql';
import initApolloClient from '../src/lib/initApollo';

const apolloClient = initApolloClient({});

const InnerLogin = () => {
  const [login, { loading: loginLoading }] = useLoginMutation();
  const [logout, { loading: logoutLoading }] = useLogoutMutation();
  const { loading: meloading, refetch } = useMeQuery();

  const [meName, setMeName] = React.useState<string>();

  const doRefetch = React.useCallback(async () => {
    try {
      const meData = await refetch();
      setMeName(meData?.data.me.firstName);
    } catch {
      setMeName(undefined);
    }
  }, [refetch]);

  React.useEffect(() => {
    doRefetch();
  }, [doRefetch]);

  const onLogoutClick = async () => {
    const { data } = await logout();
    if (data && data.logout) {
      doRefetch();
    }
  };

  const onLoginClick = async () => {
    let sid = '';
    const value = `; ${document.cookie}`;
    const parts = value.split(`; sid=`);
    if (parts && parts.length === 2) sid = parts.pop()!.split(';').shift()!;
    const { data } = await login({
      variables: {
        input: { email: 'admin@camap.net', password: 'admin', sid },
      },
    });
    if (data && data.login) {
      doRefetch();
    }
  };

  /** */
  if (meloading || loginLoading || logoutLoading) return <CircularProgress />;
  return (
    <Box>
      {meName ? (
        <>
          <Typography>{meName}</Typography>
          <Button variant="outlined" onClick={onLogoutClick}>
            Logout
          </Button>
        </>
      ) : (
        <Button variant="outlined" onClick={onLoginClick}>
          Login
        </Button>
      )}
    </Box>
  );
};

export const Login = () => {
  /** */

  return (
    <ApolloProvider client={apolloClient}>
      <InnerLogin />
    </ApolloProvider>
  );
};

export default {
  title: 'Debug',
};
