import { isEqual } from 'lodash';
import React, { useCallback } from 'react';
import { BaseNode, Node } from 'slate';
import SlateTextEditor, {
  EMPTY_SLATE_VALUE,
  SlateTextEditorProps,
} from '../../../components/textEditor/SlateTextEditor';
import FormatTypes, {
  CustomSlateImageElement,
} from '../../../components/textEditor/TextEditorFormatType';
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
import InsertAttachmentButton from './attachments/InsertAttachmentButton';

const MessageTextEditor = ({ ...props }: SlateTextEditorProps) => {
  const {
    addEmbeddedImage,
    addEmbeddedImages,
    removeEmbeddedImage,
    embeddedImages,
    setSlateContent,
    reuseMessage,
    groupId,
  } = React.useContext(MessagesContext);

  const [customValue, setCustomValue] = React.useState<Node[] | undefined>();

  const checkEmbeddedImages = useCallback((
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
          if (n.type !== FormatTypes.image) {
            if ('children' in n) {
              recursivelyCheckNode(n.children);
            }
          } else {
            const imageNode = n as CustomSlateImageElement;
            const [content, contentType] =
              getContentAndTypeFromBase64EncodedImage(imageNode.imageSource);

            const embeddedImageAttachment = embeddedImageAttachments?.find(
              (a) => a && a.content === content,
            );

            let cid: string;
            if (embeddedImageAttachment) {
              cid = embeddedImageAttachment.cid;
            } else {
              cid = removeSpaces(removeAccents(imageNode.imageName));
            }

            if (
              !imageNode.imageSource.startsWith('data:image') &&
              isUrl(imageNode.imageSource)
            ) {
              return;
            }

            embeddedImagesToAdd.push({
              filename: imageNode.imageName,
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
    let slateContentValue: BaseNode[];
    try {
      slateContentValue = JSON.parse(
        decodeURIComponent(atob(reuseMessageSlateContent)),
      );
    } catch (e) {
      // Silently ignore the issue
      return;
    }
    if (slateContentValue !== customValue) {
      setCustomValue(slateContentValue);
      checkEmbeddedImages(
        slateContentValue,
        reuseMessage.attachments || undefined,
      );
    }
  }, [checkEmbeddedImages, customValue, reuseMessage, setSlateContent]);

  React.useEffect(() => {
    if (!customValue) return;

    setCustomValue(undefined);
  }, [customValue]);

  const onBlurEditor = (value: Node[]) => {
    // Save the value to context, to later save it to the DB.
    if (isEqual(value, EMPTY_SLATE_VALUE)) {
      // Value is empty
      setSlateContent('');
    } else {
      setSlateContent(btoa(encodeURIComponent(JSON.stringify(value))));
    }
  };

  const onAddImages = useCallback(async (files: File[]) => {
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
  }, [addEmbeddedImage, addEmbeddedImages]);


  const cleanupEmbeddedImages = useCallback((serializedHtml: string) => {
    const currentEmbeddedImages = [...embeddedImages];
    currentEmbeddedImages.forEach((image) => {
      if (!serializedHtml.includes(image.cid!)) {
        removeEmbeddedImage(image);
      }
    });
  }, [embeddedImages, removeEmbeddedImage]);

  const onSetValue = useCallback((value: string) => {
    cleanupEmbeddedImages(value);
  }, [cleanupEmbeddedImages]);

  return (
    <SlateTextEditor
      {...props}
      onBlurEditorCustomHandler={onBlurEditor}
      onAddImagesCustomHandler={onAddImages}
      onSetValueCustomHandler={onSetValue}
      customToolbarButtons={[
        <InsertAttachmentButton key="InsertAttachmentButton" />,
      ]}
      customAdditionalComponents={[<AttachmentList key="AttachmentList" />]}
      groupId={groupId}
      customValue={customValue}
    />
  );
};

export default MessageTextEditor;
