import { TFunction, useTranslation } from 'react-i18next';

export const useCamapTranslation = (
  transFiles: { [k: string]: string },
  loadCommon = false,
) => {
  const adaptedTransFiles = transFiles;
  if (loadCommon) {
    adaptedTransFiles['tCommon'] = 'translation';
  }

  const transFileKeys = Object.keys(adaptedTransFiles);

  const { t: _t, i18n } = useTranslation(
    transFileKeys.map((k) => adaptedTransFiles[k]),
  );

  const t = (key: string, options?: any) => {
    if (i18n.exists(key)) return _t(key, options);
    const ns = transFileKeys.find((tfk) => {
      return i18n.exists(`${adaptedTransFiles[tfk]}:${key}`);
    });

    if (ns) {
      return _t(`${adaptedTransFiles[ns]}:${key}`, options);
    }

    return key;
  };

  return transFileKeys.reduce(
    (acc, tfk) => {
      const newAcc = { ...acc };

      newAcc[tfk] = (key: string, options?: any) =>
        _t(`${adaptedTransFiles[tfk]}:${key}`, options);

      return newAcc;
    },
    { _t, t } as { _t: TFunction; [k: string]: TFunction },
  );
};
