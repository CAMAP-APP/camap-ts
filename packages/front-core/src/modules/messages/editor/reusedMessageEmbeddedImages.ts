import type { BaseNode } from 'slate';
import {
  AttachmentFileInput,
  AttachmentUnion,
  EmbeddedImageAttachment,
} from '../../../gql';
import { getContentAndTypeFromBase64EncodedImage } from '../../../utils/image';
import { isUrl } from '@utils/url';
import { getCid } from '../utils/cid';
import { hydrateMessageImagesFromAttachments } from './hydrateMessageImagesFromAttachments';

/**
 * Build AttachmentFileInput list for images in a reused message, and hydrate
 * image node urls from stored attachment bytes when the slate url is not a data: URL.
 */
export const reusedMessageEmbeddedImages = (
  newContentValue: BaseNode[],
  attachments: AttachmentUnion[] | undefined,
): AttachmentFileInput[] => {
  const embeddedImageAttachments =
    attachments
      ?.map((a) => ('cid' in a ? (a as EmbeddedImageAttachment) : null))
      .filter((a): a is EmbeddedImageAttachment => !!a) || [];

  hydrateMessageImagesFromAttachments(
    newContentValue as Parameters<typeof hydrateMessageImagesFromAttachments>[0],
    embeddedImageAttachments,
  );

  const embeddedImagesToAdd: AttachmentFileInput[] = [];
  const seenCids = new Set<string>();

  const recursivelyCheckNode = (nodes: BaseNode[]) => {
    nodes.forEach((n) => {
      if (!('type' in n)) return;

      if (n.type !== 'img') {
        if ('children' in n && Array.isArray(n.children)) {
          recursivelyCheckNode(
            n.children.filter((x: unknown) => x != null && typeof x === 'object'),
          );
        }
        return;
      }

      const imageNode = n as {
        url?: string;
        dataUrl?: string;
        filename?: string;
        cid?: string;
      };
      const imageSource = imageNode.dataUrl ?? imageNode.url;

      const stored = embeddedImageAttachments.find(
        (a) =>
          a.cid === imageNode.cid ||
          (imageNode.filename && a.cid === getCid(imageNode.filename)),
      );

      let content = stored?.content;
      let contentType = stored?.contentType || undefined;
      let cid = stored?.cid || imageNode.cid || '';

      if ((!content || !contentType) && imageSource?.startsWith('data:image')) {
        const [fromUrlContent, fromUrlType] =
          getContentAndTypeFromBase64EncodedImage(imageSource);
        content = content || fromUrlContent;
        contentType = contentType || fromUrlType || undefined;
      }

      if (
        !content &&
        imageNode.url &&
        !imageNode.url.startsWith('data:image') &&
        isUrl(imageNode.url)
      ) {
        // External/catalog http(s) image — keep as URL in HTML, no attachment.
        return;
      }

      if (!content) return;

      if (!cid) {
        cid = imageNode.filename
          ? getCid(imageNode.filename)
          : getCid(`image-${embeddedImagesToAdd.length}`);
      }

      if (seenCids.has(cid)) return;
      seenCids.add(cid);

      imageNode.cid = cid;

      embeddedImagesToAdd.push({
        filename: imageNode.filename || stored?.filename || 'image',
        contentType: contentType || 'image/png',
        encoding: 'base64',
        content,
        cid,
      });
    });
  };

  recursivelyCheckNode(newContentValue);

  return embeddedImagesToAdd;
};
