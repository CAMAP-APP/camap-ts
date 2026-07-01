import theme from '@theme/default/theme';
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import type { TLinkElement } from 'platejs';

type Props = {
  element: TLinkElement;
  children: ReactNode;
  attributes?: AnchorHTMLAttributes<HTMLAnchorElement>;
};

export default function EmailLinkStatic({ element, children, attributes }: Props) {
  const filteredAttributes = Object.fromEntries(
    Object.entries(attributes ?? {})
      .filter((att) => !att[0].startsWith('data-slate-'))
  );
  return (
    <a
      {...filteredAttributes}
      href={attributes?.href ?? element.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        ...attributes?.style,
        color: theme.palette.primary.main,
        textDecoration: 'underline',
      }}
    >
      {children}
    </a>
  );
}
