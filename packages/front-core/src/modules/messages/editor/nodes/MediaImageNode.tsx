import * as React from 'react';
import type { TCaptionProps, TImageElement, TResizableProps } from 'platejs';
import { NodeApi } from 'platejs';
import type { PlateElementProps } from '@platejs/core/react';
import { PlateElement, useFocused, useSelected } from '@platejs/core/react';
import theme from '../../../../theme/default/theme';

/* adapted from the ImageElementStatic component from plate ui */
export function MediaImageNode(
  props: PlateElementProps<TImageElement & TCaptionProps & TResizableProps>,
) {
  const { align = 'center', caption, url, width } = props.element;
  const isSelected = useSelected();
  const isFocused = useFocused();
  const showOutline = isSelected && isFocused;

  return (
    <PlateElement
      {...props}
      style={{
        paddingTop: 10,
        paddingBottom: 10,
      }}
    >
      <div contentEditable={false}>
        <figure
          style={{
            position: 'relative',
            margin: 0,
            display: 'inline-block',
            width,
            maxWidth: '100%',
          }}
        >
          <div
            style={{
              position: 'relative',
              minWidth: 92,
              maxWidth: '100%',
              textAlign: align,
            }}
          >
            <img
              style={{
                width: '100%',
                maxWidth: 500,
                height: 'auto',
                maxHeight: 300,
                cursor: 'default',
                objectFit: 'contain',
                padding: 0,
                borderRadius: '4px',
                transition: 'box-shadow 120ms ease',
                boxShadow: showOutline
                  ? `0 0 0 2px ${theme.palette.primary.main}`
                  : undefined,
              }}
              alt=""
              src={url}
            />
            {caption && (
              <figcaption
                style={{
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  marginTop: 8,
                  height: 24,
                  maxWidth: '100%',
                  textAlign: 'center',
                }}
              >
                {NodeApi.string(caption[0])}
              </figcaption>
            )}
          </div>
        </figure>
      </div>
      {props.children}
    </PlateElement>
  );
}