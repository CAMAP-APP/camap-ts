import React from 'react';
import { useMeQuery, User } from '@gql';
import CircularProgressBox from '@components/utils/CircularProgressBox';
import ApolloErrorAlert from '@components/utils/errors/ApolloErrorAlert';

interface AuthContextValues {
  me: User;
}

export const AuthContext = React.createContext<AuthContextValues | null>(null);

export const withAuthProvider = <T extends {}>(Component: React.ComponentType<T>) => {
  const Wrapper = (props: T) => {
    const { data, loading, error } = useMeQuery();

    if (error) return <ApolloErrorAlert error={error} />;
    if (loading || !data?.me) return <CircularProgressBox />;
    return (
      <AuthContext.Provider value={{ me: data.me as User }}>
        <Component {...props} />
      </AuthContext.Provider>
    );
  };
  return Wrapper;
};

export const useAuthContext = () => {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within a AuthContext.Provider');
  return ctx;
};
