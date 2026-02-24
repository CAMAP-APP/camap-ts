import React, { useCallback, useMemo } from 'react';
import type { Value } from 'platejs';
import { Plate, PlateContent, usePlateEditor } from '@platejs/core/react';
import {
  BasicBlocksPlugin,
  BasicMarksPlugin,
} from '@platejs/basic-nodes/react';
import { LinkPlugin } from '@platejs/link/react';
import { ListPlugin } from '@platejs/list/react';
import { ImagePlugin } from '@platejs/media/react';
import { AutoformatPlugin } from '@platejs/autoformat';
import type { MessageAlignment, MessageImageElement } from './messageEditorSchema';
import FormatTypes from '../../../components/textEditor/TextEditorFormatType';

const RenderLeaf = (props: any) => {
  const { attributes, children, leaf } = props;
  let out = children;
  if (leaf.bold) out = <strong>{out}</strong>;
  if (leaf.italic) out = <em>{out}</em>;
  if (leaf.underline) out = <u>{out}</u>;

  const color: unknown = leaf.color;
  if (typeof color === 'string' && color.startsWith('#')) {
    return (
      <span {...attributes} style={{ color }}>
        {out}
      </span>
    );
  }

  return <span {...attributes}>{out}</span>;
};

const RenderElement = (props: any) => {
  const { attributes, children, element } = props;
  const align: MessageAlignment | undefined = element.align;

  if (element.type === 'a') {
    return (
      <a
        {...attributes}
        href={element.url}
        target="_blank"
        rel="noreferrer noopener"
      >
        {children}
      </a>
    );
  }

  if (element.type === 'img') {
    const imageEl = element as MessageImageElement;
    const src =
      typeof imageEl.dataUrl === 'string' && imageEl.dataUrl
        ? imageEl.dataUrl
        : imageEl.url;

    let wrapperStyle: React.CSSProperties = {
      height: typeof imageEl.height === 'number' ? imageEl.height : undefined,
      overflow: 'auto',
    };

    if (imageEl.align === FormatTypes.alignCenter) {
      wrapperStyle = { ...wrapperStyle, display: 'block', margin: '0 auto' };
    } else if (imageEl.align === FormatTypes.alignRight) {
      wrapperStyle = { ...wrapperStyle, float: 'right', marginLeft: 16 };
    } else {
      wrapperStyle = { ...wrapperStyle, float: 'left', marginRight: 16 };
    }

    return (
      <div {...attributes} style={wrapperStyle}>
        <img
          src={src}
          alt={imageEl.filename ?? imageEl.url}
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        />
        {children}
      </div>
    );
  }

  const style: React.CSSProperties = {
    ...(attributes.style ?? {}),
    ...(align ? { textAlign: align } : {}),
  };

  switch (element.type) {
    case 'h1':
      return (
        <h1 {...attributes} style={style}>
          {children}
        </h1>
      );
    case 'h2':
      return (
        <h2 {...attributes} style={style}>
          {children}
        </h2>
      );
    case 'p':
    default:
      return (
        <p {...attributes} style={style}>
          {children}
        </p>
      );
  }
};

export const PlateMessageViewer = ({ value }: { value: Value }) => {
  const plugins = useMemo(
    () => [
      BasicBlocksPlugin,
      BasicMarksPlugin,
      LinkPlugin,
      ListPlugin,
      ImagePlugin,
      AutoformatPlugin,
    ],
    [],
  );

  const editor = usePlateEditor({
    plugins,
    value,
  });

  const renderElement = useCallback((p: any) => <RenderElement {...p} />, []);
  const renderLeaf = useCallback((p: any) => <RenderLeaf {...p} />, []);

  return (
    <Plate editor={editor}>
      <PlateContent
        readOnly
        renderElement={renderElement}
        renderLeaf={renderLeaf}
      />
    </Plate>
  );
};

