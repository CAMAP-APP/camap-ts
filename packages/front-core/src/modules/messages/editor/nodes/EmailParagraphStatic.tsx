import type { HTMLAttributes, ReactNode } from 'react';
import type { TElement } from 'platejs';
import { MESSAGE_PARAGRAPH_MARGIN_BOTTOM } from '../plateStyles';

type Props = {
  element: TElement;
  children: ReactNode;
  attributes?: HTMLAttributes<HTMLParagraphElement>;
};

export default function EmailParagraphStatic({ children, attributes }: Props) {
  const filteredAttributes = Object.fromEntries(
    Object.entries(attributes ?? {})
      .filter((att) => !att[0].startsWith('data-slate-'))
  );
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
      {children}
    </p>
  );
}
