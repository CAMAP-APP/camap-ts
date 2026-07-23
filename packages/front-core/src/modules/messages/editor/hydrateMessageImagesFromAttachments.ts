import type { Value } from 'platejs';
import { getBase64EncodedImage } from '../../../utils/image';
import { getCid } from '../utils/cid';

type AttachmentLike = {
  cid?: string | null;
  content?: string | null;
  contentType?: string | null;
  filename?: string | null;
  fileName?: string | null;
};

type ImageLikeNode = {
  type?: string;
  url?: string | ArrayBuffer;
  cid?: string;
  filename?: string;
  children?: ImageLikeNode[];
};

const isImageNode = (node: ImageLikeNode) =>
  node.type === 'img' || node.type === 'image';

const attachmentCid = (attachment: AttachmentLike) =>
  attachment.cid ||
  (attachment.filename ? getCid(attachment.filename) : undefined) ||
  (attachment.fileName ? getCid(attachment.fileName) : undefined);

/**
 * Rewrite image node urls from stored embedded-image attachments (cid → data URL).
 * Needed when slate was saved with blob: urls or when attachments are the source of truth.
 */
export const hydrateMessageImagesFromAttachments = <T extends Value | ImageLikeNode[]>(
  nodes: T,
  attachments: AttachmentLike[] | null | undefined,
): T => {
  const embedded = (attachments || []).filter(
    (a): a is AttachmentLike & { cid: string; content: string } =>
      !!a && typeof a.cid === 'string' && !!a.cid && typeof a.content === 'string' && !!a.content,
  );

  if (embedded.length === 0) return nodes;

  const byCid = new Map(
    embedded.map((a) => [attachmentCid(a) || a.cid, a] as const),
  );

  const walk = (list: ImageLikeNode[]) => {
    for (const node of list) {
      if (!node || typeof node !== 'object') continue;

      if (isImageNode(node)) {
        const cid =
          node.cid ||
          (typeof node.filename === 'string' ? getCid(node.filename) : undefined);
        const attachment = (cid && byCid.get(cid)) || undefined;
        if (attachment) {
          node.cid = attachment.cid;
          node.filename =
            node.filename ||
            attachment.filename ||
            attachment.fileName ||
            attachment.cid;
          const url = node.url?.toString() || '';
          if (!url.startsWith('data:image')) {
            node.url = getBase64EncodedImage(
              attachment.content,
              attachment.contentType || 'image/png',
            );
          }
        }
      }

      if (Array.isArray(node.children)) {
        walk(node.children);
      }
    }
  };

  walk(nodes as ImageLikeNode[]);
  return nodes;
};
