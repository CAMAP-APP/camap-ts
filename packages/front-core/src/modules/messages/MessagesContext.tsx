import { ApolloError } from '@apollo/client';
import { UserLists } from 'camap-common';
import React from 'react';
import { AttachmentFileInput, Group, Message, User } from '../../gql';

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
  group: Pick<Group, 'name'>;
};

interface MessagesContextProps extends MessagesContextProviderProps {
  attachments: File[];
  error: ApolloError | undefined;
  setError: (error: ApolloError | undefined) => void;
  addAttachment: (attachment: File) => void;
  removeAttachment: (attachment: File) => void;
  resetAttachments: () => void;
  recipients: Recipient[];
  setRecipients: (recipients: Recipient[]) => void;
  selectedUserList: UserLists | undefined;
  setSelectedUserList: (userList: UserLists | undefined) => void;
  embeddedImages: AttachmentFileInput[];
  addEmbeddedImage: (image: AttachmentFileInput) => void;
  addEmbeddedImages: (images: AttachmentFileInput[]) => void;
  removeEmbeddedImage: (image: AttachmentFileInput) => void;
  slateContent: string;
  setSlateContent: (value: string) => void;
  reuseMessage: LatestMessagesType | undefined;
  setReuseMessage: (value: LatestMessagesType | undefined) => void;
}

export const MessagesContext = React.createContext<MessagesContextProps>({
  groupId: -1,
  whichUser: true,
  attachments: [],
  error: undefined,
  setError: () => {},
  addAttachment: () => {},
  removeAttachment: () => {},
  resetAttachments: () => {},
  recipients: [],
  setRecipients: () => {},
  selectedUserList: undefined,
  setSelectedUserList: () => {},
  embeddedImages: [],
  addEmbeddedImage: () => {},
  addEmbeddedImages: () => {},
  removeEmbeddedImage: () => {},
  slateContent: '',
  setSlateContent: () => {},
  reuseMessage: undefined,
  setReuseMessage: () => {},
});

const MessagesContextProvider = ({
  children,
  groupId,
  whichUser,
}: { children: React.ReactNode } & MessagesContextProviderProps) => {
  const [attachments, setAttachments] = React.useState<File[]>([]);
  const [error, setError] = React.useState<ApolloError | undefined>();
  const [recipients, setRecipients] = React.useState<Recipient[]>([]);
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

  const addAttachment = (attachment: File) => {
    if (attachments.findIndex((a) => a.name === attachment.name) !== -1) return;
    const newAttachments = [...attachments];
    newAttachments.push(attachment);
    setAttachments(newAttachments);
  };

  const addEmbeddedImage = (image: AttachmentFileInput) => {
    if (embeddedImages.findIndex((i) => i.cid === image.cid) !== -1) return;
    const newEmbeddedImages = [...embeddedImages];
    newEmbeddedImages.push(image);
    setEmbeddedImages(newEmbeddedImages);
  };

  const addEmbeddedImages = (images: AttachmentFileInput[]) => {
    images.forEach((i) => addEmbeddedImage(i));
    const newEmbeddedImages = [...embeddedImages];
    newEmbeddedImages.push(...images);
    setEmbeddedImages(newEmbeddedImages);
  };

  const removeAttachment = (attachment: File) => {
    const newAttachments = [...attachments];
    const index = newAttachments.indexOf(attachment);
    if (index === -1) return;
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  const removeEmbeddedImage = (embeddedImage: AttachmentFileInput) => {
    const newEmbeddedImages = [...embeddedImages];
    const index = newEmbeddedImages.indexOf(embeddedImage);
    if (index === -1) return;
    newEmbeddedImages.splice(index, 1);
    setEmbeddedImages(newEmbeddedImages);
  };

  const resetAttachments = () => {
    setAttachments([]);
    setEmbeddedImages([]);
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
        resetAttachments,
        recipients,
        setRecipients,
        selectedUserList,
        setSelectedUserList,
        embeddedImages,
        addEmbeddedImage,
        addEmbeddedImages,
        removeEmbeddedImage,
        slateContent,
        setSlateContent,
        reuseMessage,
        setReuseMessage,
      }}
    >
      {children}
    </MessagesContext.Provider>
  );
};

export default MessagesContextProvider;
