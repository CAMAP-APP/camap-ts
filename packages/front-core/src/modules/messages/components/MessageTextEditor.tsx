import React from 'react';
import type { Value } from 'platejs';
import { encodeFileToBase64String } from '../../../utils/encoding';
import { MessagesContext } from '../MessagesContext';
import AttachmentList from './attachments/AttachmentList';
import InsertAttachmentButton from '../editor/toolbar/InsertAttachmentButton';
import { PlateMessageEditor } from '../editor/PlateMessageEditor';
import { encodeMessageSlateContentV2, getMessageEditorValueFromSlateContent } from '../editor/messageEditorSchema';
import { reusedMessageEmbeddedImages } from '../editor/reusedMessageEmbeddedImages';
import { getCid } from '../utils/cid';
import imageCompression from 'browser-image-compression';

// Formik passes (name, value, onBlur, onChange) props.
type MessageTextEditorFormikProps = {
  name: string;
  value: string;
  onBlur: any;
  onChange: any;
};

const MessageTextEditor = ({ ...props }: MessageTextEditorFormikProps) => {
  const {
    addEmbeddedImages,
    removeEmbeddedImage,
    embeddedImages,
    setSlateContent,
    reuseMessage,
    groupId,
  } = React.useContext(MessagesContext);

  const [externalValue, setExternalValue] = React.useState<Value | undefined>();

  React.useEffect(() => {
    if (!reuseMessage || !reuseMessage.slateContent) return;
    const reuseMessageSlateContent = reuseMessage.slateContent;

    try {
      const parsed = getMessageEditorValueFromSlateContent(reuseMessageSlateContent);
      setExternalValue(parsed);
      addEmbeddedImages(reusedMessageEmbeddedImages(
        parsed,
        reuseMessage.attachments || undefined
      ));
      setSlateContent(reuseMessageSlateContent);
    } catch (error) {
      console.error('Error getting message editor value from slate content:', error);
    }
  }, [addEmbeddedImages, reuseMessage, setSlateContent]);

  const onAddImages = async (files: File[]) => {
    const images = await Promise.all(files.map(async (f) => ({
      filename: f.name,
      contentType: f.type,
      encoding: 'base64',
      content: await encodeFileToBase64String(
        await imageCompression(f, {
          maxSizeMB: 1,
          maxWidthOrHeight: 500,
          useWebWorker: true,
        })
      ),
      cid: getCid(f.name),
    })));
    addEmbeddedImages(images);
  };

  const onSetValue = (value: string) => {
    cleanupEmbeddedImages(value);
  };

  const cleanupEmbeddedImages = (serializedHtml: string) => {
    const currentEmbeddedImages = [...embeddedImages];
    currentEmbeddedImages.forEach((image) => {
      if (!serializedHtml.includes(image.cid!)) {
        removeEmbeddedImage(image);
      }
    });
  };

  return (
    <PlateMessageEditor
      {...props}
      groupId={groupId}
      externalValue={externalValue}
      onAddImagesCustomHandle={onAddImages}
      onHtmlSerialized={onSetValue}
      onBlurSaveSlateValue={(value: Value) => {
        setSlateContent(encodeMessageSlateContentV2(value));
      }}
      toolbarEnd={<InsertAttachmentButton />}
      belowEditor={<AttachmentList />}
    />
  );
};

export default MessageTextEditor;
