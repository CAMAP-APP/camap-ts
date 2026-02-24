import {
  FormatAlignCenter,
  FormatAlignLeft,
  FormatAlignRight,
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  FormatUnderlined,
  LooksOne,
  LooksTwo,
} from '@mui/icons-material';
import { Box } from '@mui/material';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { FormikHandlers } from 'formik';
import type { Value } from 'platejs';
import type { DOMHandler, PlateEditor } from '@platejs/core/react';
import { Plate, PlateContent, usePlateEditor } from '@platejs/core/react';
import imageCompression from 'browser-image-compression';
import { toggleList } from '@platejs/list';
import { LinkPlugin } from '@platejs/link/react';
import { ListPlugin } from '@platejs/list/react';
import { ImagePlugin } from '@platejs/media/react';
import { AutoformatPlugin } from '@platejs/autoformat';
import {
  BasicBlocksPlugin,
  BasicMarksPlugin,
} from '@platejs/basic-nodes/react';
import { serializeHtml } from '@platejs/core/static';
import theme from '../../../theme/default/theme';
import { encodeFileToBase64String } from '../../../utils/encoding';
import { getBase64EncodedImage } from '../../../utils/image';
import { removeAccents, removeSpaces } from '../../../utils/fomat/string';
import {
  MESSAGE_EDITOR_EMPTY_VALUE,
  type MessageImageElement,
} from './messageEditorSchema';
import MessageColorButton from './toolbar/MessageColorButton';
import MessageImageButton from './toolbar/MessageImageButton';
import MessageLinkButton from './toolbar/MessageLinkButton';
import { TextEditorToolbarButton } from './toolbar/TextEditorToolbarButton';
import { autoformatRules } from './autoformat';

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

type Align = 'left' | 'center' | 'right';
type Mark = 'bold' | 'italic' | 'underline';

const isMarkActive = (
  editor: PlateEditor,
  mark: Mark,
) => {
  const marks = editor.api.marks();
  return !!marks?.[mark];
};

const toggleMark = (editor: PlateEditor, mark: Mark) => {
  editor.tf.toggleMark(mark);
};

const getActiveBlock = (editor: PlateEditor) => {
  const entry = editor.api.above({
    match: (n) => editor.api.isBlock(n as any),
  });
  return entry?.[0] as any | undefined;
};

const getActiveAlign = (editor: PlateEditor) => {
  const block = getActiveBlock(editor);
  const align = block?.align;
  if (
    align === 'left' ||
    align === 'center' ||
    align === 'right'
  )
    return align;
  return undefined;
};

const setAlign = (editor: PlateEditor, align: Align) => {
  editor.tf.setNodes(
    { align },
    { match: (n) => editor.api.isBlock(n as any) },
  );
};

const toggleHeading = (editor: PlateEditor, type: 'h1' | 'h2') => {
  const block = getActiveBlock(editor);
  const isActive = block?.type === type;
  const nextType = isActive ? 'p' : type;
  editor.tf.setNodes(
    { type: nextType },
    { match: (n) => editor.api.isBlock(n as any) },
  );
};

