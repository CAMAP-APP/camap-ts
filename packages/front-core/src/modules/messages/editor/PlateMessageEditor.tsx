
import { Box } from '@mui/material';
import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { FormikHandlers } from 'formik';
import type { Value } from 'platejs';
import type { DOMHandler } from '@platejs/core/react';
import { serializeHtml } from '@platejs/core/static';
import theme from '../../../theme/default/theme';
import { encodeFileToBase64String } from '../../../utils/encoding';
import { getBase64EncodedImage } from '../../../utils/image';
import { removeAccents, removeSpaces } from '../../../utils/fomat/string';
import {
  MESSAGE_EDITOR_EMPTY_VALUE,
  type MessageImageElement,
} from './messageEditorSchema';
import TextEditorToolbar from './toolbar/TextEditorToolbar';
import { Plate, PlateContent, usePlateEditor } from '@platejs/core/react';
import imageCompression from 'browser-image-compression';
import {
  MESSAGE_EDITOR_PLUGINS,
  type MessageEditor,
  type MessageEditorPlugin,
} from './platePlugins';

type Props = {
  name: string;
  onChange: FormikHandlers['handleChange'];
  onBlur: FormikHandlers['handleBlur'];
  /** Formik field value: HTML. */
  value: string;

  groupId?: number;

  /** Set editor to a new value (e.g. reuse message). */
  externalValue?: Value;
  onExternalValueApplied?: () => void;

  onBlurSaveSlateValue?: (value: Value) => void;
  onHtmlSerialized?: (html: string) => void;

  toolbarEnd?: React.ReactNode;
  belowEditor?: React.ReactNode;

  onAddImagesCustomHandle?: (files: File[]) => void;
};

const insertImageFromFile = async (
  editor: MessageEditor,
  file: File,
  onAddImagesCustomHandle?: (files: File[]) => void,
) => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 500,
    useWebWorker: true,
  };

  const compressedFile = await imageCompression(file, options);
  const base64 = await encodeFileToBase64String(compressedFile as File);
  if (!base64) return;

  const dataUrl = getBase64EncodedImage(base64, file.type);
  const cid = removeSpaces(removeAccents(file.name));
  const imageNode: MessageImageElement = {
    type: 'img',
    url: `cid:${cid}`,
    dataUrl,
    filename: file.name,
    cid,
    children: [{ text: '' }],
  };
  editor.tf.insertNodes(imageNode);
  onAddImagesCustomHandle?.([file]);
};

export const PlateMessageEditor = ({
  name,
  onBlur,
  onChange,
  value: _formikHtml,
  groupId,
  externalValue,
  onExternalValueApplied,
  onBlurSaveSlateValue,
  onHtmlSerialized,
  toolbarEnd,
  belowEditor,
  onAddImagesCustomHandle,
}: Props) => {
  const { t } = useTranslation(['messages/default']);

  const editor = usePlateEditor<Value, MessageEditorPlugin>({
    plugins: [...MESSAGE_EDITOR_PLUGINS],
    value: MESSAGE_EDITOR_EMPTY_VALUE,
    handlers: {
      onFocus: ((_ctx) => {
        setIsFocused(true);
      }) as DOMHandler<MessageEditorPlugin, React.FocusEvent>,
      onBlur: (({ event, editor: plateEditor }) => {
        setIsFocused(false);
        onBlur(name)(event as any);

        onBlurSaveSlateValue?.(plateEditor.children);
        void serializeToFormikHtml();
      }) as DOMHandler<MessageEditorPlugin, React.FocusEvent>,
      onPaste: (({ event, editor: plateEditor }) => {
        const dt = event.clipboardData;
        if (!dt) return;

        if (dt.files && dt.files.length > 0) {
          const files = Array.from(dt.files).filter((f) =>
            f.type.startsWith('image/'),
          );
          if (files.length > 0) {
            event.preventDefault();
            void (async () => {
              for (const f of files) {
                await insertImageFromFile(plateEditor, f, onAddImagesCustomHandle);
              }
            })();
            return;
          }
        }

        const html = dt.getData('text/html');
        if (html) {
          try {
            const fragment = plateEditor.api.html.deserialize({ element: html });
            if (Array.isArray(fragment)) {
              event.preventDefault();
              plateEditor.tf.insertFragment(fragment as any);
              return;
            }
          } catch {
            // Ignore: fall back to the browser/Slate default paste behavior.
          }
        }
      }) as DOMHandler<MessageEditorPlugin, React.ClipboardEvent>,
      onDrop: (({ event, editor: plateEditor }) => {
        const files = Array.from(event.dataTransfer?.files ?? []).filter((f) =>
          f.type.startsWith('image/'),
        );
        if (files.length === 0) return;
        event.preventDefault();
        void (async () => {
          for (const f of files) {
            await insertImageFromFile(plateEditor, f, onAddImagesCustomHandle);
          }
        })();
      }) as DOMHandler<MessageEditorPlugin, React.DragEvent>,
    },
  });

  const [isFocused, setIsFocused] = useState(false);
  const pendingSerialize = useRef<number | null>(null);

  const serializeToFormikHtml = useCallback(async () => {
    const html = await serializeHtml(editor);
    onHtmlSerialized?.(html);
    onChange(name)(html);
  }, [editor, name, onChange, onHtmlSerialized]);

  const scheduleSerialize = useCallback(() => {
    if (pendingSerialize.current) window.clearTimeout(pendingSerialize.current);
    pendingSerialize.current = window.setTimeout(() => {
      void serializeToFormikHtml();
    }, 150);
  }, [serializeToFormikHtml]);

  React.useEffect(() => {
    if (!externalValue) return;
    editor.tf.setValue(externalValue);
    onExternalValueApplied?.();
  }, [editor, externalValue, onExternalValueApplied]);

  const onPlateChange = useCallback(() => {
    console.log('onPlateChange', editor.children);
    // Avoid serializing on every selection change? For now debounce and keep small docs.
    scheduleSerialize();
  }, [scheduleSerialize, editor]);

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
      ]}
      mt={2}
      mb={1}
    >
      <Plate editor={editor}
        onChange={onPlateChange}
      >
        <TextEditorToolbar
          editor={editor}
          onAddImagesCustomHandle={onAddImagesCustomHandle}
          groupId={groupId} toolbarEnd={toolbarEnd} />

        {belowEditor}

        <PlateContent
          style={{
            minHeight: 350,
            padding: `${theme.spacing(2)} ${theme.spacing(1)}`,
            boxSizing: 'border-box',
            outline: 'none'
          }}
          placeholder={t('form.placeholder')}
          spellCheck
        />
      </Plate>
    </Box>
  );
};

