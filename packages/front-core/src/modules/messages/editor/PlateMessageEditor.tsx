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
import React, { FocusEvent, useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { FormikHandlers } from 'formik';
import type { Value } from 'platejs';
import { Plate, PlateContent, usePlateEditor } from '@platejs/core/react';
import { Editor, Element as SlateElement, Range, Transforms } from 'slate';
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
import { TextEditorComponents } from '../../../components/textEditor/TextEditorComponents';
import { encodeFileToBase64String } from '../../../utils/encoding';
import { getBase64EncodedImage } from '../../../utils/image';
import { containsEmail, CONTAINS_EMAIL_REGEX } from 'camap-common';
import { isFinishedUrl, isUrl, URL_PATTERN } from '../../../utils/url';
import { removeAccents, removeSpaces } from '../../../utils/fomat/string';
import FormatTypes, {
  AlignFormatType,
} from '../../../components/textEditor/TextEditorFormatType';
import {
  MESSAGE_EDITOR_EMPTY_VALUE,
  type MessageImageElement,
} from './messageEditorSchema';
import MessageColorButton from './MessageColorButton';
import MessageImageButton from './MessageImageButton';
import MessageLinkButton from './MessageLinkButton';

const EDITOR_PADDING = 8;

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

const isMarkActive = (editor: Editor, mark: 'bold' | 'italic' | 'underline') => {
  const marks = Editor.marks(editor);
  return !!marks?.[mark];
};

const toggleMark = (
  editor: Editor,
  mark: 'bold' | 'italic' | 'underline',
) => {
  const active = isMarkActive(editor, mark);
  if (active) Editor.removeMark(editor, mark);
  else Editor.addMark(editor, mark, true);
};

const getActiveBlock = (editor: Editor) => {
  const entry = Editor.above(editor, {
    match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor, n),
  });
  return entry?.[0] as any | undefined;
};

const getActiveAlign = (editor: Editor): AlignFormatType | undefined => {
  const block = getActiveBlock(editor);
  const align = block?.align;
  if (
    align === FormatTypes.alignLeft ||
    align === FormatTypes.alignCenter ||
    align === FormatTypes.alignRight
  )
    return align;
  return undefined;
};

const setAlign = (editor: Editor, align: AlignFormatType) => {
  Transforms.setNodes(
    editor,
    { align },
    {
      match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor, n),
    },
  );
};

const toggleHeading = (editor: Editor, type: 'h1' | 'h2') => {
  const block = getActiveBlock(editor);
  const isActive = block?.type === type;
  const nextType = isActive ? 'p' : type;
  Transforms.setNodes(
    editor,
    { type: nextType },
    {
      match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor, n),
    },
  );
};

const isLinkElement = (n: any): boolean => !!n && typeof n === 'object' && n.type === 'a';

const unwrapLink = (editor: Editor) => {
  Transforms.unwrapNodes(editor, { match: isLinkElement, split: true });
};

const wrapLinkAtRange = (editor: Editor, url: string, range: any) => {
  if (!range) return;
  unwrapLink(editor);
  Transforms.select(editor, range);
  const link = { type: 'a', url, children: [] as any[] };
  Transforms.wrapNodes(editor, link, { split: true });
  Transforms.collapse(editor, { edge: 'end' });
};

const tryAutoLinkAtSelection = (editor: Editor) => {
  const { selection } = editor;
  if (!selection || !Range.isCollapsed(selection)) return;

  const { anchor } = selection;
  const wordStart = Editor.before(editor, anchor, { unit: 'word' });
  if (!wordStart) return;
  const wordRange = { anchor: wordStart, focus: anchor };
  const word = Editor.string(editor, wordRange).trim();
  if (!word) return;

  if (isUrl(word)) {
    const url = word.match(URL_PATTERN)?.[0] ?? word;
    const href =
      url.startsWith('http://') || url.startsWith('https://') ? url : `http://${url}`;
    wrapLinkAtRange(editor, href, wordRange);
    return;
  }

  if (word && !word.includes('"') && containsEmail(word)) {
    const email = word.match(CONTAINS_EMAIL_REGEX)?.[0];
    if (email) wrapLinkAtRange(editor, `mailto:${email}`, wordRange);
  }
};

