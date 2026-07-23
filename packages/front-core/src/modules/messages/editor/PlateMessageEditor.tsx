import { Box } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { DOMHandler, TPlateEditor } from '@platejs/core/react';
import theme from '../../../theme/default/theme';
import { MESSAGE_EDITOR_EMPTY_VALUE } from './messageEditorSchema';
import TextEditorToolbar from './toolbar/TextEditorToolbar';
import { Plate, PlateContent, usePlateEditor } from '@platejs/core/react';
import {
  MESSAGE_EDITOR_PLUGINS,
  type MessageEditorPlugin,
} from './platePlugins';
import { plateStyles } from './plateStyles';
import { KEYS, Value } from 'platejs';
import {
  collectMessageImages,
  type CollectedMessageImage,
} from './collectMessageImageFiles';

type Props = {
  onChange: (data: {
    value: Value;
    imagesToUpload: CollectedMessageImage[];
  }) => void;
  onBlur: (value: Value) => void;

  groupId?: number;

  /** Set editor to a new value (e.g. reuse message). */
  externalValue?: Value;

  toolbarEnd?: React.ReactNode;
  belowEditor?: React.ReactNode;
};

export const PlateMessageEditor = ({
  onBlur,
  onChange,
  groupId,
  externalValue,
  toolbarEnd,
  belowEditor,
}: Props) => {
  const { t } = useTranslation(['messages/default']);

  const onChangeWithImages = useCallback(
    ({
      value,
      editor,
    }: {
      value: Value;
      editor: TPlateEditor<Value, MessageEditorPlugin>;
    }) => {
      const imgType = editor.getType(KEYS.img);
      const imagesToUpload = collectMessageImages(value, imgType);
      onChange({
        value,
        imagesToUpload,
      });
    },
    [onChange],
  );

  const editor = usePlateEditor<Value, MessageEditorPlugin>(
    {
      plugins: [...MESSAGE_EDITOR_PLUGINS],
      value: externalValue || MESSAGE_EDITOR_EMPTY_VALUE,
      handlers: {
        onChange: onChangeWithImages,
        onFocus: (({ event, editor: plateEditor }) => {
          setIsFocused(true);

          // Keyboard focus (Tab): place caret at end of content.
          if ((event.nativeEvent as UIEvent).detail === 0) {
            requestAnimationFrame(() => {
              const end = plateEditor.api.end([]);
              if (end) plateEditor.tf.select(end);
            });
          }
        }) as DOMHandler<MessageEditorPlugin, React.FocusEvent>,
        onBlur: (({ editor: plateEditor }) => {
          setIsFocused(false);
          onChangeWithImages({ value: plateEditor.children, editor: plateEditor });
          onBlur?.(plateEditor.children);
        }) as DOMHandler<MessageEditorPlugin, React.FocusEvent>,
      },
    },
    [externalValue],
  );

  const [isFocused, setIsFocused] = useState(false);

  return (
    <Box
      sx={[
        () => ({
          position: 'relative',
          borderRadius: 1,
          border: `1px solid rgba(0, 0, 0, 0.23)`,
          boxSizing: 'border-box',
          '&:hover': {
            borderColor: theme.palette.text.primary,
          },
          '@media (hover: none)': {
            '&:hover': {
              borderColor: 'rgba(0, 0, 0, 0.23)',
            },
          },
        }),
        isFocused &&
          (() => ({
            boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
            '&:hover': {
              borderColor: theme.palette.primary.main,
            },
          })),
        ...plateStyles,
      ]}
      mt={2}
      mb={1}
    >
      <Plate editor={editor}>
        <TextEditorToolbar
          editor={editor}
          groupId={groupId}
          toolbarEnd={toolbarEnd}
        />

        {belowEditor}

        <PlateContent
          style={{
            minHeight: 350,
            maxHeight: '80vh',
            overflowY: 'auto',
            padding: `${theme.spacing(2)} ${theme.spacing(1)}`,
            boxSizing: 'border-box',
            outline: 'none',
          }}
          placeholder={t('form.placeholder')}
          spellCheck
        />
      </Plate>
    </Box>
  );
};
