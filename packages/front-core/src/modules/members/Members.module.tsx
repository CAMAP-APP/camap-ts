import { Box, Button, Grid, Paper, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MembersAlert from './components/MembersAlert';
import ImportMembers from './containers/ImportMembers';
import ImportOneMember from './containers/ImportOneMember';
import MemberLists from './containers/MemberLists';
import MembersTableAndActions from './containers/MembersTableAndActions';
import MembersContextProvider from './MembersContext';
import { reactRouterDefaultProps } from 'react-router-config';

export interface MembersProps {
  groupId: number;
  token: string;
  basePath: string;
}

const Members = ({ groupId, token, basePath }: MembersProps) => {
  const { t } = useTranslation([
    'members/default',
    'members/lists',
    'membership/default',
    'translation',
  ]);

  /** */
  return (
    <MembersContextProvider groupId={groupId} token={token}>
      <BrowserRouter {...reactRouterDefaultProps} basename={basePath}>
        <Routes>
          <Route path="/import" element={<ImportMembers />} />
          <Route path="/insert" element={<ImportOneMember />} />
          <Route
            path="/"
            element={
              <Box mb={2}>
                <MembersAlert />
                <Grid container spacing={4}>
                  <Grid item xl={9} xs={12}>
                    <MembersTableAndActions />
                  </Grid>
                  <Grid item xl={3} xs={12}>
                    <Grid container spacing={2} direction="column">
                      <Grid item>
                        <Paper>
                          <Box p={2}>
                            <Button
                              variant="outlined"
                              href="/member/balance"
                              sx={{ width: '100%' }}
                            >
                              {t('membersBalance')}
                            </Button>
                          </Box>
                        </Paper>
                      </Grid>
                      <Grid item display={{ "xs": "none", "xl": "block" }}>
                        <Paper>
                          <Box py={2}>
                            <Typography sx={{mx: 2}} variant="h6">{t('lists')}</Typography> 
                            <MemberLists variant='block' />
                          </Box>
                        </Paper>
                      </Grid>

                    </Grid>
                  </Grid>
                </Grid>
              </Box>
            }
          />
        </Routes>
      </BrowserRouter>
    </MembersContextProvider>
  );
};

export default Members;