const insertImageFromFile = async (
  editor: Editor,
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
  Transforms.insertNodes(editor, imageNode);
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
  const align: AlignFormatType | undefined = element.align;

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

  const textAlign: React.CSSProperties['textAlign'] =
    align === FormatTypes.alignCenter
      ? 'center'
      : align === FormatTypes.alignRight
        ? 'right'
        : align === FormatTypes.alignLeft
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
      AutoformatPlugin,
    ],
    [],
  );

  const editor = usePlateEditor({
    plugins,
    value: MESSAGE_EDITOR_EMPTY_VALUE,
  });
  const slateEditor = editor as unknown as Editor;

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

  const onEditorBlur = useCallback(
    async (event: FocusEvent<HTMLDivElement>) => {
      onBlur(name)(event);
      setIsFocused(false);
      onBlurSaveSlateValue?.(editor.children as Value);
      await serializeToFormikHtml();
    },
    [editor, name, onBlur, onBlurSaveSlateValue, serializeToFormikHtml],
  );

  const onEditorFocus = useCallback(() => setIsFocused(true), []);

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
    <TextEditorComponents active={active} onMouseDown={onMouseDown}>
      {children}
    </TextEditorComponents>
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
              active={isMarkActive(slateEditor, 'bold')}
              onMouseDown={(e) => {
                e.preventDefault();
                toggleMark(slateEditor, 'bold');
              }}
            >
              <FormatBold sx={{ display: 'block' }} />
            </ToolbarButton>
            <ToolbarButton
              active={isMarkActive(slateEditor, 'italic')}
              onMouseDown={(e) => {
                e.preventDefault();
                toggleMark(slateEditor, 'italic');
              }}
            >
              <FormatItalic sx={{ display: 'block' }} />
            </ToolbarButton>
            <ToolbarButton
              active={isMarkActive(slateEditor, 'underline')}
              onMouseDown={(e) => {
                e.preventDefault();
                toggleMark(slateEditor, 'underline');
              }}
            >
              <FormatUnderlined sx={{ display: 'block' }} />
            </ToolbarButton>

            <MessageColorButton />

            <ToolbarButton
              active={getActiveBlock(slateEditor as any)?.type === 'h1'}
              onMouseDown={(e) => {
                e.preventDefault();
                toggleHeading(slateEditor, 'h1');
              }}
            >
              <LooksOne sx={{ display: 'block' }} />
            </ToolbarButton>
            <ToolbarButton
              active={getActiveBlock(slateEditor as any)?.type === 'h2'}
              onMouseDown={(e) => {
                e.preventDefault();
                toggleHeading(slateEditor, 'h2');
              }}
            >
              <LooksTwo sx={{ display: 'block' }} />
            </ToolbarButton>

            <ToolbarButton
              active={getActiveAlign(slateEditor) === FormatTypes.alignLeft}
              onMouseDown={(e) => {
                e.preventDefault();
                setAlign(slateEditor, FormatTypes.alignLeft);
              }}
            >
              <FormatAlignLeft sx={{ display: 'block' }} />
            </ToolbarButton>
            <ToolbarButton
              active={getActiveAlign(slateEditor) === FormatTypes.alignCenter}
              onMouseDown={(e) => {
                e.preventDefault();
                setAlign(slateEditor, FormatTypes.alignCenter);
              }}
            >
              <FormatAlignCenter sx={{ display: 'block' }} />
            </ToolbarButton>
            <ToolbarButton
              active={getActiveAlign(slateEditor) === FormatTypes.alignRight}
              onMouseDown={(e) => {
                e.preventDefault();
                setAlign(slateEditor, FormatTypes.alignRight);
              }}
            >
              <FormatAlignRight sx={{ display: 'block' }} />
            </ToolbarButton>

            <ToolbarButton
              active={getActiveBlock(slateEditor as any)?.listStyleType === 'decimal'}
              onMouseDown={(e) => {
                e.preventDefault();
                toggleList(editor as any, { listStyleType: 'decimal' } as any);
              }}
            >
              <FormatListNumbered sx={{ display: 'block' }} />
            </ToolbarButton>
            <ToolbarButton
              active={getActiveBlock(slateEditor as any)?.listStyleType === 'disc'}
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
          style={{ minHeight: 350, padding: EDITOR_PADDING, boxSizing: 'border-box' }}
          placeholder={t('form.placeholder')}
          spellCheck
          onFocus={onEditorFocus}
          onBlur={onEditorBlur}
          onKeyDown={(event) => {
            // Auto-link URLs/emails after the delimiter is inserted.
            if (event.key === ' ' || event.key === 'Enter') {
              window.setTimeout(() => {
                tryAutoLinkAtSelection(slateEditor);
              }, 0);
            }
          }}
          onPaste={(event) => {
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
                    await insertImageFromFile(slateEditor, f, onAddImagesCustomHandle);
                  }
                })();
                return;
              }
            }

            const html = dt.getData('text/html');
            const deserializeHtml = (editor as any)?.api?.html?.deserialize as
              | ((htmlString: string) => unknown)
              | undefined;
            if (html && deserializeHtml) {
              event.preventDefault();
              try {
                const fragment = deserializeHtml(html);
                if (Array.isArray(fragment)) {
                  Transforms.insertFragment(slateEditor, fragment as any);
                  return;
                }
              } catch {
                // If HTML parsing fails, let Slate paste plain text.
              }
            }

            const text = dt.getData('text/plain')?.trim();
            if (text && (isFinishedUrl(`${text} `) || containsEmail(text))) {
              // Allow default paste, then auto-link the previous word.
              window.setTimeout(() => {
                tryAutoLinkAtSelection(slateEditor);
              }, 0);
            }
          }}
          onDrop={(event) => {
            const files = Array.from(event.dataTransfer?.files ?? []).filter(
              (f) => f.type.startsWith('image/'),
            );
            if (files.length === 0) return;
            event.preventDefault();
            void (async () => {
              for (const f of files) {
                await insertImageFromFile(slateEditor, f, onAddImagesCustomHandle);
              }
            })();
          }}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
        />
      </Plate>
    </Box>
  );
};

