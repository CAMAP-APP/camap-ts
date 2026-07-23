import { ApolloError } from '@apollo/client';
import { UserLists } from 'camap-common';
import React, { useCallback, useRef } from 'react';
import { AttachmentFileInput, Group, Message, User } from '../../gql';
import { clearImageFiles } from './utils/imageFileRegistry';

interface MessagesContextProviderProps {
  groupId: number;
  whichUser: boolean;
}

export type Recipient = Partial<
  Pick<
    User,
    | 'id'
    | 'firstName'
    | 'lastName'
    | 'firstName2'
    | 'lastName2'
    | 'email'
    | 'email2'
  >
>;
export type LatestMessagesType = Pick<
  Message,
  'title' | 'date' | 'slateContent' | 'recipientListId' | 'attachments'
> & {
  group?: Pick<Group, 'name'> | null | undefined;
};

export type EmbeddedImagesFlushResult = {
  attachments: AttachmentFileInput[];
  html: string;
  slateContent: string;
};

type EmbeddedImagesFlusher = () => Promise<EmbeddedImagesFlushResult>;

interface MessagesContextProps extends MessagesContextProviderProps {
  attachments: File[];
  error: ApolloError | undefined;
  setError: (error: ApolloError | undefined) => void;
  addAttachment: (attachment: File) => void;
  removeAttachment: (attachment: File) => void;
  /** Replace file attachments only (does not clear embedded images). */
  replaceAttachments: (attachments: File[]) => void;
  resetAttachments: () => void;
  recipients: Recipient[];
  setRecipients: (recipients: Recipient[]) => void;
  selectedUserList: UserLists | undefined;
  setSelectedUserList: (userList: UserLists | undefined) => void;
  embeddedImages: AttachmentFileInput[];
  addEmbeddedImages: (images: AttachmentFileInput[]) => void;
  removeEmbeddedImage: (image: AttachmentFileInput) => void;
  setEmbeddedImages: (images: AttachmentFileInput[]) => void;
  /** Wait for pending image encode/serialize; returns ready attachments + HTML. */
  flushEmbeddedImages: () => Promise<EmbeddedImagesFlushResult>;
  registerEmbeddedImagesFlusher: (flusher: EmbeddedImagesFlusher | null) => void;
  slateContent: string;
  setSlateContent: (value: string) => void;
  reuseMessage: LatestMessagesType | undefined;
  setReuseMessage: (value: LatestMessagesType | undefined) => void;
  defaultRecipients: Recipient[];
  setDefaultRecipients: (recipients: Recipient[]) => void;
}

export const MessagesContext = React.createContext<MessagesContextProps>({
  groupId: -1,
  whichUser: true,
  attachments: [],
  error: undefined,
  setError: () => { },
  addAttachment: () => { },
  removeAttachment: () => { },
  replaceAttachments: () => { },
  resetAttachments: () => { },
  recipients: [],
  setRecipients: () => { },
  selectedUserList: undefined,
  setSelectedUserList: () => { },
  embeddedImages: [],
  addEmbeddedImages: () => { },
  removeEmbeddedImage: () => { },
  setEmbeddedImages: () => { },
  flushEmbeddedImages: async () => ({ attachments: [], html: '', slateContent: '' }),
  registerEmbeddedImagesFlusher: () => { },
  slateContent: '',
  setSlateContent: () => { },
  reuseMessage: undefined,
  setReuseMessage: () => { },
  defaultRecipients: [],
  setDefaultRecipients: () => { }
});

const MessagesContextProvider = ({
  children,
  groupId,
  whichUser
}: { children: React.ReactNode } & MessagesContextProviderProps) => {
  const [attachments, setAttachments] = React.useState<File[]>([]);
  const [error, setError] = React.useState<ApolloError | undefined>();
  const [recipients, setRecipients] = React.useState<Recipient[]>([]);
  const [defaultRecipients, setDefaultRecipients] = React.useState<Recipient[]>([]);
  const [selectedUserList, setSelectedUserList] = React.useState<
    UserLists | undefined
  >();
  const [embeddedImages, setEmbeddedImages] = React.useState<
    AttachmentFileInput[]
  >([]);
  const [slateContent, setSlateContent] = React.useState<string>('');
  const [reuseMessage, setReuseMessage] = React.useState<
    LatestMessagesType | undefined
  >();
  const embeddedImagesFlusherRef = useRef<EmbeddedImagesFlusher | null>(null);

  const addAttachment = useCallback((attachment: File) => {
    setAttachments(attachments => {
      if (attachments.findIndex((a) => a.name === attachment.name) !== -1) return attachments;
      return [...attachments, attachment];
    });
  }, []);

  const removeAttachment = useCallback((attachment: File) => {
    setAttachments(attachments => attachments.filter((a) => a.name !== attachment.name));
  }, []);

  const replaceAttachments = useCallback((next: File[]) => {
    setAttachments(next);
  }, []);

  const addEmbeddedImages = useCallback((images: AttachmentFileInput[]) => {
    setEmbeddedImages(embeddedImages => [
      ...embeddedImages,
      ...images.filter((i) => !embeddedImages.includes(i))
    ]);
  }, []);

  const removeEmbeddedImage = useCallback((image: AttachmentFileInput) => {
    setEmbeddedImages(embeddedImages =>
      embeddedImages.filter((i) => i.cid !== image.cid));
  }, []);

  const registerEmbeddedImagesFlusher = useCallback((flusher: EmbeddedImagesFlusher | null) => {
    embeddedImagesFlusherRef.current = flusher;
  }, []);

  const flushEmbeddedImages = useCallback(async () => {
    if (embeddedImagesFlusherRef.current) {
      return embeddedImagesFlusherRef.current();
    }
    return { attachments: embeddedImages, html: '', slateContent };
  }, [embeddedImages, slateContent]);

  const resetAttachments = () => {
    setAttachments([]);
    setEmbeddedImages([]);
    clearImageFiles();
  };

  /** */
  return (
    <MessagesContext.Provider
      value={{
        groupId,
        whichUser,
        attachments,
        error,
        setError,
        addAttachment,
        removeAttachment,
        replaceAttachments,
        resetAttachments,
        recipients,
        setRecipients,
        selectedUserList,
        setSelectedUserList,
        embeddedImages,
        addEmbeddedImages,
        removeEmbeddedImage,
        setEmbeddedImages,
        flushEmbeddedImages,
        registerEmbeddedImagesFlusher,
        slateContent,
        setSlateContent,
        reuseMessage,
        setReuseMessage,
        defaultRecipients,
        setDefaultRecipients
      }}
    >
      {children}
    </MessagesContext.Provider>
  );
};

export default MessagesContextProvider;
