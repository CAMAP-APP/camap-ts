import { LoadingButton } from '@mui/lab';
import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  Dialog,
  DialogActions,
  DialogTitle,
  Divider,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material';
import {
  addressSchemaNotRequired,
  phoneSchema,
  userSchema,
} from 'camap-common';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { TextField } from 'formik-mui';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ValidationError } from 'yup';
import DatePicker from '../../../components/forms/Pickers/DatePicker';
import ApolloErrorAlert from '../../../components/utils/errors/ApolloErrorAlert';
import ISO31661Selector from '../../../components/utils/ISO31661Selector';
import TwoColumnsGrid from '../../../components/utils/TwoColumnsGrid';
import {
  ImportAndCreateMembersMutation,
  SendInvitesToNewMembersMutation,
  useGetUsersFromEmailsLazyQuery,
  useImportAndCreateMembersMutation,
  User,
  useSendInvitesToNewMembersMutation,
} from '../../../gql';
import { useCamapTranslation } from '../../../utils/hooks/use-camap-translation';
import { UserInfosFormValues } from '../../users/UserAccountModule/components/UserInfosForm';
import { UserPartnerFormValues } from '../../users/UserAccountModule/components/UserPartnerForm';
import { MembersContext } from '../MembersContext';

type UserAndPartnerInfosFormValues = UserInfosFormValues &
  UserPartnerFormValues;
type UserAndPartnerInfosFormBag = FormikHelpers<UserAndPartnerInfosFormValues>;

