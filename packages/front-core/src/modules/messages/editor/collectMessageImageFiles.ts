import type { Value } from 'platejs';
import { dataURItoFile } from '../utils/dataURItoFile';
import { getCid } from '../utils/cid';
import { getImageFile, registerImageFile } from '../utils/imageFileRegistry';

export type CollectedMessageImage = {
  file: File;
  cid: string;
  filename: string;
};

type ImageLikeNode = {
  type?: string;
  url?: string | ArrayBuffer;
  file?: unknown;
  cid?: string;
  filename?: string;
  id?: string | number;
  children?: ImageLikeNode[];
};

const isImageNode = (node: ImageLikeNode, imgType: string) =>
  node.type === imgType || node.type === 'img';

const resolveImage = (
  node: ImageLikeNode,
  index: number,
): CollectedMessageImage | undefined => {
  // JSON round-trips turn File into {} — drop so recovery can run.
  if (node.file && !(node.file instanceof File)) {
    delete node.file;
  }

  const filename =
    (typeof node.filename === 'string' && node.filename) ||
    (node.file instanceof File && node.file.name) ||
    node.id?.toString() ||
    `image-${index}`;

  if (node.file instanceof File) {
    const file = node.file;
    const cid = node.cid || getCid(file.name) || getCid(filename);
    node.cid = cid;
    node.filename = node.filename || file.name;
    registerImageFile(cid, file);
    // Do not keep File on the node — it becomes {} after any JSON clone.
    delete node.file;
    return { file, cid, filename: node.filename || file.name };
  }

  const registered = getImageFile(node.cid) || getImageFile(getCid(filename));
  if (registered) {
    const cid = node.cid || getCid(registered.name) || getCid(filename);
    node.cid = cid;
    node.filename = node.filename || registered.name;
    registerImageFile(cid, registered);
    return { file: registered, cid, filename: node.filename || registered.name };
  }

  const url = node.url?.toString();
  if (url?.startsWith('data:image')) {
    const file = dataURItoFile(url, filename);
    const cid = node.cid || getCid(file.name) || getCid(filename);
    node.cid = cid;
    node.filename = filename;
    registerImageFile(cid, file);
    return { file, cid, filename };
  }

  return undefined;
};

/** Recursively collect recoverable embedded images from a Plate/Slate value. */
export const collectMessageImages = (
  nodes: Value | ImageLikeNode[],
  imgType = 'img',
): CollectedMessageImage[] => {
  const images: CollectedMessageImage[] = [];

  const walk = (list: ImageLikeNode[]) => {
    for (const node of list) {
      if (!node || typeof node !== 'object') continue;

      if (isImageNode(node, imgType)) {
        const image = resolveImage(node, images.length);
        if (image) images.push(image);
      }

      if (Array.isArray(node.children)) {
        walk(node.children);
      }
    }
  };

  walk(nodes as ImageLikeNode[]);
  return images;
};

/** @deprecated Prefer collectMessageImages — kept for call sites that only need Files. */
export const collectMessageImageFiles = (
  nodes: Value | ImageLikeNode[],
  imgType = 'img',
): File[] => collectMessageImages(nodes, imgType).map((image) => image.file);

/** Collect cid / filename keys present on image nodes (for pruning stale attachments). */
export const collectMessageImageKeys = (
  nodes: Value | ImageLikeNode[],
  imgType = 'img',
): Set<string> => {
  const keys = new Set<string>();

  const walk = (list: ImageLikeNode[]) => {
    for (const node of list) {
      if (!node || typeof node !== 'object') continue;

      if (isImageNode(node, imgType)) {
        if (node.cid) keys.add(node.cid);
        if (typeof node.filename === 'string' && node.filename) {
          keys.add(node.filename);
          keys.add(getCid(node.filename));
        }
      }

      if (Array.isArray(node.children)) {
        walk(node.children);
      }
    }
  };

  walk(nodes as ImageLikeNode[]);
  return keys;
};
