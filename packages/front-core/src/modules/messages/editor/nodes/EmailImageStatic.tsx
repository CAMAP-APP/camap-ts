import type { HTMLAttributes } from 'react';
import type { MessageImageElement } from '../messageEditorSchema';
import {
    getMessageImageAlignStyles,
    MESSAGE_IMAGE_PADDING_Y,
    messageImageImgStyle,
} from '../plateStyles';

type Props = {
    element: MessageImageElement;
    attributes?: HTMLAttributes<HTMLDivElement>;
};

export default function EmailImageStatic({ element, attributes }: Props) {
    const src = element.cid
      ? `cid:${element.cid}`
      : (typeof element.url === 'string'
        ? new URL(element.url).toString() // normalize url
        : ''
      );
    const alignStyles = getMessageImageAlignStyles(element.align);

    const filteredAttributes = Object.fromEntries(
        Object.entries(attributes ?? {})
            .filter((att) => !att[0].startsWith('data-slate-')),
    );

    return (
        <div
            {...filteredAttributes}
            className={attributes?.className?.replace('slate-img', '')}
            style={{
                ...attributes?.style,
                paddingTop: MESSAGE_IMAGE_PADDING_Y,
                paddingBottom: MESSAGE_IMAGE_PADDING_Y,
                display: 'flex',
                justifyContent: alignStyles.justifyContent,
                width: '100%',
            }}
        >
            <img
                src={src}
                alt={element.filename ?? ''}
                style={messageImageImgStyle}
            />
        </div>
    );
}
