import withHelperTextTranslation from '@components/forms/shared/withHelperTextTranslation';
import { TextField } from '@mui/material';
import { FieldInputProps } from 'formik';
import { fieldToTextField, TextFieldProps } from 'formik-mui';
import React from 'react';
import { MessagesContext } from '../MessagesContext';

interface MessageObjectProps {
  field: FieldInputProps<string>;
}

const CustomTextField: React.ComponentType<TextFieldProps> =
  withHelperTextTranslation(TextField, fieldToTextField);

const MessageObject = ({
  field,
  ...props
}: MessageObjectProps & TextFieldProps) => {
  const { reuseMessage } = React.useContext(MessagesContext);

  React.useEffect(() => {
    if (!reuseMessage) return;
    field.onChange(field.name)(reuseMessage.title);
  }, [reuseMessage]);

  return <CustomTextField {...props} fullWidth field={field} />;
};

export default React.memo(MessageObject);
