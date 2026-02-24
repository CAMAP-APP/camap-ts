import type { Value } from 'platejs';
import {
  MESSAGE_EDITOR_EMPTY_VALUE,
  MESSAGE_SLATE_CONTENT_VERSION,
  type MessageSlateContentV2,
} from './messageEditorSchema';
import { decodeMessageSlateContentAny } from './messageSlateContentV2';
import { migrateLegacyMessageValueToV2Value } from './legacy/migrateLegacyMessageValue';

export type GetMessageEditorValueResult =
  | { ok: true; source: 'empty' | 'v2' | 'legacy'; wrapper: MessageSlateContentV2 }
  | { ok: false; error: string; wrapper: MessageSlateContentV2 };

export const getMessageEditorValueFromSlateContent = (
  slateContent: string,
): GetMessageEditorValueResult => {
  const decoded = decodeMessageSlateContentAny(slateContent);

  if (!decoded.ok) {
    return {
      ok: false,
      error: decoded.error,
      wrapper: { v: MESSAGE_SLATE_CONTENT_VERSION, value: MESSAGE_EDITOR_EMPTY_VALUE },
    };
  }

  if (decoded.source === 'empty') {
    return { ok: true, source: 'empty', wrapper: decoded.wrapper };
  }

  if (decoded.source === 'v2') {
    return { ok: true, source: 'v2', wrapper: decoded.wrapper };
  }

  const migratedValue: Value = migrateLegacyMessageValueToV2Value(decoded.legacyValue);
  return {
    ok: true,
    source: 'legacy',
    wrapper: { v: MESSAGE_SLATE_CONTENT_VERSION, value: migratedValue },
  };
};

