import type { HTMLAttributes, ReactNode } from 'react';
import { NodeApi, type TElement } from 'platejs';
import { MESSAGE_PARAGRAPH_MARGIN_BOTTOM } from '../plateStyles';

type Props = {
  element: TElement;
  children: ReactNode;
  attributes?: HTMLAttributes<HTMLParagraphElement>;
};

export default function EmailParagraphStatic({ children, attributes, element }: Props) {
  const filteredAttributes = Object.fromEntries(
    Object.entries(attributes ?? {})
      .filter((att) => !att[0].startsWith('data-slate-'))
  );
  const isEmpty = NodeApi.string(element) === '';

  return (
    <p
      {...filteredAttributes}
      className={attributes?.className?.replace('slate-p', '')}
      style={{
        ...attributes?.style,
        marginTop: 0,
        marginBottom: MESSAGE_PARAGRAPH_MARGIN_BOTTOM,
      }}
    >
      {isEmpty ? <br /> : children}
    </p>
  );
}
