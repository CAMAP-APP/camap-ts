import type { Value } from 'platejs';

export const MESSAGE_SLATE_CONTENT_VERSION = 2 as const;

export type MessageSlateContentV2 = {
  v: typeof MESSAGE_SLATE_CONTENT_VERSION;
  value: Value;
};

export type MessageAlignment = 'left' | 'center' | 'right';

export type MessageImageElement = {
  type: 'img';
  /** `cid:...` for embedded images, otherwise a normal URL. */
  url: string;
  /** Display URL for in-app rendering when `url` is `cid:...`. */
  dataUrl?: string;
  filename?: string;
  cid?: string;
  align?: MessageAlignment;
  width?: number;
  height?: number;
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

