import type { Value } from 'platejs';
import {
  MESSAGE_EDITOR_EMPTY_VALUE,
  MESSAGE_SLATE_CONTENT_VERSION,
  type MessageSlateContentV2,
} from './messageEditorSchema';

export const encodeMessageSlateContentV2 = (value: Value): string => {
  const wrapper: MessageSlateContentV2 = {
    v: MESSAGE_SLATE_CONTENT_VERSION,
    value,
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

