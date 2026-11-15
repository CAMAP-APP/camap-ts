import React from 'react';
import { ApolloError } from '@apollo/client';
import { useLocation } from 'react-router-dom';
import { User, UserList, useInitMembersQuery } from '../../gql';
import { useProgressiveUserLists } from '../../utils/userLists/useProgressiveUserLists';

interface MembersContextProviderProps {
  groupId: number;
  token: string;
}

export type Recipient = Partial<User>;

interface MembersContextProps extends MembersContextProviderProps {
  errors: string[];
  setErrors: (errors: string[]) => void;
  success: string | undefined;
  setSuccess: (success: string | undefined) => void;
  toggleRefetch: boolean | undefined;
  setToggleRefetch: (toggleRefetch: boolean) => void;
  resetAlerts: () => void;
  selectedUserList: UserList;
  onSelectList: (userList: UserList) => void;
  userLists?: UserList[];
  userListsLoading: boolean;
  userListsError?: ApolloError;
}

const DEFAULT_USER_LIST: UserList = {
  type: 'all',
  data: null,
};

export const MembersContext = React.createContext<MembersContextProps>({
  groupId: -1,
  token: '',
  errors: [],
  setErrors: () => {},
  success: undefined,
  setSuccess: () => {},
  toggleRefetch: undefined,
  setToggleRefetch: () => {},
  resetAlerts: () => {},
  selectedUserList: DEFAULT_USER_LIST,
  onSelectList: () => {},
  userListsLoading: true,
});

const MembersContextProvider = ({
  children,
  groupId,
  token,
}: { children: React.ReactNode } & MembersContextProviderProps) => {
  const [errors, setErrors] = React.useState<string[]>([]);
  const [success, setSuccess] = React.useState<string | undefined>();
  const [toggleRefetch, setToggleRefetch] = React.useState<boolean>();
  const [selection, setSelectedUserList] =
    React.useState<UserList>(DEFAULT_USER_LIST);
  const { pathname } = useLocation();
  const enabled = pathname === '/';
  const { data, loading, error } = useInitMembersQuery({
    variables: { groupId },
    skip: !enabled,
  });
  const { lists: userLists, error: countsError } = useProgressiveUserLists(
    groupId,
    enabled ? data?.getUserLists : undefined,
    toggleRefetch,
  );
  const selectedUserList =
    userLists?.find(
      (list) => list.type === selection.type && list.data === selection.data,
    ) ??
    userLists?.[0] ??
    selection;

  const onSelectList = (userList: UserList) => setSelectedUserList(userList);

  const resetAlerts = () => {
    setErrors([]);
    setSuccess(undefined);
  };

  /** */
  return (
    <MembersContext.Provider
      value={{
        groupId,
        token,
        errors,
        setErrors,
        success,
        setSuccess,
        toggleRefetch,
        setToggleRefetch,
        resetAlerts,
        selectedUserList,
        onSelectList,
        userLists,
        userListsLoading: loading,
        userListsError: error || countsError,
      }}
    >
      {children}
    </MembersContext.Provider>
  );
};

export default MembersContextProvider;
