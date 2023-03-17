import withHelperTextTranslation from '@components/forms/shared/withHelperTextTranslation';
import { UserFragment, UserList } from '@gql';
import { LoadingButton } from '@mui/lab';
import { Alert, Box, TextField as MuiTextField } from '@mui/material';
import { formatUserList } from '@utils/fomat';
import { UserLists } from 'camap-common';
import { Field, Form, Formik } from 'formik';
import { fieldToTextField } from 'formik-mui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import MessageLatestMessagesSelect from './MessageLatestMessagesSelect';
import MessageObject from './MessageObject';
import MessageRecipientsSelect, {
  RecipientOption,
  RecipientOptionGroup,
} from './MessageRecipientsSelect';
import {
  MessagesFormikBag,
  MessagesFormValues,
} from './MessagesFormFormikTypes';
import MessageTextEditor from './MessageTextEditor';

interface Props {
  user: UserFragment;
  isPartnerConnected: boolean;
  defaultUserLists: UserList[];
  onSubmit: (values: MessagesFormValues, bag: MessagesFormikBag) => void;
  isSuccessful: boolean;
  groupName: string;
}

const CustomTextField = withHelperTextTranslation(
  MuiTextField,
  fieldToTextField,
);

const MessagesForm = ({
  user,
  isPartnerConnected,
  defaultUserLists,
  onSubmit,
  isSuccessful,
  groupName,
}: Props) => {
  const { t } = useTranslation(['messages/default']);
  const { t: tLists } = useTranslation(['members/lists']);

  const defaultRecipientsOptions: RecipientOption[] = defaultUserLists.map(
    (ul) => ({
      value: ul.type,
      label: formatUserList(ul, tLists),
      group: RecipientOptionGroup.DEFAULT,
      disabled: ul.count === 0,
    }),
  );

  const testLists = UserLists.TEST;
  defaultRecipientsOptions.push({
    value: testLists.type,
    label: tLists(testLists.type),
    group: RecipientOptionGroup.DEFAULT,
    disabled: false,
  });
  const vendorsLists = UserLists.VENDORS;
  defaultRecipientsOptions.push({
    value: vendorsLists.type,
    label: tLists(vendorsLists.type),
    group: RecipientOptionGroup.DEFAULT,
    disabled: false,
  });
  let senderEmail = '';
  let senderName = groupName;
  if (isPartnerConnected && !!user.email2) {
    senderEmail = user.email2;
  } else {
    senderEmail = user.email;
  }

  const RecipientsFieldComponent = (props: any) => {
    return (
      <MessageRecipientsSelect
        defaultRecipientsOptions={defaultRecipientsOptions}
        contractsRecipientsOptions={[]}
        distributionRecipientsOptions={[
          {
            value: '',
            label: '',
            group: RecipientOptionGroup.DISTRIBUTION,
          },
        ]}
        {...props}
      />
    );
  };

  const LatestMessagesFieldComponent = (props: any) => {
    return <MessageLatestMessagesSelect {...props} />;
  };

  const ObjectFieldComponent = (props: any) => {
    return <MessageObject {...props} />;
  };

  const initialValues: MessagesFormValues = {
    senderName,
    senderEmail,
    recipientsList: undefined,
    object: '',
    message: '',
  };

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit}>
      {(formikProps) => (
        <Form>
          {formikProps.status && !isSuccessful && (
            <Box my={2}>
              <Alert severity="error">{formikProps.status}</Alert>
            </Box>
          )}
          {isSuccessful && !formikProps.status && (
            <Box my={2}>
              <Alert severity="success">{t('form.success')}</Alert>
            </Box>
          )}

          <Box>
            <Box width="100%">
              <Field
                component={CustomTextField}
                fullWidth
                margin="normal"
                label={t('form.name')}
                name={'senderName'}
                required
              />
              <Field
                component={CustomTextField}
                fullWidth
                margin="normal"
                label={t('form.email')}
                name={'senderEmail'}
                required
              />
              <Field
                fullWidth
                margin="normal"
                label={t('form.recipients')}
                name={'recipientsList'}
                required
                component={RecipientsFieldComponent}
                as={RecipientsFieldComponent}
              />
              <Field
                fullWidth
                margin="normal"
                label={t('form.object')}
                name={'object'}
                required
                component={ObjectFieldComponent}
              />
              <Field
                fullWidth
                margin="normal"
                label={t('form.message')}
                name={'message'}
                required
                as={MessageTextEditor}
              />
              <Field
                fullWidth
                margin="normal"
                label={t('form.latestMessages')}
                name={'latestMessages'}
                required
                component={LatestMessagesFieldComponent}
                as={LatestMessagesFieldComponent}
              />
            </Box>
          </Box>
          <Box
            mb={3}
            pb={{ xs: 1, sm: 0 }}
            display="flex"
            justifyContent="center"
          >
            <LoadingButton
              loading={formikProps.isSubmitting}
              variant="contained"
              type="submit"
              disabled={formikProps.isSubmitting}
            >
              {t('form.send')}
            </LoadingButton>
          </Box>
        </Form>
      )}
    </Formik>
  );
};

const arePropsEqual = (prevProps: Props, nextProps: Props) => {
  return (
    prevProps.defaultUserLists.length === nextProps.defaultUserLists.length &&
    prevProps.isSuccessful === nextProps.isSuccessful
  );
};

export default React.memo(MessagesForm, arePropsEqual);
