import { Box, Grid, Paper, Tooltip, Typography } from '@mui/material';
import { Colors } from '@theme/commonPalette';
import React from 'react';
import AlertError from '../../components/utils/AlertError';
import CamapIcon, { CamapIconId } from '../../components/utils/CamapIcon';
import CamapLink from '../../components/utils/CamapLink';
import { useIsGroupAdminQuery } from '../../gql';
import { useCamapTranslation } from '../../utils/hooks/use-camap-translation';
import MessagingService from './containers/MessagingService';
import SentMessageList from './containers/SentMessageList';
import Message from './Message';
import MessagesContextProvider from './MessagesContext';

const DOC_LINK = 'https://wiki.amap44.org/fr/app/la-messagerie';

export interface MessagesProps {
  groupId: number;
  whichUser: boolean;
}

const Messages = ({ groupId, whichUser }: MessagesProps) => {
  if (typeof groupId !== 'number')
    throw new Error('MessagesModule requires a groupId');
  if (typeof whichUser !== 'boolean')
    throw new Error('MessagesModule requires whichUser');
  const { t, tCommon, tErrors } = useCamapTranslation({
    t: 'messages/default',
    tCommon: 'translation',
    tList: 'members/lists',
    tErrors: 'errors',
  });

  const [selectedMessageId, setSelectedMessageId] = React.useState<number>();
  const [toggleRefetch, setToggleRefetch] = React.useState<boolean>();
  const toggleRefetchRef = React.useRef<boolean>();

  const { data: isGroupAdminData, error } = useIsGroupAdminQuery({
    variables: { groupId },
  });
  const isGroupAdmin = isGroupAdminData?.isGroupAdmin;

  const [unexpectedUnauthorizedError, setUnexpectedUnauthorizedError] =
    React.useState<boolean>(false);
  React.useEffect(() => {
    if (!error) return;
    if (error.message === 'Unauthorized') {
      setUnexpectedUnauthorizedError(true);
    }
  }, [error]);

  const onSelectMessage = (messageId: number) => {
    window.scroll({
      top: 0,
      behavior: 'smooth',
    });
    setSelectedMessageId(messageId);
  };
  const onUnselectMessage = () => setSelectedMessageId(undefined);
  const onMessageSent = () => {
    toggleRefetchRef.current = !toggleRefetchRef.current;
    setToggleRefetch(!toggleRefetchRef.current);
  };

  if (unexpectedUnauthorizedError)
    return (
      <Box p={2}>
        <AlertError message={tErrors('unexpectedUnauthorized')} />
      </Box>
    );

  /** */
  return (
    <MessagesContextProvider groupId={groupId} whichUser={Boolean(whichUser)}>
      <Box mb={2}>
        <Grid container spacing={4}>
          <Grid
            item
            sm={3}
            xs={12}
            sx={{
              order: {
                xs: 1,
                sm: 'initial',
              },
            }}
          >
            <Paper>
              <Box p={{ xs: 0, sm: 2 }}>
                <Box pr={2} pl={2} pt={{ xs: 1, sm: 0 }}>
                  <Typography variant="h6">
                    {isGroupAdmin
                      ? t('allSentMessages')
                      : t('lastSentMessages')}
                  </Typography>
                </Box>
                <SentMessageList
                  isGroupAdmin={isGroupAdmin}
                  selectedMessageId={selectedMessageId}
                  onSelectMessage={onSelectMessage}
                  toggleRefetch={toggleRefetch}
                />
              </Box>
            </Paper>
          </Grid>
          <Grid item sm={9} xs={12}>
            <Paper>
              <Box p={{ xs: 1, sm: 2 }}>
                {selectedMessageId ? (
                  <Message
                    messageId={selectedMessageId}
                    onBack={onUnselectMessage}
                  />
                ) : (
                  <>
                    <Box
                      pr={2}
                      pl={2}
                      pt={{ xs: 1, sm: 0 }}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="h3">{t('title')}</Typography>

                      <Tooltip title={`${tCommon('knowMore')}`} arrow>
                        <div>
                          <CamapLink
                            href={DOC_LINK}
                            target="_blank"
                            underline="none"
                            sx={{
                              '&:focus,&:hover': {
                                textDecoration: 'none',
                              },
                            }}
                          >
                            <CamapIcon
                              id={CamapIconId.info}
                              sx={{ color: Colors.brandPrimary }}
                            />
                          </CamapLink>
                        </div>
                      </Tooltip>
                    </Box>
                    <MessagingService onMessageSent={onMessageSent} />
                  </>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </MessagesContextProvider>
  );
};

export default React.memo(Messages, () => true);
