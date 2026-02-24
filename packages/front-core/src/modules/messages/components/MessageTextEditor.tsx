import { isEqual } from 'lodash';
import React from 'react';
import type { BaseNode } from 'slate';
import type { Value } from 'platejs';
import {
  AttachmentFileInput,
  AttachmentUnion,
  EmbeddedImageAttachment,
} from '../../../gql';
import { encodeFileToBase64String } from '../../../utils/encoding';
import { removeAccents, removeSpaces } from '../../../utils/fomat/string';
import { getContentAndTypeFromBase64EncodedImage } from '../../../utils/image';
import { isUrl } from '../../../utils/url';
import { MessagesContext } from '../MessagesContext';
import AttachmentList from './attachments/AttachmentList';
import InsertAttachmentButton from '../editor/toolbar/InsertAttachmentButton';
import { PlateMessageEditor } from '../editor/PlateMessageEditor';
import {
  MESSAGE_EDITOR_EMPTY_VALUE,
  type MessageImageElement,
} from '../editor/messageEditorSchema';
import { encodeMessageSlateContentV2 } from '../editor/messageSlateContentV2';
import { getMessageEditorValueFromSlateContent } from '../editor/getMessageEditorValue';

// Formik passes (name, value, onBlur, onChange) props.
type MessageTextEditorFormikProps = {
  name: string;
  value: string;
  onBlur: any;
  onChange: any;
};

const MessageTextEditor = ({ ...props }: MessageTextEditorFormikProps) => {
  const {
    addEmbeddedImage,
    addEmbeddedImages,
    removeEmbeddedImage,
    embeddedImages,
    setSlateContent,
    reuseMessage,
    groupId,
  } = React.useContext(MessagesContext);

  const [externalValue, setExternalValue] = React.useState<Value | undefined>();

  const checkEmbeddedImages = React.useCallback((
    newContentValue: BaseNode[],
    attachments: AttachmentUnion[] | undefined,
  ) => {
    const embeddedImagesToAdd: AttachmentFileInput[] = [];
    const embeddedImageAttachments =
      attachments &&
      attachments.map((a) => {
        if ('cid' in a) {
          return a as EmbeddedImageAttachment;
        }
        return null;
      });

    const recursivelyCheckNode = (nodes: BaseNode[]) => {
      nodes.forEach((n) => {
        if ('type' in n) {
          if (n.type !== 'img') {
            if ('children' in n && Array.isArray(n.children)) {
              recursivelyCheckNode(n.children.filter((x: unknown) => x != null && typeof x === 'object'));
            }
          } else {
            const imageNode = n as unknown as MessageImageElement;
            const imageSource = imageNode.dataUrl || '';
            const [content, contentType] = getContentAndTypeFromBase64EncodedImage(imageSource);

            const embeddedImageAttachment = embeddedImageAttachments?.find(
              (a) => a && a.content === content,
            );

            let cid: string;
            if (embeddedImageAttachment) {
              cid = embeddedImageAttachment.cid;
            } else {
              cid = imageNode.filename
                ? removeSpaces(removeAccents(imageNode.filename))
                : (imageNode.cid ?? '');
            }

            if (
              imageNode.url &&
              !imageNode.dataUrl?.startsWith('data:image') &&
              isUrl(imageNode.url)
            ) {
              return;
            }

            embeddedImagesToAdd.push({
              filename: imageNode.filename ?? 'image',
              contentType,
              encoding: 'base64',
              content,
              cid,
            });
          }
        }
      });
    };

    recursivelyCheckNode(newContentValue);

    if (embeddedImagesToAdd.length) addEmbeddedImages(embeddedImagesToAdd);
  }, [addEmbeddedImages]);

  React.useEffect(() => {
    if (!reuseMessage || !reuseMessage.slateContent) return;
    const reuseMessageSlateContent = reuseMessage.slateContent;
    setSlateContent(reuseMessageSlateContent);

    const parsed = getMessageEditorValueFromSlateContent(reuseMessageSlateContent);
    setExternalValue(parsed.wrapper.value);

    checkEmbeddedImages(
      parsed.wrapper.value as unknown as BaseNode[],
      reuseMessage.attachments || undefined,
    );
  }, [checkEmbeddedImages, reuseMessage, setSlateContent]);

  const onAddImages = async (files: File[]) => {
    const base64EncodedFiles = await Promise.all(
      files.map((f) => encodeFileToBase64String(f)),
    );
    const images = files.map((f, index) => ({
      filename: f.name,
      contentType: f.type,
      encoding: 'base64',
      content: base64EncodedFiles[index].toString(),
      cid: removeSpaces(removeAccents(f.name)),
    }));
    if (images.length === 1) addEmbeddedImage(images[0]);
    else addEmbeddedImages(images);
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
      onExternalValueApplied={() => setExternalValue(undefined)}
      onAddImagesCustomHandle={onAddImages}
      onHtmlSerialized={onSetValue}
      onBlurSaveSlateValue={(value: Value) => {
        if (isEqual(value, MESSAGE_EDITOR_EMPTY_VALUE)) {
          setSlateContent('');
        } else {
          setSlateContent(encodeMessageSlateContentV2(value));
        }
      }}
      toolbarEnd={<InsertAttachmentButton />}
      belowEditor={<AttachmentList />}
    />
  );
};

export default MessageTextEditor;
