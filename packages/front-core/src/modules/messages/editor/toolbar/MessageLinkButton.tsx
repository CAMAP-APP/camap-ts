import { InsertLink } from '@mui/icons-material';
import React, { useCallback } from 'react';
import { upsertLink } from '@platejs/link';
import { NodeApi, type TRange, type TText } from 'platejs';
import { TextEditorToolbarButton } from './TextEditorToolbarButton';
import type { MessageEditor } from '../platePlugins';

const isTextNode = (value: unknown): value is TText =>
  !!value &&
  typeof value === 'object' &&
  'text' in (value as any) &&
  typeof (value as any).text === 'string';

const isWhitespace = (char: string) => /\s/.test(char);

const getSelectionOrTokenRange = (editor: MessageEditor): TRange | null => {
  const selection = editor.selection;
  if (!selection) return null;

  if (!editor.api.isCollapsed()) return selection;

  const path = selection.anchor.path;
  const node = NodeApi.get(editor as any, path);
  if (!isTextNode(node)) return selection;

  const offset = selection.anchor.offset;
  const text = node.text ?? '';
  if (!text) return selection;

  const leftStart = Math.max(0, Math.min(offset, text.length));
  let start = leftStart;
  while (start > 0 && !isWhitespace(text[start - 1] ?? '')) start -= 1;

  let end = leftStart;
  while (end < text.length && !isWhitespace(text[end] ?? '')) end += 1;

  if (start === end) return selection;

  return {
    anchor: { path, offset: start },
    focus: { path, offset: end },
  };
};

const pathKey = (path: number[]) => path.join('.');

const focusLinkInputAtPath = (path: number[]) => {
  const key = pathKey(path);

  const tryFocus = () => {
    const input = document.querySelector<HTMLInputElement>(
      `input[data-message-link-path="${key}"]`,
    );
    if (!input) return false;
    input.focus();
    input.select?.();
    return true;
  };

  // Let React commit the LinkNode edit box first.
  window.setTimeout(() => {
    if (tryFocus()) return;
    window.requestAnimationFrame(() => {
      tryFocus();
    });
  }, 0);
};

const MessageLinkButton = ({ editor }: { editor: MessageEditor }) => {

  const activeLinkEntry = editor.api.above({
    at: editor.selection ?? undefined,
    match: { type: 'a' },
  });

  const isActive = !!activeLinkEntry;
  const onMouseDown = useCallback((event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();

    const activeLinkEntry = editor.api.above({
      at: editor.selection ?? undefined,
      match: { type: 'a' },
    });
    // If the cursor/selection is already inside a link, just focus its edit input.
    if (activeLinkEntry) {
      // Unwrap link if already inside a link node
      const [, linkPath] = activeLinkEntry;
      editor.tf.unwrapNodes({
        at: linkPath,
        match: { type: 'a' },
      });
      return;
    }

    const range = getSelectionOrTokenRange(editor);
    if (!range) return;

    const selectedText = editor.api.string(range) || undefined;
    editor.tf.select(range);

    const url = selectedText.startsWith('http://') || selectedText.startsWith('https://') ? selectedText : `https://${selectedText}`;

    upsertLink(editor, {
      url,
      text: selectedText,
      skipValidation: true,
    });

    const createdLinkEntry = editor.api.above({
      at: editor.selection ?? undefined,
      match: { type: 'a' },
    });
    if (!createdLinkEntry) return;

    const [, linkPath] = createdLinkEntry;
    editor.tf.select(linkPath);
    focusLinkInputAtPath(linkPath);
  }, [editor]);

  return (
    <TextEditorToolbarButton
      active={isActive}
      onMouseDown={onMouseDown}
    >
      <InsertLink sx={{ display: 'block' }} />
    </TextEditorToolbarButton>
  );
};

export default MessageLinkButton;

