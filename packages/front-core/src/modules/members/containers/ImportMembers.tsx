import { LoadingButton } from '@mui/lab';
import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  Switch,
  Typography,
} from '@mui/material';
import { addressSchema, formatFirstName, formatLastName, phoneSchema, userSchema } from 'camap-common';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ValidationError } from 'yup';
import AlertError from '../../../components/utils/AlertError';
import CamapLink from '../../../components/utils/CamapLink';
import CircularProgressBox from '../../../components/utils/CircularProgressBox';
import ConfirmDialog from '../../../components/utils/ConfirmDialog';
import DropzoneArea from '../../../components/utils/DropzoneArea/DropzoneArea';
import ApolloErrorAlert from '../../../components/utils/errors/ApolloErrorAlert';
import {
  ImportAndCreateMembersMutation,
  SendInvitesToNewMembersMutation,
  useGetUsersFromEmailsLazyQuery,
  useImportAndCreateMembersMutation,
  useSendInvitesToNewMembersMutation,
} from '../../../gql';
import { useCamapTranslation } from '../../../utils/hooks/use-camap-translation';
import ImportMembersTables from '../components/ImportMembersTables';
import { MembersContext } from '../MembersContext';

const SPLIT_REGEX_WITH_COMMA = /,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/;
const SPLIT_REGEX_WITH_SEMICOLON = /;(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/;

const ImportMembers = () => {
  const { t, tCommon } = useCamapTranslation({
    t: 'members/import',
    tCommon: 'translation',
  });
  const navigate = useNavigate();
  const { groupId } = React.useContext(MembersContext);

  const [
    getUsersFromEmails,
    { data, error: getUsersError, loading: getUsersLoading },
  ] = useGetUsersFromEmailsLazyQuery();

  const [
    sendInvitesToNewMembersMutation,
    {
      data: sendInvitesData,
      loading: sendInvitesLoading,
      error: sendInvitesError,
    },
  ] = useSendInvitesToNewMembersMutation();
  const [
    importAndCreateMembersMutation,
    {
      data: importAndCreateData,
      loading: importAndCreateLoading,
      error: importAndCreateError,
    },
  ] = useImportAndCreateMembersMutation();

  const [users, setUsers] = React.useState<string[][]>([]);
  const [errors, setErrors] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [loadedFileName, setLoadedFileName] = React.useState<string>();
  const [accountCreationModeChecked, setAccountCreationModeChecked] =
    React.useState<boolean>(false);
  const [accountCreationConsent, setAccountCreationConsent] =
    React.useState<boolean>(false);

  const [finalisedDialogOpen, openFinalisedDialog] = React.useState(false);
  const [alreadyMembersEmails, setAlreadyMembersEmails] = React.useState<
    string[]
  >([]);

  const headers = React.useMemo(() => {
    return [
      tCommon('firstName'),
      tCommon('lastName'),
      tCommon('email'),
      tCommon('phone'),
      tCommon('firstName2'),
      tCommon('lastName2'),
      tCommon('email2'),
      tCommon('phone2'),
      tCommon('address1'),
      tCommon('address2'),
      tCommon('zipCode'),
      tCommon('city'),
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { registeredUser, unregisteredUser } = React.useMemo(() => {
    if (!data?.getUsersFromEmails || !users.length) {
      return { registeredUser: undefined, unregisteredUser: undefined };
    }

    const registered = users.filter((u) => {
      const email1 = u[2];
      const email2 = u[6];
      return (
        data?.getUsersFromEmails.findIndex(
          (r) =>
            r.email === email1 ||
            (email2 && (r.email === email2 || r.email2 === email2)) ||
            (r.email2 && r.email2 === email1),
        ) !== -1
      );
    });

    const unregistered = users.filter((u) => !registered.includes(u));

    setLoading(false);
    return { registeredUser: registered, unregisteredUser: unregistered };
  }, [data, users]);

  React.useEffect(() => {
    if (!getUsersError && !getUsersLoading) return;

    setLoading(false);
  }, [getUsersLoading, getUsersError]);

  const onFileLoad = async (files: File[]) => {
    if (files.length !== 1) return;

    setLoading(true);
    const file = files[0];
    setLoadedFileName(file.name);
    processCSV(await file.text());
  };

  const getDropRejectMessage = (rejectedFile: File) => {
    return t('dropzone.dropReject', {
      fileName: rejectedFile.name,
    });
  };

  const processCSV = async (dataString: string) => {
    const dataStringLines = dataString.split(/\r\n|\n/);
    const newErrors: string[] = [];
    const list: string[][] = [];

    try {
      const nbOfComma = dataStringLines[0].split(',').length - 1;
      const nbOfSemicolon = dataStringLines[0].split(';').length - 1;
      const splitWithComma = nbOfComma >= nbOfSemicolon;

      dataStringLines.forEach((dataStringLine, index) => {
        const row = dataStringLine
          .split(
            splitWithComma
              ? SPLIT_REGEX_WITH_COMMA
              : SPLIT_REGEX_WITH_SEMICOLON,
          )
          .slice(0, headers.length);

        if (index === 0) {
          return;
        }

        if (row.length !== headers.length) return;

        // Remove CSV's quotes string separator
        const user = row.map((r) => r.replace(/^"|"$/g, ''));

        // Check nom+prenom
        if (!user[0] || !user[1]) {
          newErrors.push(t('errors.youShouldSetNames', { user }));
        }
        if (!user[2]) {
          newErrors.push(
            t('errors.shouldHaveEmail', {
              firstName: user[0],
              lastName: user[1],
            }),
          );
        }
        // First letter uppercase name
        if (user[1]) user[1] = formatLastName(user[1].trim()); // lastName
        if (user[5]) user[5] = formatLastName(user[5].trim()); // lastName2
        if (user[0]) user[0] = formatFirstName(user[0].trim()); // firstName
        if (user[4]) user[4] = formatFirstName(user[4].trim()); // firstName2
        // Lowercase email
        if (user[2]) {
          user[2] = user[2].toLowerCase().trim();
        }
        if (user[6]) {
          user[6] = user[6].toLowerCase().trim();
        }
        // Trim other strings
        if (user[3]) user[3] = user[3].replace(/\s/g, '');
        if (user[7]) user[7] = user[7].replace(/\s/g, '');
        if (user[8]) user[8] = user[8].trim();
        if (user[11]) user[11] = user[11].trim();

        // Sometimes the leading 0 of the phone number is removed by the spreasheet software
        if (user[3] && user[3].length === 9) user[3] = `0${user[3]}`;
        if (user[7] && user[7].length === 9) user[7] = `0${user[7]}`;

        // Validate other fields
        try {
          let validationSchema = userSchema;
          if (user[3]) validationSchema = validationSchema.concat(phoneSchema);
          if (user[10] || user[8] || user[11])
            validationSchema = validationSchema.concat(addressSchema);
          validationSchema.validateSync({
            firstName: user[0],
            lastName: user[1],
            email: user[2],
            phone: user[3],
            firstName2: user[4],
            lastName2: user[5],
            email2: user[6],
            phone2: user[7],
            address1: user[8],
            zipCode: user[10],
            city: user[11],
          });
        } catch (e) {
          const path = (e as ValidationError).path;
          if (path === 'email') {
            newErrors.push(
              t(`errors.email`, {
                email: user[2],
                count: 2,
              }),
            );
          } else {
            newErrors.push(
              t(`errors.${path}`, {
                user,
                count: 2,
              }),
            );
          }
        }

        list.push(user);
      });
    } catch (e) {
      newErrors.push(t('invalidFileFormat'));
      setLoading(false);
    }

    if (!list.length) {
      newErrors.push(t('errors.emptyCSV'));
      setLoading(false);
    }
    if (newErrors.length !== errors.length) setErrors(newErrors);

    const emails = list.reduce((acc, l) => {
      const email1 = l[2];
      const email2 = l[6];
      acc.push(email1);
      if (email2) acc.push(email2);
      return acc;
    }, []);
    getUsersFromEmails({ variables: { emails } });
    setUsers(list);
  };

  const onTryAgain = () => {
    setErrors([]);
    setUsers([]);
    setAccountCreationModeChecked(false);
    setAccountCreationConsent(false);
  };

  const onFinalise = async () => {
    if (!data || !unregisteredUser) return;
    const options = {
      variables: {
        groupId,
        withAccounts: data.getUsersFromEmails.map((u) => u.id),
        withoutAccounts: unregisteredUser.map((u) => {
          return {
            firstName: u[0],
            lastName: u[1],
            email: u[2],
            phone: u[3],
            firstName2: u[4],
            lastName2: u[5],
            email2: u[6],
            phone2: u[7],
            address1: u[8],
            address2: u[9],
            zipCode: u[10],
            city: u[11],
          };
        }),
      },
    };
    const mutation = accountCreationModeChecked
      ? importAndCreateMembersMutation
      : sendInvitesToNewMembersMutation;
    const result = await mutation(options);

    const newAlreadyMembersEmails: string[] = [];
    data.getUsersFromEmails.forEach((u) => {
      const data = accountCreationModeChecked
        ? (result.data as ImportAndCreateMembersMutation)
            ?.importAndCreateMembers
        : (result.data as SendInvitesToNewMembersMutation)
            ?.sendInvitesToNewMembers;
      if (!data) return;
      if (!data.withAccounts.includes(u.id)) {
        // This user is already a member of this group
        let emails = `${u.email} `;
        if (u.email2) {
          emails += `${tCommon('and')}/${tCommon('or')} ${u.email2}`;
        }
        newAlreadyMembersEmails.push(emails);
      }
    });
    setAlreadyMembersEmails(newAlreadyMembersEmails);

    openFinalisedDialog(true);
  };

  const onFinalisedDialogConfirm = () => {
    openFinalisedDialog(false);
    navigate(-1);
  };

  const onAccountCreationModeChange = () => {
    setAccountCreationModeChecked(!accountCreationModeChecked);
    setAccountCreationConsent(false);
    if (!accountCreationModeChecked) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const onAccountCreationConsentChange = () => {
    setAccountCreationConsent(!accountCreationConsent);
  };

  let mutationError = importAndCreateError || sendInvitesError;
  const mutationData = accountCreationModeChecked
    ? importAndCreateData?.importAndCreateMembers
    : sendInvitesData?.sendInvitesToNewMembers;

  return (
    <Box mb={2}>
      <Card>
        <Box p={2}>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="h2" gutterBottom>
              {t('importMembers')}
            </Typography>
          </Box>

          <Box mb={1}>
            {getUsersError && <ApolloErrorAlert error={getUsersError} />}
            {mutationError && <ApolloErrorAlert error={mutationError} />}
          </Box>

          <Box>
            {errors &&
              errors.map((e) => (
                <Box key={e} mb={1}>
                  <AlertError message={e} />
                </Box>
              ))}
          </Box>

          {accountCreationModeChecked && (
            <Box mb={1}>
              <Alert severity="warning">{t('needConsentWarning')}</Alert>
            </Box>
          )}

          {registeredUser && unregisteredUser ? (
            <>
              {unregisteredUser.length > 0 && (
                <Box mb={4}>
                  <Typography gutterBottom variant="h4">
                    {t('peopleToImport')}
                  </Typography>
                  <Box mb={1} width="fit-content">
                    <Alert severity="info">
                      {t(
                        accountCreationModeChecked
                          ? 'accountWillBeCreatedForPeopleToImport'
                          : 'emailWillBeSentToPeopleToImport',
                      )}
                    </Alert>
                  </Box>
                  <ImportMembersTables
                    users={unregisteredUser}
                    headers={headers}
                  />
                </Box>
              )}
              {registeredUser.length > 0 && (
                <Box mb={2}>
                  <Typography gutterBottom variant="h4">
                    {t('existingAccounts')}
                  </Typography>
                  <Box mb={1} width="fit-content">
                    <Alert severity="info">
                      {t(
                        accountCreationModeChecked
                          ? 'existingAccountsWillJoinYourGroup'
                          : 'emailWillBeSentToExistingAccounts',
                      )}
                    </Alert>
                  </Box>
                  <ImportMembersTables
                    users={registeredUser}
                    headers={headers}
                  />
                </Box>
              )}
              <Box p={2} mb={2}>
                <Typography>
                  <b>{t('warning')}</b>
                </Typography>
                <Typography>{t('beforeValidating')}</Typography>
                <Typography>{t('ifDataAreNotCorrect')}</Typography>
                <Button variant="outlined" onClick={onTryAgain}>
                  {t('tryAgain')}
                </Button>
              </Box>

              <Box>
                {accountCreationModeChecked && (
                  <Box width="100%" pb={1}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={accountCreationConsent}
                          onChange={onAccountCreationConsentChange}
                        />
                      }
                      label={`${t('consent', {
                        count:
                          Math.min(
                            data?.getUsersFromEmails?.length || 0,
                            registeredUser.length,
                          ) + unregisteredUser.length,
                      })}`}
                    />
                  </Box>
                )}
                <LoadingButton
                  variant="contained"
                  onClick={onFinalise}
                  loading={sendInvitesLoading || importAndCreateLoading}
                  disabled={
                    errors.length > 0 ||
                    (accountCreationModeChecked && !accountCreationConsent)
                  }
                >
                  {t(
                    accountCreationModeChecked
                      ? 'finaliseImport'
                      : 'sendInvites',
                  )}
                </LoadingButton>
              </Box>
              {registeredUser && (
                <Box mt={2}>
                  <Divider />
                  <Box m={2} display="flex" alignItems="center">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={accountCreationModeChecked}
                          onChange={onAccountCreationModeChange}
                        />
                      }
                      label={`${t('accountCreationMode')}`}
                    />
                    <Typography variant="caption">
                      {t('newModeWarningText')}
                    </Typography>
                  </Box>
                </Box>
              )}
              <ConfirmDialog
                open={finalisedDialogOpen}
                onConfirm={onFinalisedDialogConfirm}
                confirmButtonLabel={tCommon('back')}
                title={
                  alreadyMembersEmails.length &&
                  mutationData &&
                  !mutationData.withAccounts.length &&
                  !mutationData.withoutAccounts.length
                    ? undefined
                    : t(
                        accountCreationModeChecked
                          ? !!mutationData?.withAccounts.length &&
                            !!mutationData?.withoutAccounts.length
                            ? 'accountHaveBeenCreatedAndInvitesHaveBeenSent'
                            : 'accountHaveBeenCreated'
                          : 'invitesHaveBeenSent',
                      )
                }
                content={
                  alreadyMembersEmails.length ? (
                    <>
                      {alreadyMembersEmails.map((emails) => (
                        <Box key={emails} mb={1}>
                          <Alert severity="info">
                            {t('userIsAlreadyMember', { emails })}
                          </Alert>
                        </Box>
                      ))}
                    </>
                  ) : undefined
                }
              />
            </>
          ) : (
            <Grid container spacing={2}>
              <Grid item sm>
                <>
                  {loading ? (
                    <Box
                      minHeight={250}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <CircularProgressBox />
                      <Typography>
                        {t('fileNameLoading', { fileName: loadedFileName })}
                      </Typography>
                    </Box>
                  ) : (
                    <DropzoneArea
                      filesLimit={1}
                      acceptedFiles={[
                        '.csv, text/csv, application/vnd.ms-excel, application/csv, text/x-csv, application/x-csv, text/comma-separated-values, text/x-comma-separated-values',
                      ]}
                      dropzoneText={t('dropzone.text')}
                      getDropRejectMessage={getDropRejectMessage}
                      onChange={onFileLoad}
                    />
                  )}
                </>
              </Grid>
              <Grid item sm>
                <Typography>
                  {t('help.1')}
                  <li>
                    {t('help.2-1')}
                    <CamapLink href="/adherents.xls">{t('help.2-2')}</CamapLink>
                    .
                  </li>
                  <li>{t('help.3-1')}</li>
                  <li>{t('help.3-2')}</li>
                  <li>{t('help.4')}</li>
                  <li>{t('help.5')}</li>
                  <li>{t('help.6')}</li>
                  <li>{t('help.7')}</li>
                </Typography>
              </Grid>
            </Grid>
          )}
        </Box>
      </Card>
    </Box>
  );
};

export default ImportMembers;
