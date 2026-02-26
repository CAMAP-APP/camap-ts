import ApolloErrorAlert from '@components/utils/errors/ApolloErrorAlert';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
  useTheme,
} from '@mui/material';
import { formatUserName, UserLists, UserListsType } from 'camap-common';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { OtherAttachment, useGetMessageByIdLazyQuery } from '../../../gql';
import { formatAbsoluteDate } from '../../../utils/fomat';
import { PlateMessageViewer } from '../editor/PlateMessageViewer';

export interface MessageTableProps {
  messageId: number;
}

function getListName(listId: string): UserListsType | undefined {
  const lists = UserLists.getLists();

  const list = lists.find((l) => {
    return l.type === listId;
  });

  if (!list) return;

  return list && list.type;
}

const MessageTable = ({ messageId }: MessageTableProps) => {
  const { t } = useTranslation(['messages/default', 'members/lists']);
  const theme = useTheme();

  const [
    getMessageById,
    { data: messageData, loading: messageLoading, error: messageError },
  ] = useGetMessageByIdLazyQuery();

  React.useEffect(() => {
    getMessageById({
      variables: { id: messageId },
    });
  }, [getMessageById, messageId]);

  const message = messageData?.message;
  const listName =
    message?.recipientListId && getListName(message.recipientListId);

  const TableTitleCell = ({ title }: { title: string }) => (
    <TableCell
      align="right"
      sx={{
        whiteSpace: 'nowrap',
        width: {
          sm: '33%',
          md: '20%',
        },
      }}
    >
      {title}
    </TableCell>
  );

  const [parseError, setParseError] = useState<string | null>(null);
  const messageBody = React.useMemo(() => {
    // if (!message?.slateContent) return;
    // const parsed = getMessageEditorValueFromSlateContent(message.slateContent);
    // if (!parsed.ok) {
    //   setParseError(parsed.error);
    // }
    // return parsed.wrapper.value;
    return []
  }, [message?.slateContent, setParseError]);

  if (messageError) return <ApolloErrorAlert error={messageError} />;
  if (messageLoading) return <CircularProgress />;

  const isDynamicList = listName && UserLists.isDynamic(listName);

  const otherAttachments = message?.attachments?.filter(
    (a) => 'fileName' in a,
  ) as OtherAttachment[];

  return (
    <>
      {parseError && <Alert severity="error">{t('errorReusingMessage', { error: parseError })}</Alert>}
      {message && (
        <Table sx={{ tableLayout: 'fixed' }}>
          <TableBody>
            <TableRow>
              <TableTitleCell title={`${t('subject')} :`} />
              <TableCell>{message.title}</TableCell>
            </TableRow>
            <TableRow>
              <TableTitleCell title={`${t('sentOnThe')} :`} />
              <TableCell>
                {formatAbsoluteDate(new Date(message.date), true)}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableTitleCell title={`${t('sender')} :`} />
              <TableCell>
                {message.sender === null
                  ? 'inconnu'
                  : `${formatUserName(message.sender)}`}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableTitleCell
                title={`${t('receiver', {
                  count: message.recipients.length,
                })} :`}
              />
              {listName && !isDynamicList ? (
                <TableCell>{t(`members/lists:${listName}`)}</TableCell>
              ) : (
                <TableCell>
                  <Box display="flex" flexWrap="wrap">
                    {message.recipients.map((a) => (
                      <Box m={0.5} key={a}>
                        <Chip
                          label={a}
                          size={
                            theme.breakpoints.down('md') ? 'small' : 'medium'
                          }
                        />
                      </Box>
                    ))}
                  </Box>
                </TableCell>
              )}
            </TableRow>

            {otherAttachments && otherAttachments.length > 0 && (
              <TableRow>
                <TableTitleCell
                  title={`${t('attachment', {
                    count: otherAttachments.length,
                  })} :`}
                />
                <TableCell>
                  <Box display="flex" flexWrap="wrap">
                    {otherAttachments.map((r: OtherAttachment) => (
                      <Box m={0.5} key={r.fileName} maxWidth="100%">
                        <Tooltip title={`${t('attachmentsNotStoredOnServer')}`}>
                          <Chip
                            size={
                              theme.breakpoints.down('md') ? 'small' : 'medium'
                            }
                            label={r.fileName}
                            sx={{ maxWidth: '100%' }}
                          />
                        </Tooltip>
                      </Box>
                    ))}
                  </Box>
                </TableCell>
              </TableRow>
            )}

            <TableRow>
              <TableCell colSpan={2}>
                {messageBody && <PlateMessageViewer value={messageBody as any} />}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )}
    </>
  );
};

export default MessageTable;
