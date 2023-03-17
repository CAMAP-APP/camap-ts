import ApolloErrorAlert from '@components/utils/errors/ApolloErrorAlert';
import { Box, CircularProgress } from '@mui/material';
import { UserLists } from 'camap-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { EMPTY_EDITOR_HTML_REGEX } from '../../../components/textEditor/SlateTextEditor';
import {
  AttachmentFileInput,
  CreateMessageInput,
  MailGroupInput,
  MailListInput,
  MailUserInput,
  useCreateMessageMutation,
  useInitMessagingServiceQuery,
} from '../../../gql';
import { encodeFileToBase64String } from '../../../utils/encoding';
import MessagesForm from '../components/MessagesForm';
import {
  MessagesFormikBag,
  MessagesFormValues,
} from '../components/MessagesFormFormikTypes';
import { MessagesContext, Recipient } from '../MessagesContext';

const MESSAGE_MAX_SIZE = 24 * 1024 * 1024; // 24Mo
const ATTACHMENTS_MAX_SIZE = 15 * 1000 * 1000; // 15Mo Mailjet's attachments maxium size (we use 1000 to round down the result and be sure it passes), also SQL's mediumtext size is around 16Mo

interface MessagingServiceProps {
  onMessageSent: () => void;
}

const MessagingService = ({ onMessageSent }: MessagingServiceProps) => {
  const context = React.useContext(MessagesContext);
  const {
    groupId,
    whichUser,
    attachments,
    resetAttachments,
    error: contextError,
    recipients,
    selectedUserList,
    setSelectedUserList,
    embeddedImages,
    slateContent,
    setReuseMessage,
  } = context;
  const { t } = useTranslation([
    'messages/default',
    'translation',
    'members/lists',
  ]);
  const {
    data: requestData,
    loading,
    error: requestError,
  } = useInitMessagingServiceQuery({
    variables: { id: groupId },
  });

  const recipientsRef = React.useRef<Recipient[]>();
  const selectedUserListRef = React.useRef<UserLists | undefined>();
  const attachmentsRef = React.useRef<File[]>();
  const embeddedImagesRef = React.useRef<AttachmentFileInput[]>([]);
  const slateContentRef = React.useRef<string>('');
  const [createMail] = useCreateMessageMutation();
  const [isSuccessful, setIsSuccessful] = React.useState(false);

  const me = requestData && requestData.me;
  const error = requestError || contextError;

  const defaultUserLists = requestData ? requestData.getUserLists : [];

  React.useEffect(() => {
    recipientsRef.current = recipients;
  }, [recipients]);

  React.useEffect(() => {
    selectedUserListRef.current = selectedUserList;
  }, [selectedUserList]);

  React.useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);

  React.useEffect(() => {
    embeddedImagesRef.current = embeddedImages;
  }, [embeddedImages]);

  React.useEffect(() => {
    slateContentRef.current = slateContent;
  }, [slateContent]);

  const setFormError = (bag: MessagesFormikBag, errorMessage: string) => {
    bag.setStatus(errorMessage);
    bag.setSubmitting(false);
    setIsSuccessful(false);
    window.scrollTo(0, 0);
  };

  const byteCount = (s: string): number => {
    return encodeURI(s).split(/%..|./).length - 1;
  };

  const onFormSubmit = async (
    values: MessagesFormValues,
    bag: MessagesFormikBag,
  ) => {
    bag.setStatus(undefined);
    bag.setSubmitting(true);
    if (
      !recipientsRef.current ||
      !selectedUserListRef.current ||
      recipientsRef.current.length === 0
    ) {
      setFormError(bag, t('form.errorNoRecipient'));
      return;
    }
    if (
      values.message.length === 0 ||
      values.message.match(EMPTY_EDITOR_HTML_REGEX)
    ) {
      setFormError(bag, t('form.errorEmptyMessage'));
      return;
    }
    const messageSize = byteCount(values.message);
    let base64EncodedAttachmentsSize = 0;
    let encodedAttachments: AttachmentFileInput[] | undefined;
    if (attachmentsRef.current) {
      encodedAttachments = await Promise.all(
        attachmentsRef.current.map(async (a) => {
          const encodedContent = await encodeFileToBase64String(a);
          return {
            filename: a.name,
            contentType: a.type,
            encoding: 'base64',
            content: encodedContent,
          };
        }),
      );
    }

    if (embeddedImagesRef.current.length > 0) {
      if (encodedAttachments)
        encodedAttachments = encodedAttachments.concat(
          embeddedImagesRef.current,
        );
      else encodedAttachments = embeddedImagesRef.current;
    }

    const stringifiedEncodedAttachments = encodedAttachments
      ? JSON.stringify(encodedAttachments)
      : '';
    base64EncodedAttachmentsSize = byteCount(stringifiedEncodedAttachments);

    if (
      base64EncodedAttachmentsSize >= ATTACHMENTS_MAX_SIZE ||
      messageSize + base64EncodedAttachmentsSize >= MESSAGE_MAX_SIZE
    ) {
      setFormError(bag, t('form.errorMessageTooBig'));
      return;
    }

    try {
      const recipientsList: MailUserInput[] = [];
      recipientsRef.current.forEach((r) => {
        if (r.email) {
          const recipient: MailUserInput = {
            email: r.email,
            firstName: r.firstName,
            lastName: r.lastName,
            id: r.id,
          };
          recipientsList.push(recipient);
        }
        if (r.email2) {
          const recipient: MailUserInput = {
            email: r.email2,
            firstName: r.firstName2,
            lastName: r.lastName2,
            id: r.id,
          };
          recipientsList.push(recipient);
        }
      });

      const group: MailGroupInput = { id: groupId, name: '' };
      if (requestData) {
        group.name = requestData.groupPreview.name;
      }

      const list: MailListInput = { type: selectedUserListRef.current.type };
      if (selectedUserListRef.current.type !== 'freeList') {
        list.name = t(`members/lists:${selectedUserListRef.current.type}`);
      }

      const messageInput: CreateMessageInput = {
        title: values.object,
        htmlBody: values.message,
        senderEmail: values.senderEmail,
        senderName: values.senderName,
        recipients: recipientsList,
        group,
        list,
        attachments: encodedAttachments,
        slateContent: slateContentRef.current,
      };
      await createMail({
        variables: {
          input: messageInput,
        },
      });
      bag.resetForm();
      resetAttachments();
      setSelectedUserList(undefined);
      setReuseMessage(undefined);
      setIsSuccessful(true);
      onMessageSent();
      window.scrollTo(0, 0);
    } catch (e) {
      setFormError(bag, t('translation:error', { error: e }));
    }
  };

  /** */
  if (error) return <ApolloErrorAlert error={error} />;
  if (loading) {
    return (
      <Box display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {me && (
        <MessagesForm
          user={me}
          isPartnerConnected={whichUser}
          defaultUserLists={defaultUserLists}
          onSubmit={onFormSubmit}
          isSuccessful={isSuccessful}
          groupName={requestData.groupPreview.name}
        />
      )}
    </Box>
  );
};

export default MessagingService;
