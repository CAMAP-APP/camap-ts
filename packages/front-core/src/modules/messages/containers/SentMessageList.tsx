import {
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Pagination,
  Typography,
} from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Message,
  useGetMessagesForGroupLazyQuery,
  useGetUserMessagesForGroupLazyQuery,
} from '../../../gql';
import { formatDate } from '../../../utils/fomat';
import { MessagesContext } from '../MessagesContext';

export interface SentMessageListProps {
  isGroupAdmin: boolean | undefined;
  selectedMessageId: number | undefined;
  onSelectMessage: (messageId: number) => void;
  toggleRefetch: boolean | undefined;
}

const NUMBER_OF_MESSAGE_PER_PAGE = 11;

const SentMessageList = ({
  isGroupAdmin,
  selectedMessageId,
  onSelectMessage,
  toggleRefetch,
}: SentMessageListProps) => {
  const context = React.useContext(MessagesContext);
  const { t } = useTranslation(['messages/default']);
  const { groupId } = context;
  const [
    getAllMessages,
    {
      data: allMessages,
      loading: loadingMessages,
      refetch: refetchAllMessages,
    },
  ] = useGetMessagesForGroupLazyQuery({
    variables: { groupId },
  });
  const [
    getUserMessages,
    { data: userMessages, refetch: refetchUserMessages },
  ] = useGetUserMessagesForGroupLazyQuery({
    variables: { groupId },
  });

  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    if (isGroupAdmin === undefined) return;
    if (isGroupAdmin) {
      getAllMessages();
    } else {
      getUserMessages();
    }
  }, [isGroupAdmin]);

  React.useEffect(() => {
    if (toggleRefetch === undefined) return;
    if (isGroupAdmin) {
      if (refetchAllMessages) refetchAllMessages();
    } else if (refetchUserMessages) refetchUserMessages();
  }, [toggleRefetch]);

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    setCurrentPage(value);
  };

  let messages: Array<Pick<Message, 'id' | 'title' | 'date'>> = [];
  let maxPage = 1;
  let startIndex = 0;
  let endIndex = 0;
  if (isGroupAdmin !== undefined) {
    if (isGroupAdmin && !!allMessages) {
      messages = allMessages.getMessagesForGroup;
    } else if (!isGroupAdmin && !!userMessages) {
      messages = userMessages.getUserMessagesForGroup;
    }
    maxPage = Math.ceil(messages.length / NUMBER_OF_MESSAGE_PER_PAGE);
    startIndex = (currentPage - 1) * (NUMBER_OF_MESSAGE_PER_PAGE - 1);
    endIndex = Math.min(
      startIndex + NUMBER_OF_MESSAGE_PER_PAGE - 1,
      messages.length,
    );
  }

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="center"
        sx={{
          overflowY: 'auto',
        }}
      >
        {loadingMessages ? (
          <Box p={1}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {messages.length > 0 ? (
              <List
                sx={{
                  flex: 1,
                }}
              >
                {messages.slice(startIndex, endIndex).map((m) => (
                  <ListItem
                    button
                    divider
                    key={m.id}
                    selected={selectedMessageId === m.id}
                    onClick={() => onSelectMessage(m.id)}
                  >
                    <ListItemText
                      sx={{
                        '& p:first-letter': {
                          textTransform: 'capitalize',
                        },
                      }}
                      primary={m.title}
                      secondary={formatDate(new Date(m.date), true)}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="caption" align="center">
                {t('noMessage')}
              </Typography>
            )}
          </>
        )}
      </Box>
      <Box p={{ xs: 1, sm: 0 }}>
        <Pagination
          count={maxPage}
          page={currentPage}
          onChange={handlePageChange}
          sx={{
            '& ul': {
              justifyContent: 'center',
              flexWrap: 'initial',
            },
            paddingTop: 1,
          }}
        />
      </Box>
    </Box>
  );
};

export default SentMessageList;
