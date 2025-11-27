import ApolloErrorAlert from '@components/utils/errors/ApolloErrorAlert';
import {
  Box,
  CircularProgress,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Select,
} from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useInitMembersQuery } from '../../../gql';
import { formatUserList } from '../../../utils/fomat';
import { MembersContext } from '../MembersContext';

const MemberLists = ({
  variant
}: {
  variant: "block" | "dropdown"
}) => {
  const { t } = useTranslation(['members/lists', 'members/default']);
  const { groupId, toggleRefetch, selectedUserList, onSelectList } =
    React.useContext(MembersContext);
  const { data, loading, error, refetch } = useInitMembersQuery({
    variables: { groupId },
  });

  const otherLists = data?.getUserLists;

  React.useEffect(() => {
    if (toggleRefetch === undefined) return;
    if (refetch) refetch();
  }, [toggleRefetch, refetch]);

  React.useEffect(() => {
    if (!data || data.getUserLists === undefined) return;
    if (toggleRefetch !== undefined) {
      const refreshedUserList = data.getUserLists.find(
        (ul) => ul.type === selectedUserList.type,
      );
      if (refreshedUserList) onSelectList(refreshedUserList);
    } else if(selectedUserList === undefined) {
      // First render
      const allUserList = data.getUserLists.find((ul) => ul.type === 'all');
      if (allUserList) onSelectList(allUserList);
    }
  }, [data, onSelectList, selectedUserList, toggleRefetch]);

  if (error) return <ApolloErrorAlert error={error} />;

  if(variant === "dropdown") {
    const selectedI = otherLists?.indexOf(selectedUserList) ?? 0
    if(!otherLists || otherLists.length === 0) return;
    return <Select
      sx={{
        height: 48,
      }}
      value={Math.max(selectedI, 0)}
      onChange={(e) => otherLists && onSelectList(otherLists[parseInt(''+e.target.value)])}
    >{otherLists?.map((ul, i) => (
      <MenuItem
        key={`${ul.type}${ul.data}`}
        value={i}
      >
        {formatUserList(ul, t)}
      </MenuItem>
    ))}</Select>
  }

  return (
    <Box>
      <Box
        maxHeight="770px"
        display="flex"
        justifyContent="center"
        sx={{ overflowY: 'auto' }}
        p={0}
      >
        {loading ? (
          <Box p={1}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <List sx={{ width: '100%', p: 0 }} dense>
              {otherLists?.map((ul) => (
                <ListItemButton
                  divider
                  key={`${ul.type}${ul.data}`}
                  selected={
                    selectedUserList.type === ul.type &&
                    selectedUserList.data === ul.data
                  }
                  onClick={() => onSelectList(ul)}
                >
                  <ListItemText
                    primary={formatUserList(ul, t)}
                  />
                </ListItemButton>
              ))}
            </List>
          </>
        )}
      </Box>
    </Box>
  );
};

export default MemberLists;
