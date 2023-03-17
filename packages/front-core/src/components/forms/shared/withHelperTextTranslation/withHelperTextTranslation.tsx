import React from 'react';
import { useTranslation } from 'react-i18next';
import yupHelperTextTranslator from '../../utils/yupHelperTextTranslator';

export default function withHelperTextTranslation<T extends { helperText?: React.ReactNode }>(
  Wrapped: React.ComponentType<T>,
  tranformPropsFunc?: Function,
) {
  const Wrapper = (props: T) => {
    const { t } = useTranslation(['yup'], { useSuspense: false });

    const p = tranformPropsFunc ? tranformPropsFunc(props) : props;
    p.helperText = yupHelperTextTranslator(t, p.helperText);

    return <Wrapped {...p} />;
  };

  return Wrapper;
}
