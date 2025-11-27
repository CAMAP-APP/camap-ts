import { Autocomplete, Box, TextField } from '@mui/material';
import { FieldInputProps, FieldMetaProps, FormikProps } from 'formik';
import { fieldToTextField, TextFieldProps } from 'formik-mui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import withHelperTextTranslation from '../../../components/forms/shared/withHelperTextTranslation';
import { useGetLatestMessagesQuery } from '../../../gql';
import { formatDate } from '../../../utils/fomat';
import { LatestMessagesType, MessagesContext } from '../MessagesContext';
import { MessagesFormValues } from './MessagesFormFormikTypes';

interface MessageLatestMessagesSelectProps {
  field: FieldInputProps<string | string[]>;
  meta: FieldMetaProps<string>;
  form: FormikProps<MessagesFormValues>;
  label: string;
}

const CustomTextField: React.ComponentType<TextFieldProps> =
  withHelperTextTranslation(TextField, fieldToTextField);

const MessageLatestMessagesSelect = ({
  label,
  field,
  meta,
  form,
}: MessageLatestMessagesSelectProps) => {
  const { t } = useTranslation(['messages/default']);

  const context = React.useContext(MessagesContext);
  const { setError, reuseMessage, setReuseMessage } = context;

  const [value, setValue] = React.useState<LatestMessagesType | null>(null);

  const { data, error, refetch } = useGetLatestMessagesQuery();

  const options = data?.getLatestMessages.filter((m) => !!m.slateContent) || [];

  React.useEffect(() => {
    setError(error);
  }, [error, setError]);

  React.useEffect(() => {
    if (reuseMessage === undefined) refetch();
  }, [refetch, reuseMessage]);

  const onClose = (event: React.ChangeEvent<{}>) => {
    field.onBlur(field.name)(event);
  };

  const onValueChange = (_event: any, newValue: LatestMessagesType | null) => {
    setValue(newValue);
    if (newValue) setReuseMessage(newValue);
  };

  const optionLabel = React.useCallback(
    (option: LatestMessagesType) =>
      t('latestSentMessage', {
        title: option.title,
        date: formatDate(new Date(option.date), true, false),
        group: option.group.name,
      }),
    [],
  );

  return (
    <Box mt={1} mb={2}>
      <Autocomplete
        value={value}
        onChange={onValueChange}
        onClose={onClose}
        fullWidth
        options={options.map(o => ({
          ...o,
          group: o.group ?? { name: '' }
        }))}
        noOptionsText={t('noMessageWithSlateContent')}
        getOptionLabel={optionLabel}
        clearOnEscape
        renderInput={(params) => {
          return (
            <CustomTextField
              {...params}
              field={field}
              meta={meta}
              form={form}
              label={label}
            />
          );
        }}
      />
    </Box>
  );
};

export default React.memo(MessageLatestMessagesSelect);
