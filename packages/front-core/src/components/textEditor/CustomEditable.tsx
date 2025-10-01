import { styled } from '@mui/material/styles';
import React, { useCallback } from 'react';
import { Editable, RenderElementProps, RenderLeafProps } from 'slate-react';
import { EditableProps } from 'slate-react/dist/components/editable';
import TextEditorImageElement from './Image/TextEditorImageElement';
import FormatTypes, {
  CustomSlateHyperlinkElement,
} from './TextEditorFormatType';

const DivAlignCenter = styled('div')(() => ({
  textAlign: 'center',
}));

const DivAlignRight = styled('div')(() => ({
  textAlign: 'right',
}));

const HeadingOne = styled('h1')(() => ({
  fontSize: '2em',
}));

const HeadingTwo = styled('h2')(() => ({
  fontSize: '1.5em',
}));

const Element = ({ attributes, children, element }: RenderElementProps) => {
  let block = children;
  let elementTypes: FormatTypes[] | undefined;
  if (element.type) {
    if (element.type === FormatTypes.hyperlink) {
      const linkElement = element as CustomSlateHyperlinkElement;
      return (
        <a
          {...attributes}
          href={linkElement.url as string}
          target="_blank"
          rel="noreferrer noopener"
        >
          {children}
        </a>
      );
    }
    if (element.type === FormatTypes.image) {
      return (
        <TextEditorImageElement attributes={attributes} element={element}>
          {children}
        </TextEditorImageElement>
      );
    }
    elementTypes = [element.type];
  }

  if (elementTypes === undefined) elementTypes = element.types || [];

  elementTypes.forEach((type) => {
    switch (type) {
      case FormatTypes.bulletedList:
        block = <ul {...attributes}>{block}</ul>;
        break;
      case FormatTypes.headingOne:
        block = <HeadingOne {...attributes}>{block}</HeadingOne>;
        break;
      case FormatTypes.headingTwo:
        block = <HeadingTwo {...attributes}>{block}</HeadingTwo>;
        break;
      case FormatTypes.listItem:
        block = <li {...attributes}>{block}</li>;
        break;
      case FormatTypes.numberedList:
        block = <ol {...attributes}>{block}</ol>;
        break;
      case FormatTypes.alignCenter:
        block = <DivAlignCenter {...attributes}>{block}</DivAlignCenter>;
        break;
      case FormatTypes.alignRight:
        block = <DivAlignRight {...attributes}>{block}</DivAlignRight>;
        break;
      case FormatTypes.alignLeft:
        break;
      default:
        block = <p {...attributes}>{block}</p>;
    }
  });
  return block;
};

const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  const isHyperlinkChild =
    children.props.parent &&
    children.props.parent.type === FormatTypes.hyperlink;

  let updatedChildren = children;
  if (leaf.bold) {
    updatedChildren = <strong>{updatedChildren}</strong>;
  }

  if (leaf.italic) {
    updatedChildren = <em>{updatedChildren}</em>;
  }

  if (leaf.underline) {
    updatedChildren = <u>{updatedChildren}</u>;
  }

  if (isHyperlinkChild) {
    return <span {...attributes}>{updatedChildren}</span>;
  }

  let colorStyle = '#000';
  Object.entries(leaf).forEach(([mark]) => {
    if (mark.startsWith('#')) colorStyle = mark;
  });

  return (
    <span {...attributes} style={{ color: colorStyle }}>
      {updatedChildren}
    </span>
  );
};

export const SLATE_INITIAL_VALUE = [
  {
    types: [FormatTypes.paragraph],
    children: [{ text: '' }],
  },
];

const CustomEditable = (props: EditableProps) => {
  const renderElement = useCallback((props: RenderElementProps) => <Element {...props} />, []);
  const renderLeaf = useCallback((props: RenderLeafProps) => <Leaf {...props} />, []);

  return (
    <Editable
      renderElement={renderElement}
      renderLeaf={renderLeaf}
      {...props}
    />
  );
};

export default CustomEditable;
