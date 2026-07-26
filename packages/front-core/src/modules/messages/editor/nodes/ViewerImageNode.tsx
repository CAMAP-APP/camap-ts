import type { TImageElement } from 'platejs';
import type { PlateElementProps } from '@platejs/core/react';
import { PlateElement } from '@platejs/core/react';
import type { MessageAlignment } from '../messageEditorSchema';
import {
  getMessageImageAlignStyles,
  MESSAGE_IMAGE_PADDING_Y,
  messageImageImgStyle,
} from '../plateStyles';

/** Read-only image renderer for PlateMessageViewer (no remove control). */
export function ViewerImageNode(
  props: PlateElementProps<TImageElement>,
) {
  const url = props.element.url;
  const align = (props.element as { align?: MessageAlignment }).align;
  const alignStyles = getMessageImageAlignStyles(align);
  const filename =
    typeof (props.element as { filename?: string }).filename === 'string'
      ? (props.element as { filename?: string }).filename
      : '';

  return (
    <PlateElement
      {...props}
      style={{
        ...props.style,
        paddingTop: MESSAGE_IMAGE_PADDING_Y,
        paddingBottom: MESSAGE_IMAGE_PADDING_Y,
        display: 'flex',
        justifyContent: alignStyles.justifyContent,
        width: '100%',
      }}
    >
      {typeof url === 'string' && url.length > 0 ? (
        <img
          src={url}
          alt={filename || ''}
          // width:auto overrides plateStyles `.slate-img img { width:100% }` so flex align works
          style={{ ...messageImageImgStyle, width: 'auto' }}
        />
      ) : null}
      {props.children}
    </PlateElement>
  );
}
