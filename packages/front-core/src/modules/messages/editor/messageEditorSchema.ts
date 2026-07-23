import type { Value } from 'platejs';
import { migrateLegacyMessageValueToV2Value } from './legacy/migrateLegacyMessageValue';

export const MESSAGE_SLATE_CONTENT_VERSION = 2 as const;

export type MessageSlateContentV2 = {
  v: typeof MESSAGE_SLATE_CONTENT_VERSION;
  value: Value;
};

export type MessageAlignment = 'left' | 'center' | 'right';

export type MessageImageElement = {
  type: 'img';
  url: string | ArrayBuffer;

  cid?: string;
  filename?: string;
  align?: MessageAlignment;
  children: [{ text: '' }];
};

export type MessageLinkElement = {
  type: 'a';
  url: string;
  children: any[];
};

export type MessageBlockElement = {
  type: 'p' | 'h1' | 'h2';
  align?: MessageAlignment;
  /**
   * Used by `@platejs/list` (indent list / flat list).
   * We keep it optional so non-list blocks remain clean.
   */
  indent?: number;
  listStyleType?: string;
  listStart?: number;
  children: any[];
};

export const MESSAGE_EDITOR_EMPTY_VALUE: Value = [
  { type: 'p', children: [{ text: '' }] },
];

/** Drop non-serializable `file` (File → {} in JSON) before persisting slate content. */
const omitImageFileProperties = (nodes: Value): Value =>
  nodes.map((node) => {
    if (!node || typeof node !== 'object') return node;
    const { file: _file, ...rest } = node as Record<string, unknown>;
    if (Array.isArray(rest.children)) {
      return {
        ...rest,
        children: omitImageFileProperties(rest.children as Value),
      } as (typeof nodes)[number];
    }
    return rest as (typeof nodes)[number];
  });

export const encodeMessageSlateContentV2 = (value: Value): string => {
  const wrapper: MessageSlateContentV2 = {
    v: MESSAGE_SLATE_CONTENT_VERSION,
    value: omitImageFileProperties(value),
  };
  return btoa(encodeURIComponent(JSON.stringify(wrapper)));
};

export type DecodeMessageSlateContentResult =
  | { ok: true; source: 'v2'; wrapper: MessageSlateContentV2 }
  | { ok: true; source: 'legacy'; legacyValue: unknown }
  | { ok: true; source: 'empty'; wrapper: MessageSlateContentV2 }
  | { ok: false; error: string };

export const decodeMessageSlateContentAny = (
  slateContent: string,
): DecodeMessageSlateContentResult => {
  if (!slateContent) {
    return {
      ok: true,
      source: 'empty',
      wrapper: { v: MESSAGE_SLATE_CONTENT_VERSION, value: MESSAGE_EDITOR_EMPTY_VALUE },
    };
  }

  let decoded: string;
  try {
    decoded = decodeURIComponent(atob(slateContent));
  } catch (e) {
    return { ok: false, error: `Failed to base64 decode slateContent: ${(e as Error).message}` };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(decoded);
  } catch (e) {
    return { ok: false, error: `Failed to JSON parse slateContent: ${(e as Error).message}` };
  }

  if (
    parsed &&
    typeof parsed === 'object' &&
    'v' in parsed &&
    'value' in parsed &&
    (parsed as any).v === MESSAGE_SLATE_CONTENT_VERSION &&
    Array.isArray((parsed as any).value)
  ) {
    return { ok: true, source: 'v2', wrapper: parsed as MessageSlateContentV2 };
  }

  // Legacy: base64(JSON array) from SlateTextEditor.
  if (Array.isArray(parsed)) {
    return { ok: true, source: 'legacy', legacyValue: parsed };
  }

  return { ok: false, error: 'Unsupported slateContent shape.' };
};

export const getMessageEditorValueFromSlateContent = (
  slateContent: string,
): Value => {
  const decoded = decodeMessageSlateContentAny(slateContent);

  if (!decoded.ok) {
    throw decoded.error;
  }

  if (decoded.source === 'legacy') {
    const migratedValue: Value = migrateLegacyMessageValueToV2Value(decoded.legacyValue);
    return migratedValue;
  }

  if (decoded.source === 'v2' || decoded.source === 'empty') {
    return decoded.wrapper.value;
  }

  throw new Error('Unsupported slateContent shape.');
};