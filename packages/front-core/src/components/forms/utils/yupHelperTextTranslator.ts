import { TFunction } from 'i18next';
import React from 'react';

const yupHelperTextTranslator = (
  t: TFunction,
  helperText?: React.ReactNode,
) => {
  if (helperText) {
    let key: string;
    let values = {};
    if (typeof helperText === 'object') {
      key = (helperText as any).key;
      values = (helperText as any).values;
    } else {
      key = helperText as string;
    }
    return t(key, values);
  }
  return undefined;
};

export default yupHelperTextTranslator;
