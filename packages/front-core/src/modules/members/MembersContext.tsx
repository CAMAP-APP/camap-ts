import React from 'react';
import { User, UserList } from '../../gql';

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
});

const MembersContextProvider = ({
  children,
  groupId,
  token,
}: { children: React.ReactNode } & MembersContextProviderProps) => {
  const [errors, setErrors] = React.useState<string[]>([]);
  const [success, setSuccess] = React.useState<string | undefined>();
  const [toggleRefetch, setToggleRefetch] = React.useState<boolean>();
  const [selectedUserList, setSelectedUserList] = React.useState<UserList>(DEFAULT_USER_LIST);

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
      }}
    >
      {children}
    </MembersContext.Provider>
  );
};

export default MembersContextProvider;
