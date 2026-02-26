import * as React from 'react';
import type { TCaptionProps, TImageElement, TResizableProps } from 'platejs';
import { NodeApi } from 'platejs';
import type { PlateElementProps } from '@platejs/core/react';
import { PlateElement, useEditorRef, useFocused, useSelected } from '@platejs/core/react';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import theme from '../../../../theme/default/theme';

/* adapted from the ImageElementStatic component from plate ui */
export function MediaImageNode(
  props: PlateElementProps<TImageElement & TCaptionProps & TResizableProps>,
) {
  const { align = 'center', caption, url, width } = props.element;
  const editor = useEditorRef();
  const { t } = useTranslation(['messages/default']);
  const isSelected = useSelected();
  const isFocused = useFocused();
  const showOutline = isSelected && isFocused;
  const [isHovered, setIsHovered] = React.useState(false);

  const justifyContent =
    align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';

  const removeImage = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      // Keep the editor selection on the image node.
      event.preventDefault();
      event.stopPropagation();

      const imagePath = editor.api.findPath(props.element);
      if (!imagePath) return;

      editor.tf.removeNodes({ at: imagePath });
    },
    [editor, props.element],
  );

  return (
    <PlateElement
      {...props}
      style={{
        paddingTop: 10,
        paddingBottom: 10,
      }}
    >
      <div
        contentEditable={false}
        style={{
          display: 'flex',
          justifyContent,
          width: '100%',
        }}
      >
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
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <button
              type="button"
              onMouseDown={removeImage}
              contentEditable={false}
              aria-label={t('form.removeImage')}
              style={{
                position: 'absolute',
                top: 6,
                right: 6,
                zIndex: 2,
                width: 24,
                height: 24,
                borderRadius: '50%',
                border: `1px solid ${theme.palette.primary.main}`,
                background: theme.palette.background.paper,
                color: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                opacity: isHovered ? 1 : 0,
                pointerEvents: isHovered ? 'auto' : 'none',
                transition: 'opacity 120ms ease',
              }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </button>
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