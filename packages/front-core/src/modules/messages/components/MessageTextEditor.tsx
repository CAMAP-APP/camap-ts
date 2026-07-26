import React, { useCallback, useEffect, useRef } from 'react';
import { createSlateEditor, type Value } from 'platejs';
import { encodeFileToBase64String } from '../../../utils/encoding';
import { EmbeddedImagesFlushResult, MessagesContext } from '../MessagesContext';
import AttachmentList from './attachments/AttachmentList';
import InsertAttachmentButton from '../editor/toolbar/InsertAttachmentButton';
import { PlateMessageEditor } from '../editor/PlateMessageEditor';
import {
  encodeMessageSlateContentV2,
  getMessageEditorValueFromSlateContent,
} from '../editor/messageEditorSchema';
import { reusedMessageEmbeddedImages } from '../editor/reusedMessageEmbeddedImages';
import { collectMessageImageKeys } from '../editor/collectMessageImageFiles';
import type { CollectedMessageImage } from '../editor/collectMessageImageFiles';
import { getCid } from '../utils/cid';
import imageCompression from 'browser-image-compression';
import { serializeHtml } from '@platejs/core/static';
import { EMAIL_RENDER_PLUGINS } from '../editor/platePlugins';
import EmailEditorStatic from '../editor/nodes/EmailEditorStatic';
import { AttachmentFileInput } from '@gql';
import { dataURItoFile } from '../utils/dataURItoFile';
import { getBase64EncodedImage } from '../../../utils/image';

// Formik passes (name, value, onBlur, onChange) props.
type MessageTextEditorFormikProps = {
  name: string;
  value: string;
  onBlur: any;
  onChange: any;
  /** Bumped after a successful send so the Plate editor remounts empty. */
  formResetKey?: number;
};

type PlateImageSource = CollectedMessageImage | AttachmentFileInput;

const isValidAttachment = (
  image: Partial<AttachmentFileInput> | null | undefined,
): image is AttachmentFileInput =>
  !!(
    image &&
    typeof image.filename === 'string' &&
    image.filename.length > 0 &&
    typeof image.contentType === 'string' &&
    image.contentType.length > 0 &&
    typeof image.content === 'string' &&
    image.content.length > 0 &&
    typeof image.encoding === 'string' &&
    image.encoding.length > 0
  );

const imageIdentity = (image: PlateImageSource): string | undefined => {
  if ('file' in image && image.file instanceof File) {
    return image.cid || getCid(image.file.name) || image.filename;
  }
  return image.cid || (image.filename ? getCid(image.filename) : undefined);
};

