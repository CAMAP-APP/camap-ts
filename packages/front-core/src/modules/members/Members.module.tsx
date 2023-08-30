import { Box, Button, Grid, Paper, Typography } from '@mui/material';
import { CaveaRouter } from '@utils/cavea-router';
import { useTranslation } from 'react-i18next';
import { Route, Routes } from 'react-router-dom';
import MembersAlert from './components/MembersAlert';
import ImportMembers from './containers/ImportMembers';
import ImportOneMember from './containers/ImportOneMember';
import MemberLists from './containers/MemberLists';
import MembersTableAndActions from './containers/MembersTableAndActions';
import MembersContextProvider from './MembersContext';

export interface MembersProps {
  groupId: number;
  token: string;
}

const Members = ({ groupId, token }: MembersProps) => {
  const { t } = useTranslation([
    'members/default',
    'members/lists',
    'membership/default',
    'translation',
  ]);

  /** */
  return (
    <MembersContextProvider groupId={groupId} token={token}>
      <CaveaRouter>
        <Routes>
          <Route path="/import" element={<ImportMembers />} />
          <Route path="/insert" element={<ImportOneMember />} />
          <Route
            path="/"
            element={
              <Box mb={2}>
                <MembersAlert />
                <Grid container spacing={4}>
                  <Grid item md={9} xs={12}>
                    <MembersTableAndActions />
                  </Grid>
                  <Grid item md={3} xs={12}>
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
                      <Grid item>
                        <Paper>
                          <Box p={2}>
                            <Typography variant="h6">{t('lists')}</Typography>
                            <MemberLists />
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
      </CaveaRouter>
    </MembersContextProvider>
  );
};

export default Members;
