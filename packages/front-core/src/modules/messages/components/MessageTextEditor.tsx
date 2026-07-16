import React, { useCallback, useRef } from 'react';
import { createSlateEditor, type Value } from 'platejs';
import { encodeFileToBase64String } from '../../../utils/encoding';
import { MessagesContext } from '../MessagesContext';
import AttachmentList from './attachments/AttachmentList';
import InsertAttachmentButton from '../editor/toolbar/InsertAttachmentButton';
import { PlateMessageEditor } from '../editor/PlateMessageEditor';
import { encodeMessageSlateContentV2, getMessageEditorValueFromSlateContent } from '../editor/messageEditorSchema';
import { reusedMessageEmbeddedImages } from '../editor/reusedMessageEmbeddedImages';
import { getCid } from '../utils/cid';
import imageCompression from 'browser-image-compression';
import { serializeHtml } from '@platejs/core/static';
import { EMAIL_RENDER_PLUGINS } from '../editor/platePlugins';
import EmailEditorStatic from '../editor/nodes/EmailEditorStatic';
import { AttachmentFileInput } from '@gql';

// Formik passes (name, value, onBlur, onChange) props.
type MessageTextEditorFormikProps = {
  name: string;
  value: string;
  onBlur: any;
  onChange: any;
};

const MessageTextEditor = ({ name, onBlur, onChange }: MessageTextEditorFormikProps) => {
  const {
    addEmbeddedImages,
    removeEmbeddedImage,
    embeddedImages,
    setSlateContent,
    reuseMessage,
    groupId,
  } = React.useContext(MessagesContext);

  const [externalValue, setExternalValue] = React.useState<Value | undefined>();

  const plateValue = useRef<Value | undefined>();
  const plateImages = useRef<Array<File|AttachmentFileInput>>([]);

  const pendingSerialize = useRef<number | null>(null);

  const serializeToFormikHtml = useCallback(async () => {
    const currentEmbeddedImages = [...embeddedImages];
    currentEmbeddedImages.forEach((image) => {
      if(!plateImages.current.some(i => 'name' in i && i.name === image.filename || 'filename' in i && i.filename === image.filename))
        removeEmbeddedImage(image)
    });
    const imagesToAdd = await Promise.all(plateImages.current
      .filter(i => !!i &&!currentEmbeddedImages.some(ii => 'name' in i && ii.filename === i.name || 'filename' in i && ii.filename === i.filename))
      .map(async (f) => ({
        filename: 'name' in f ? f.name : f.filename,
        contentType: 'type' in f ? f.type : f.contentType,
        encoding: 'base64',
        content: f instanceof File ? await encodeFileToBase64String(
          await imageCompression(f, {
            maxSizeMB: 1,
            maxWidthOrHeight: 500,
            useWebWorker: true,
          })
        ) : f.content,
        cid: 'name' in f ? getCid(f.name) : f.cid,
      })));
    addEmbeddedImages(imagesToAdd);

    const html = await serializeHtml(createSlateEditor({
      plugins: EMAIL_RENDER_PLUGINS,
      value: plateValue.current,
    }), {
      stripClassNames: true,
      stripDataAttributes: true,
      editorComponent: EmailEditorStatic,
    });
    onChange(name)(html);
  }, [name, onChange, addEmbeddedImages, removeEmbeddedImage, embeddedImages, plateImages]);

  const scheduleSerialize = useCallback(() => {
    if (pendingSerialize.current) window.clearTimeout(pendingSerialize.current);
    pendingSerialize.current = window.setTimeout(() => {
      void serializeToFormikHtml();
    }, 150);
  }, [serializeToFormikHtml]);

  const onPlateChange = useCallback(({value: newValue, images: newImages}: {value: Value, images: Array<File|AttachmentFileInput>}) => {
    plateValue.current = newValue;
    plateImages.current = [...newImages];
    scheduleSerialize();
  }, [scheduleSerialize]);

  React.useEffect(() => {
    if (!reuseMessage || !reuseMessage.slateContent) {
      setExternalValue(undefined);
      return;
    }
    const reuseMessageSlateContent = reuseMessage.slateContent;

    try {
      const parsed = getMessageEditorValueFromSlateContent(reuseMessageSlateContent);
      setExternalValue(parsed);
      setSlateContent(reuseMessageSlateContent);
      onPlateChange({
        value: parsed,
        images: reusedMessageEmbeddedImages(parsed, reuseMessage.attachments || undefined)
      });
    } catch (error) {
      console.error('Error getting message editor value from slate content:', error);
    }
  }, [addEmbeddedImages, reuseMessage, setSlateContent, scheduleSerialize]);

  return (
    <PlateMessageEditor
      onChange={onPlateChange}
      groupId={groupId}
      externalValue={externalValue}
      onBlur={(value) => {
        setSlateContent(encodeMessageSlateContentV2(value));
      }}
      toolbarEnd={<InsertAttachmentButton />}
      belowEditor={<AttachmentList />}
    />
  );
};

export default MessageTextEditor;
