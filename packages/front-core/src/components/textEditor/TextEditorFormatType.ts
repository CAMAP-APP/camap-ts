import { BaseEditor, BaseElement } from 'slate';
import { HistoryEditor } from 'slate-history';
import { ReactEditor } from 'slate-react';

enum FormatTypes {
  bold = 'bold',
  italic = 'italic',
  underline = 'underline',
  headingOne = 'heading-one',
  headingTwo = 'heading-two',
  blockQuote = 'block-quote',
  numberedList = 'numbered-list',
  bulletedList = 'bulleted-list',
  listItem = 'list-item',
  paragraph = 'paragraph',
  alignCenter = 'align-center',
  alignLeft = 'align-left',
  alignRight = 'align-right',
  hyperlink = 'hyperlink',
  image = 'image',
  text = 'text',
}

export type AlignFormatType = FormatTypes.alignRight | FormatTypes.alignCenter | FormatTypes.alignLeft;

export const isFormatList = (format: string) =>
  format === FormatTypes.numberedList || format === FormatTypes.bulletedList;
export const isFormatListItem = (format: string) => format === FormatTypes.listItem;
export const isFormatAlignment = (format: string) =>
  format === FormatTypes.alignCenter || format === FormatTypes.alignLeft || format === FormatTypes.alignRight;
export const isFormatHeading = (format: string) =>
  format === FormatTypes.headingOne || format === FormatTypes.headingTwo;

export type CustomSlateElementWithText = BaseElement & {
  text?: string;
};

export type CustomSlateImageElement = CustomSlateElementWithText & {
  type: FormatTypes.image;
  align: AlignFormatType;
  imageName: string;
  imageSource: string;
  width: number;
  height: number;
};

export type CustomSlateHyperlinkElement = CustomSlateElementWithText & {
  type: FormatTypes.hyperlink;
  url: string;
};

export type CustomSlateElement = CustomSlateElementWithText & {
  types?: FormatTypes[];
  type?: FormatTypes;
};

export type CustomSlateText = {
  text: string;
  bold?: boolean;
  underline?: boolean;
  italic?: boolean;
  type?: FormatTypes;
};

export type CustomSlateDescendant = {
  text?: string;
};

export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor;
export type CustomElement = CustomSlateElement | CustomSlateHyperlinkElement | CustomSlateImageElement;

declare module 'slate' {
  export interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomSlateElement | CustomSlateHyperlinkElement | CustomSlateImageElement;
    Text: CustomSlateText;
    Descandant: CustomSlateDescendant;
  }
}

export default FormatTypes;