const insertImageFromFile = async (
  editor: PlateEditor,
  file: File,
  onAddImagesCustomHandle?: (files: File[]) => void,
) => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 600,
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
  const align = element.align;

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

    if (imageEl.align === 'center') {
      wrapperStyle = { ...wrapperStyle, display: 'block', margin: '0 auto' };
    } else if (imageEl.align === 'right') {
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

  const textAlign: React.CSSProperties['textAlign'] =
    align === 'center'
      ? 'center'
      : align === 'right'
        ? 'right'
        : align === 'left'
          ? 'left'
          : undefined;

  const style: React.CSSProperties = {
    ...(attributes.style ?? {}),
    ...(textAlign ? { textAlign } : {}),
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

  const plugins = useMemo(
    () => [
      BasicBlocksPlugin,
      BasicMarksPlugin,
      LinkPlugin,
      ListPlugin,
      ImagePlugin,
      AutoformatPlugin.configure({
        options: {
          rules: [...autoformatRules],
        },
      }),
    ],
    [],
  );

  const editor = usePlateEditor({
    plugins,
    value: MESSAGE_EDITOR_EMPTY_VALUE,
    handlers: {
      onFocus: ((_ctx) => {
        setIsFocused(true);
      }) as DOMHandler<any, React.FocusEvent>,
      onBlur: (({ event, editor: plateEditor }) => {
        setIsFocused(false);
        onBlur(name)(event as any);

        onBlurSaveSlateValue?.(plateEditor.children);
        void serializeToFormikHtml();
      }) as DOMHandler<any, React.FocusEvent>,
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
        const deserializeHtml = (plateEditor as any)?.api?.html?.deserialize as
          | ((htmlString: string) => unknown)
          | undefined;
        if (html && deserializeHtml) {
          try {
            const fragment = deserializeHtml(html);
            if (Array.isArray(fragment)) {
              event.preventDefault();
              plateEditor.tf.insertFragment(fragment as any);
              return;
            }
          } catch {
            // Ignore: fall back to the browser/Slate default paste behavior.
          }
        }
      }) as DOMHandler<any, React.ClipboardEvent>,
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
      }) as DOMHandler<any, React.DragEvent>,
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
    // Avoid serializing on every selection change? For now debounce and keep small docs.
    scheduleSerialize();
  }, [scheduleSerialize]);

  const renderElement = useCallback((p: any) => <RenderElement {...p} />, []);
  const renderLeaf = useCallback((p: any) => <RenderLeaf {...p} />, []);

  const ToolbarButton = ({
    active,
    onMouseDown,
    children,
  }: {
    active: boolean;
    onMouseDown: (e: React.MouseEvent<HTMLElement>) => void;
    children: React.ReactNode;
  }) => (
    <TextEditorToolbarButton active={active} onMouseDown={onMouseDown}>
      {children}
    </TextEditorToolbarButton>
  );

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
      <Plate editor={editor} onChange={onPlateChange}>
        <Box
          position="relative"
          bgcolor={theme.palette.divider}
          borderRadius={`${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`}
        >
          <Box display="flex" flexWrap="wrap">
            <ToolbarButton
              active={isMarkActive(editor, 'bold')}
              onMouseDown={(e) => {
                e.preventDefault();
                toggleMark(editor, 'bold');
              }}
            >
              <FormatBold sx={{ display: 'block' }} />
            </ToolbarButton>
            <ToolbarButton
              active={isMarkActive(editor, 'italic')}
              onMouseDown={(e) => {
                e.preventDefault();
                toggleMark(editor, 'italic');
              }}
            >
              <FormatItalic sx={{ display: 'block' }} />
            </ToolbarButton>
            <ToolbarButton
              active={isMarkActive(editor, 'underline')}
              onMouseDown={(e) => {
                e.preventDefault();
                toggleMark(editor, 'underline');
              }}
            >
              <FormatUnderlined sx={{ display: 'block' }} />
            </ToolbarButton>

            <MessageColorButton />

            <ToolbarButton
              active={getActiveBlock(editor as any)?.type === 'h1'}
              onMouseDown={(e) => {
                e.preventDefault();
                toggleHeading(editor, 'h1');
              }}
            >
              <LooksOne sx={{ display: 'block' }} />
            </ToolbarButton>
            <ToolbarButton
              active={getActiveBlock(editor as any)?.type === 'h2'}
              onMouseDown={(e) => {
                e.preventDefault();
                toggleHeading(editor, 'h2');
              }}
            >
              <LooksTwo sx={{ display: 'block' }} />
            </ToolbarButton>

            <ToolbarButton
              active={getActiveAlign(editor) === 'left'}
              onMouseDown={(e) => {
                e.preventDefault();
                setAlign(editor, 'left');
              }}
            >
              <FormatAlignLeft sx={{ display: 'block' }} />
            </ToolbarButton>
            <ToolbarButton
              active={getActiveAlign(editor) === 'center'}
              onMouseDown={(e) => {
                e.preventDefault();
                setAlign(editor, 'center');
              }}
            >
              <FormatAlignCenter sx={{ display: 'block' }} />
            </ToolbarButton>
            <ToolbarButton
              active={getActiveAlign(editor) === 'right'}
              onMouseDown={(e) => {
                e.preventDefault();
                setAlign(editor, 'right');
              }}
            >
              <FormatAlignRight sx={{ display: 'block' }} />
            </ToolbarButton>

            <ToolbarButton
              active={getActiveBlock(editor as any)?.listStyleType === 'decimal'}
              onMouseDown={(e) => {
                e.preventDefault();
                toggleList(editor as any, { listStyleType: 'decimal' } as any);
              }}
            >
              <FormatListNumbered sx={{ display: 'block' }} />
            </ToolbarButton>
            <ToolbarButton
              active={getActiveBlock(editor as any)?.listStyleType === 'disc'}
              onMouseDown={(e) => {
                e.preventDefault();
                toggleList(editor as any, { listStyleType: 'disc' } as any);
              }}
            >
              <FormatListBulleted sx={{ display: 'block' }} />
            </ToolbarButton>

            <MessageLinkButton />
            <MessageImageButton
              onAddImagesCustomHandle={onAddImagesCustomHandle}
              groupId={groupId}
            />

            {toolbarEnd}
          </Box>
        </Box>

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
          renderElement={renderElement}
          renderLeaf={renderLeaf}
        />
      </Plate>
    </Box>
  );
};

