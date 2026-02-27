import type { Value } from 'platejs';
import { decodeMessageSlateContentAny } from './messageSlateContentV2';
import { migrateLegacyMessageValueToV2Value } from './legacy/migrateLegacyMessageValue';

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

