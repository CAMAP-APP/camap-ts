import type React from 'react';
import { NodeApi } from 'platejs';
import type { MessageEditor } from '../platePlugins';

const isParagraphNode = (node: unknown): boolean =>
  !!node &&
  typeof node === 'object' &&
  'type' in (node as any) &&
  (node as any).type === 'p';

const getNextSiblingPath = (path: number[]): number[] | null => {
  if (path.length === 0) return null;
  const lastIndex = path[path.length - 1];
  if (typeof lastIndex !== 'number') return null;
  return path.slice(0, -1).concat([lastIndex + 1]);
};

/**
 * Plate/Slate's default Enter behavior is inconsistent when the selection is on a void node (image).
 * This handler makes Enter behave like "insert a new paragraph after the image, and move the caret there".
 *
 * Returns true if the keypress was handled.
 */
export const mediaImageNodePatchEnter = (
  editor: MessageEditor,
  event: React.KeyboardEvent,
): boolean => {
  if (event.defaultPrevented) return false;
  if (event.key !== 'Enter') return false;
  if ((event.nativeEvent as any)?.isComposing) return false;
  if (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) return false;

  const imageEntry = editor.api.above({
    at: editor.selection ?? undefined,
    match: { type: 'img' },
  });
  if (!imageEntry) return false;

  const [, imagePath] = imageEntry;
  const paragraphPath = getNextSiblingPath(imagePath);
  if (!paragraphPath) return false;

  event.preventDefault();
  event.stopPropagation();

  const nextNode = NodeApi.get(editor as any, paragraphPath);
  if (!isParagraphNode(nextNode)) {
    editor.tf.insertNodes(
      { type: 'p', children: [{ text: '' }] },
      { at: paragraphPath },
    );
  }

  const textPath = paragraphPath.concat([0]);
  editor.tf.select({
    anchor: { path: textPath, offset: 0 },
    focus: { path: textPath, offset: 0 },
  });
  editor.tf.focus?.();
  return true;
};

