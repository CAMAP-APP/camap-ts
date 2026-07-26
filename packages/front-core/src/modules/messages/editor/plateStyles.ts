import type { CSSProperties } from 'react';
import type { MessageAlignment } from './messageEditorSchema';

export const MESSAGE_PARAGRAPH_MARGIN_BOTTOM = '11px';

export const MESSAGE_IMAGE_PADDING_Y = 10;
export const MESSAGE_IMAGE_MAX_WIDTH = 500;
export const MESSAGE_IMAGE_MAX_HEIGHT = 300;

export const messageImageImgStyle: CSSProperties = {
    maxWidth: MESSAGE_IMAGE_MAX_WIDTH,
    height: 'auto',
    maxHeight: MESSAGE_IMAGE_MAX_HEIGHT,
    objectFit: 'contain',
    padding: 0,
    borderRadius: '4px',
};

export const getMessageImageAlignStyles = (align: MessageAlignment = 'left') => ({
    justifyContent:
        align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center',
});

export const plateStyles = [
    {
        '.slate-p': {
            mb: MESSAGE_PARAGRAPH_MARGIN_BOTTOM,
        },
    },
    {
        '.slate-img': {
            py: `${MESSAGE_IMAGE_PADDING_Y}px`,
            display: 'flex',
            width: '100%',
        },
    },
    {
        '.slate-img img': {
            width: 'auto',
            maxWidth: MESSAGE_IMAGE_MAX_WIDTH,
            height: 'auto',
            maxHeight: MESSAGE_IMAGE_MAX_HEIGHT,
            objectFit: 'contain',
            p: 0,
            borderRadius: '4px',
        },
    },
] as const;