const MessageTextEditor = ({
  name,
  onChange,
  formResetKey = 0,
}: MessageTextEditorFormikProps) => {
  const {
    setEmbeddedImages,
    embeddedImages,
    setSlateContent,
    reuseMessage,
    groupId,
    registerEmbeddedImagesFlusher,
    replaceAttachments,
  } = React.useContext(MessagesContext);

  const [externalValue, setExternalValue] = React.useState<Value | undefined>();

  const plateValue = useRef<Value | undefined>();
  const plateImages = useRef<PlateImageSource[]>([]);
  const latestHtmlRef = useRef('');
  const latestSlateContentRef = useRef('');

  const pendingSerializeTimer = useRef<number | null>(null);
  const serializeGeneration = useRef(0);
  const inFlightSerialize = useRef<Promise<EmbeddedImagesFlushResult> | null>(null);

  const embeddedImagesRef = useRef([...embeddedImages]);
  useEffect(() => {
    embeddedImagesRef.current = [...embeddedImages];
  }, [embeddedImages]);

  const toAttachment = useCallback(async (
    source: PlateImageSource,
  ): Promise<AttachmentFileInput | null> => {
    if ('file' in source && source.file instanceof File) {
      const compressed = await imageCompression(source.file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 500,
        useWebWorker: true,
      });
      const attachment: AttachmentFileInput = {
        filename: source.filename || source.file.name,
        contentType:
          source.file.type || compressed.type || 'application/octet-stream',
        encoding: 'base64',
        content: await encodeFileToBase64String(compressed),
        cid: source.cid || getCid(source.filename || source.file.name),
      };
      return isValidAttachment(attachment) ? attachment : null;
    }

    return isValidAttachment(source) ? source : null;
  }, []);

  const serializeToFormikHtml = useCallback(async (): Promise<EmbeddedImagesFlushResult> => {
    const generation = ++serializeGeneration.current;
    const imagesInEditor = plateImages.current.filter(Boolean);

    const encoded = (
      await Promise.all(imagesInEditor.map((f) => toAttachment(f)))
    ).filter(isValidAttachment);

    if (generation !== serializeGeneration.current) {
      return {
        attachments: embeddedImagesRef.current,
        html: latestHtmlRef.current,
        slateContent: latestSlateContentRef.current,
      };
    }

    embeddedImagesRef.current = encoded;
    setEmbeddedImages(encoded);

    const valueForSerialize = plateValue.current;
    const html = await serializeHtml(
      createSlateEditor({
        plugins: EMAIL_RENDER_PLUGINS,
        value: valueForSerialize,
      }),
      {
        stripClassNames: true,
        stripDataAttributes: true,
        editorComponent: EmailEditorStatic,
      },
    );

    if (generation !== serializeGeneration.current) {
      return {
        attachments: embeddedImagesRef.current,
        html: latestHtmlRef.current,
        slateContent: latestSlateContentRef.current,
      };
    }

    const slateContent = valueForSerialize
      ? encodeMessageSlateContentV2(valueForSerialize)
      : latestSlateContentRef.current;

    latestHtmlRef.current = html;
    latestSlateContentRef.current = slateContent;
    setSlateContent(slateContent);
    onChange(name)(html);
    return { attachments: encoded, html, slateContent };
  }, [name, onChange, setEmbeddedImages, setSlateContent, toAttachment]);

  const runSerialize = useCallback(() => {
    const promise = serializeToFormikHtml().finally(() => {
      if (inFlightSerialize.current === promise) {
        inFlightSerialize.current = null;
      }
    });
    inFlightSerialize.current = promise;
    return promise;
  }, [serializeToFormikHtml]);

  const scheduleSerialize = useCallback(() => {
    if (pendingSerializeTimer.current) {
      window.clearTimeout(pendingSerializeTimer.current);
    }
    pendingSerializeTimer.current = window.setTimeout(() => {
      pendingSerializeTimer.current = null;
      void runSerialize();
    }, 150);
  }, [runSerialize]);

  const flushEmbeddedImages = useCallback(async () => {
    if (pendingSerializeTimer.current) {
      window.clearTimeout(pendingSerializeTimer.current);
      pendingSerializeTimer.current = null;
    }
    if (inFlightSerialize.current) {
      await inFlightSerialize.current;
    }
    return runSerialize();
  }, [runSerialize]);

  useEffect(() => {
    registerEmbeddedImagesFlusher(flushEmbeddedImages);
    return () => registerEmbeddedImagesFlusher(null);
  }, [flushEmbeddedImages, registerEmbeddedImagesFlusher]);

  const onPlateChange = useCallback(
    ({
      value: newValue,
      imagesToUpload,
    }: {
      value: Value;
      imagesToUpload: CollectedMessageImage[];
    }) => {
      plateValue.current = newValue;

      const keysInValue = collectMessageImageKeys(newValue);

      // Keep reuse AttachmentFileInputs that still match nodes, until Files replace them.
      const retainedAttachments = plateImages.current.filter(
        (image): image is AttachmentFileInput => {
          if ('file' in image && image.file instanceof File) return false;
          if (!isValidAttachment(image)) return false;
          const identity = imageIdentity(image);
          if (!identity || !keysInValue.has(identity)) return false;
          return !imagesToUpload.some(
            (collected) => imageIdentity(collected) === identity,
          );
        },
      );

      plateImages.current = [...imagesToUpload, ...retainedAttachments];
      scheduleSerialize();
    },
    [scheduleSerialize],
  );

  React.useEffect(() => {
    if (!reuseMessage || !reuseMessage.slateContent) {
      setExternalValue(undefined);
      return;
    }
    const reuseMessageSlateContent = reuseMessage.slateContent;

    try {
      const parsed = getMessageEditorValueFromSlateContent(reuseMessageSlateContent);
      const embedded = reusedMessageEmbeddedImages(
        parsed,
        reuseMessage.attachments || undefined,
      ).filter(isValidAttachment);

      plateValue.current = parsed;
      plateImages.current = embedded;
      setExternalValue(parsed);
      setSlateContent(reuseMessageSlateContent);
      latestSlateContentRef.current = reuseMessageSlateContent;
      setEmbeddedImages(embedded);
      scheduleSerialize();

      // Restore file attachments that were stored with content.
      const restoredFiles: File[] = [];
      (reuseMessage.attachments || []).forEach((attachment) => {
        if (!('fileName' in attachment) || !attachment.fileName) return;
        const withContent = attachment as {
          fileName: string;
          content?: string | null;
          fileContent?: string | null;
          contentType?: string | null;
        };
        const bytes = withContent.fileContent || withContent.content;
        if (!bytes) return;
        const dataUrl = getBase64EncodedImage(
          bytes,
          withContent.contentType || 'application/octet-stream',
        );
        restoredFiles.push(dataURItoFile(dataUrl, withContent.fileName));
      });
      replaceAttachments(restoredFiles);
    } catch (error) {
      console.error('Error getting message editor value from slate content:', error);
    }
  }, [
    reuseMessage,
    setSlateContent,
    setEmbeddedImages,
    scheduleSerialize,
    replaceAttachments,
  ]);

  // After send, Formik resets but Plate keeps its own document unless remounted.
  React.useEffect(() => {
    if (formResetKey === 0) return;

    if (pendingSerializeTimer.current) {
      window.clearTimeout(pendingSerializeTimer.current);
      pendingSerializeTimer.current = null;
    }
    serializeGeneration.current += 1;
    inFlightSerialize.current = null;
    plateValue.current = undefined;
    plateImages.current = [];
    latestHtmlRef.current = '';
    latestSlateContentRef.current = '';
    setExternalValue(undefined);
  }, [formResetKey]);

  return (
    <PlateMessageEditor
      key={formResetKey}
      onChange={onPlateChange}
      groupId={groupId}
      externalValue={externalValue}
      onBlur={(value) => {
        const encoded = encodeMessageSlateContentV2(value);
        latestSlateContentRef.current = encoded;
        setSlateContent(encoded);
      }}
      toolbarEnd={<InsertAttachmentButton />}
      belowEditor={<AttachmentList />}
    />
  );
};

export default MessageTextEditor;