const ImportOneMember = () => {
  const { t, tCommon } = useCamapTranslation({
    t: 'members/import',
    tCommon: 'translation',
  });
  const memoizedTAnd = React.useMemo(() => tCommon('and'), [tCommon]);
  const memoizedTOr = React.useMemo(() => tCommon('or'), [tCommon]);
  const navigate = useNavigate();
  const { groupId, toggleRefetch, setToggleRefetch } =
    React.useContext(MembersContext);

  const [
    getUsersFromEmails,
    { data: getUsersFromEmailsData, loading: userLoading },
  ] = useGetUsersFromEmailsLazyQuery();

  const [sendInvitesToNewMembersMutation, { loading: importLoading }] =
    useSendInvitesToNewMembersMutation();
  const [importAndCreateMembersMutation, { loading: importAndCreateLoading }] =
    useImportAndCreateMembersMutation();

  const [finalisedDialogOpen, openFinalisedDialog] = React.useState(false);
  const [userIsAlreadyMemberEmails, setUserIsAlreadyMemberEmails] =
    React.useState('');
  const [accountCreationModeChecked, setAccountCreationModeChecked] =
    React.useState<boolean>(false);
  const [accountCreationConsent, setAccountCreationConsent] =
    React.useState<boolean>(false);

  const valuesRef = React.useRef<UserAndPartnerInfosFormValues>();
  const bagRef = React.useRef<UserAndPartnerInfosFormBag>();

  const initialValues = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: new Date(),
    nationality: 'fr',
    address1: '',
    address2: '',
    zipCode: '',
    city: '',
    countryOfResidence: 'fr',
    firstName2: '',
    lastName2: '',
    email2: '',
    phone2: ''
  };
  const accountCreationModeInitialValues: UserAndPartnerInfosFormValues = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: new Date(),
    nationality: 'fr',
    address1: '',
    address2: '',
    zipCode: '',
    city: '',
    countryOfResidence: 'fr',
    firstName2: '',
    lastName2: '',
    email2: '',
    phone2: '',
  };

  const importMembers = React.useCallback(async () => {
    if (!valuesRef.current || !bagRef.current || !getUsersFromEmailsData)
      return;

    let account: Pick<User, 'id' | 'email' | 'email2'> | undefined = undefined;
    if (getUsersFromEmailsData.getUsersFromEmails.length > 0) {
      account = getUsersFromEmailsData.getUsersFromEmails[0];
    }

    let newUser: Partial<User>;
    if (!account) {
      newUser = valuesRef.current;

      // Remove useless spaces
      if (newUser.phone) newUser.phone = newUser.phone.replace(/\s/g, '');
      if (newUser.phone2) newUser.phone2 = newUser.phone2.replace(/\s/g, '');
      if (newUser.address1) newUser.address1 = newUser.address1.trim();
      if (newUser.address2) newUser.address2 = newUser.address2.trim();
      if (newUser.city) newUser.city = newUser.city.trim();
      if (newUser.firstName2) newUser.firstName2 = newUser.firstName2.trim();
      if (newUser.lastName2) newUser.lastName2 = newUser.lastName2.trim();
      if (newUser.firstName) newUser.firstName = newUser.firstName.trim();
      if (newUser.lastName) newUser.lastName = newUser.lastName.trim();

      (Object.keys(newUser) as (keyof User)[]).forEach((key) => {
        if (newUser[key] === '') newUser[key] = undefined;
      });

      let validationSchema = userSchema;
      if (newUser.phone)
        validationSchema = validationSchema.concat(phoneSchema);
      if (newUser.zipCode || newUser.address1 || newUser.city)
        validationSchema = validationSchema.concat(addressSchemaNotRequired);
      try {
        validationSchema.validateSync(newUser);
      } catch (e) {
        const resetValues = valuesRef.current;
        const errorPath = (e as ValidationError).path;
        resetValues[errorPath as keyof typeof resetValues] = '';
        bagRef.current.resetForm({
          values: resetValues,
          status: {
            validationError: errorPath,
          },
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        bagRef.current.setSubmitting(false);
        return;
      }
    }

    try {
      const mutation = accountCreationModeChecked
        ? importAndCreateMembersMutation
        : sendInvitesToNewMembersMutation;
      const result = await mutation({
        variables: {
          groupId,
          withAccounts: account ? [account.id] : [],
          withoutAccounts: !account ? [valuesRef.current] : [],
        },
      });
      const data = accountCreationModeChecked
        ? (result.data as ImportAndCreateMembersMutation)
          ?.importAndCreateMembers
        : (result.data as SendInvitesToNewMembersMutation)
          ?.sendInvitesToNewMembers;
      if (account && data?.withAccounts.length === 0) {
        // This user is already a member of this group
        let emails =
          valuesRef.current.email.toLowerCase() ===
            account.email.toLowerCase() ||
            valuesRef.current.email2?.toLowerCase() ===
            account.email.toLowerCase()
            ? `${account.email} `
            : '';
        if (account.email2) {
          if (
            valuesRef.current.email.toLowerCase() ===
            account.email2.toLowerCase() ||
            valuesRef.current.email2?.toLowerCase() ===
            account.email2.toLowerCase()
          ) {
            emails += emails.length ? `${memoizedTAnd}/${memoizedTOr} ` : '';
            emails += `${account.email2}`;
          }
        }
        setUserIsAlreadyMemberEmails(emails);
      }
      openFinalisedDialog(true);
    } catch (error) {
      bagRef.current.resetForm({
        status: { apolloError: error },
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      bagRef.current.setSubmitting(false);
    }
  }, [
    accountCreationModeChecked,
    getUsersFromEmailsData,
    groupId,
    importAndCreateMembersMutation,
    memoizedTAnd,
    memoizedTOr,
    sendInvitesToNewMembersMutation,
  ]);

  React.useEffect(() => {
    if (!getUsersFromEmailsData) return;

    importMembers();
  }, [getUsersFromEmailsData, importMembers]);

  const onSubmit = async (
    values: UserAndPartnerInfosFormValues,
    bag: UserAndPartnerInfosFormBag,
  ) => {
    bag.setStatus({ success: false, apolloError: null });

    const previousValues = valuesRef.current;

    valuesRef.current = values;
    bagRef.current = bag;

    try {
      const emails = [values.email];
      if (values.email2) emails.push(values.email2);
      getUsersFromEmails({
        variables: {
          emails,
        },
      });

      if (
        getUsersFromEmailsData &&
        previousValues &&
        previousValues.email === values.email
      ) {
        importMembers();
      }
    } catch (error) {
      bag.resetForm({
        status: { apolloError: error },
      });
    } finally {
      bag.setSubmitting(false);
    }
  };

  const onFinalisedDialogConfirm = () => {
    openFinalisedDialog(false);
    setToggleRefetch(!toggleRefetch);
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

  const dialogTitleText = React.useMemo(() => {
    if (
      getUsersFromEmailsData?.getUsersFromEmails?.length &&
      getUsersFromEmailsData?.getUsersFromEmails?.length > 0
    ) {
      if (accountCreationModeChecked) return 'existingAccountHasBeenAdded';
      return 'emailhasBeenSentToExistingAccounts';
    } else {
      if (accountCreationModeChecked) return 'anAccountHasBeenCreated';
      return 'emailhasBeenSentToPersonToImport';
    }
  }, [
    accountCreationModeChecked,
    getUsersFromEmailsData?.getUsersFromEmails?.length,
  ]);

  return (
    <Box mb={2}>
      <Card>
        <Box p={2}>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="h2" gutterBottom>
              {t('inviteNewMember')}
            </Typography>
          </Box>

          {accountCreationModeChecked && (
            <Box mb={1}>
              <Alert severity="warning">{t('needConsentWarning')}</Alert>
            </Box>
          )}

          <Formik
            initialValues={
              accountCreationModeChecked
                ? accountCreationModeInitialValues
                : initialValues
            }
            onSubmit={onSubmit}
          >
            {({
              status,
              values,
              isSubmitting,
              touched,
              errors,
              setFieldValue,
              setFieldTouched,
            }) => (
              <Form>
                <Box mb={1}>
                  <Alert severity="info">
                    {t(
                      accountCreationModeChecked
                        ? 'accountWillBeCreatedToNewMember'
                        : 'emailWillBeSentToNewMember',
                    )}
                  </Alert>
                </Box>

                {status && status.apolloError && (
                  <Box p={2} pb={0}>
                    <ApolloErrorAlert error={status.apolloError} />
                  </Box>
                )}

                {status && status.mailAlreadyInUseError && (
                  <Box p={2} pb={0}>
                    <Alert severity="error">{t('mailAlreadyInUseError')}</Alert>
                  </Box>
                )}

                {status && status.validationError && (
                  <Box p={2} pb={0}>
                    <Alert severity="error">
                      {t(`errors.${status.validationError}`)}
                    </Alert>
                  </Box>
                )}

                {status && status.success && (
                  <Box p={2} pb={0}>
                    <Alert severity="success">{t('updateSuccess')}</Alert>
                  </Box>
                )}

                <Box p={2}>
                  <Typography variant="caption">{t('asteriskNote')}</Typography>
                  <TwoColumnsGrid
                    left={
                      <Field
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        name="firstName"
                        label={tCommon('firstName')}
                        component={TextField}
                        required
                      />
                    }
                    right={
                      <Field
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        name="lastName"
                        label={tCommon('lastName')}
                        component={TextField}
                        required
                      />
                    }
                  />

                  {!accountCreationModeChecked && (
                    <Field
                      fullWidth
                      margin="normal"
                      variant="outlined"
                      name="email"
                      label={tCommon('email')}
                      type="email"
                      component={TextField}
                      required
                    />
                  )}

                  {accountCreationModeChecked && (
                    <>
                      <TwoColumnsGrid
                        left={
                          <Field
                            fullWidth
                            margin="normal"
                            variant="outlined"
                            name="email"
                            label={tCommon('email')}
                            type="email"
                            component={TextField}
                            required
                          />
                        }
                        right={
                          <Field
                            fullWidth
                            margin="normal"
                            variant="outlined"
                            name="phone"
                            label={tCommon('phone')}
                            component={TextField}
                          />
                        }
                      />

                      <DatePicker
                        inputFormat="dd MMMM yyyy"
                        label={tCommon('birthDate')}
                        value={values.birthDate}
                        disabled={isSubmitting}
                        onChange={(newDate: any) => {
                          setFieldValue('birthDate', newDate);
                        }}
                        textFieldProps={{
                          fullWidth: true,
                          required: true,
                        }}
                        openTo="year"
                      />

                      <ISO31661Selector
                        format="alpha2"
                        autocompleteProps={{ disabled: isSubmitting }}
                        textFieldProps={{
                          fullWidth: true,
                          margin: 'normal',
                          required: false,
                          name: 'nationality',
                          label: tCommon('nationality'),
                          error: Boolean(
                            touched.nationality && errors.nationality,
                          ),
                          onBlur: () => setFieldTouched('nationality'),
                        }}
                        defaultValue={
                          accountCreationModeInitialValues.nationality?.toLocaleLowerCase() ||
                          ''
                        }
                        onChange={(v) => {
                          setFieldTouched('nationality');
                          setFieldValue('nationality', String(v)?.toUpperCase() || '');
                        }}
                        value={values.nationality || ''}
                      />
                      <Field
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        name="address1"
                        label={tCommon('address1')}
                        component={TextField}
                      />
                      <Field
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        name="address2"
                        label={tCommon('address2')}
                        component={TextField}
                      />

                      <TwoColumnsGrid
                        left={
                          <Field
                            fullWidth
                            margin="normal"
                            variant="outlined"
                            name="zipCode"
                            label={tCommon('zipCode')}
                            component={TextField}
                          />
                        }
                        right={
                          <Field
                            fullWidth
                            margin="normal"
                            variant="outlined"
                            name="city"
                            label={tCommon('city')}
                            component={TextField}
                          />
                        }
                      />

                      <ISO31661Selector
                        format="alpha2"
                        autocompleteProps={{ disabled: isSubmitting }}
                        textFieldProps={{
                          fullWidth: true,
                          margin: 'normal',
                          name: 'countryOfResidence',
                          label: tCommon('countryOfResidence'),
                          error: Boolean(
                            touched.countryOfResidence &&
                            errors.countryOfResidence,
                          ),
                          onBlur: () => setFieldTouched('countryOfResidence'),
                        }}
                        defaultValue={accountCreationModeInitialValues.countryOfResidence?.toLowerCase()}
                        onChange={(v) => {
                          setFieldTouched('countryOfResidence');
                          setFieldValue(
                            'countryOfResidence',
                            String(v)?.toUpperCase() || '',
                          );
                        }}
                        value={values.countryOfResidence || ''}
                      />
                    </>
                  )}
                </Box>
                {accountCreationModeChecked && (
                  <Box p={2}>
                    <TwoColumnsGrid
                      left={
                        <Field
                          fullWidth
                          margin="normal"
                          variant="outlined"
                          name="firstName2"
                          label={tCommon('firstName2')}
                          component={TextField}
                        />
                      }
                      right={
                        <Field
                          fullWidth
                          margin="normal"
                          variant="outlined"
                          name="lastName2"
                          label={tCommon('lastName2')}
                          component={TextField}
                        />
                      }
                    />

                    <TwoColumnsGrid
                      left={
                        <Field
                          fullWidth
                          margin="normal"
                          variant="outlined"
                          name="email2"
                          label={tCommon('email2')}
                          type="email"
                          component={TextField}
                        />
                      }
                      right={
                        <Field
                          fullWidth
                          margin="normal"
                          variant="outlined"
                          name="phone2"
                          label={tCommon('phone2')}
                          component={TextField}
                        />
                      }
                    />
                  </Box>
                )}

                {accountCreationModeChecked && (
                  <Box width="100%" p={3}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={accountCreationConsent}
                          onChange={onAccountCreationConsentChange}
                        />
                      }
                      label={`${t('consent')}`}
                    />
                  </Box>
                )}

                <Box p={2} pt={0} mb={1} display="flex" justifyContent="center">
                  <LoadingButton
                    variant="contained"
                    disabled={
                      isSubmitting ||
                      (accountCreationModeChecked && !accountCreationConsent)
                    }
                    type="submit"
                    loading={
                      userLoading || importLoading || importAndCreateLoading
                    }
                  >
                    {t(
                      accountCreationModeChecked
                        ? 'createAccountAndAddToGroup'
                        : 'invite',
                    )}
                  </LoadingButton>
                </Box>
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
              </Form>
            )}
          </Formik>
        </Box>
        <Dialog open={finalisedDialogOpen}>
          <DialogTitle>
            {userIsAlreadyMemberEmails
              ? t('userIsAlreadyMember', { emails: userIsAlreadyMemberEmails })
              : t(dialogTitleText)}
          </DialogTitle>
          <DialogActions>
            <Button
              autoFocus
              variant="contained"
              onClick={onFinalisedDialogConfirm}
            >
              {tCommon('back')}
            </Button>
          </DialogActions>
        </Dialog>
      </Card>
    </Box>
  );
};

export default ImportOneMember;
