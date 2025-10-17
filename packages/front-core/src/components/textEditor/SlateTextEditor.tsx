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
import { Box, styled } from '@mui/material';
import { FormikHandlers } from 'formik';
import React, { FocusEvent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BaseElement,
  createEditor,
  Editor,
  Node,
  Text,
  Transforms,
} from 'slate';
import { withHistory } from 'slate-history';
import { ReactEditor, Slate, useSlate, withReact } from 'slate-react';
import theme from '../../theme';
import { removeAccents, removeSpaces } from '../../utils/fomat/string';
import CustomEditable from './CustomEditable';
import TextEditorImageButton from './Image/TextEditorImageButton';
import { withImages } from './Image/withImage';
import TextEditorColorButton from './TextEditorColorButton';
import { TextEditorComponents } from './TextEditorComponents';
import FormatTypes, {
  AlignFormatType,
  CustomEditor,
  CustomSlateElement,
  CustomSlateHyperlinkElement,
  CustomSlateImageElement,
  CustomSlateText,
  isFormatAlignment,
  isFormatHeading,
  isFormatList,
  isFormatListItem,
} from './TextEditorFormatType';
import TextEditorLinkButton from './TextEditorLinkButton';
import withHtml from './withHtml';
import withLinks from './withLinks';

// This is defined by Slate
export const EMPTY_SLATE_VALUE: Node[] = [
  { types: [FormatTypes.paragraph], children: [{ text: '' }] },
];

export const EMPTY_EDITOR_HTML_REGEX = /<div style=".*"><p><br><\/p><\/div>/;

const EDITOR_PADDING = 8;

const StyledEditable = styled(CustomEditable)(() => ({
  minHeight: '350px !important', // Use !important because Slate put a min-height in the style attribute
  padding: EDITOR_PADDING,
  overflow: 'hidden',
}));

const getOtherListFormat = (format: string) => {
  if (format === FormatTypes.numberedList) {
    return FormatTypes.bulletedList;
  }

  return FormatTypes.numberedList;
};

const isBlockActive = (editor: Editor, format: string) => {
  if (format === FormatTypes.alignLeft) {
    const [alignNotLeftMatch] = Editor.nodes(editor, {
      match: (n: CustomSlateElement | CustomSlateText) => {
        if (!('types' in n) || !n.types) {
          if (n.type && n.type === FormatTypes.image) {
            const imageNode = n as CustomSlateImageElement;
            return !(!imageNode.align || imageNode.align === format);
          }
          return false;
        }
        const types = n.types as string[];
        return (
          types.includes(FormatTypes.alignCenter) ||
          types.includes(FormatTypes.alignRight)
        );
      },
    });
    return !alignNotLeftMatch;
  }
  const [match] = Editor.nodes(editor, {
    match: (n: CustomSlateElement | CustomSlateText) => {
      if (!('types' in n) || !n.types) {
        if (n.type && n.type === FormatTypes.image) {
          if (isFormatAlignment(format)) {
            const imageNode = n as CustomSlateImageElement;
            return imageNode.align === format;
          }
        }
        return false;
      }
      const types = n.types as string[];
      return types.includes(format);
    },
  });
  return !!match;
};

const isMarkActive = (editor: Editor, format: string) => {
  const marks = Editor.marks(editor);
  return (marks && format in marks) ? marks[format as keyof typeof marks] === true : false;
};

const toggleBlock = (editor: Editor, format: FormatTypes) => {
  const isActive = isBlockActive(editor, format);
  const isList = isFormatList(format);
  if (isList) {
    const isOtherListFormatActive = isBlockActive(
      editor,
      getOtherListFormat(format),
    );

    if (isActive || isOtherListFormatActive) {
      Transforms.unwrapNodes(editor, {
        match: (n: CustomSlateElement | CustomSlateText) => {
          let hasFormatList = false;
          if ('types' in n && n.types) {
            (n.types as string[]).forEach((t) => {
              if (isFormatList(t)) {
                hasFormatList = true;
              }
            });
          }
          return hasFormatList;
        },
        split: true,
      });
    }
  }

  const newFormatType = isList ? FormatTypes.listItem : format;

  const types: FormatTypes[] = [];

  let selectedNode =
    editor.selection &&
    (editor.children[editor.selection.anchor.path[0]] as CustomSlateElement &
      BaseElement);

  if (
    selectedNode &&
    selectedNode.type &&
    selectedNode.type === FormatTypes.image
  ) {
    if (isFormatAlignment(newFormatType)) {
      const partialImageNode: Partial<CustomSlateImageElement> = {
        align: newFormatType as AlignFormatType,
      };
      Transforms.setNodes(editor, partialImageNode);
    }
    return;
  }

  let selectedNodeTypes =
    selectedNode && selectedNode.types ? selectedNode.types : [];
  if (
    selectedNode &&
    (selectedNode.children as any[]).length > 0 &&
    (selectedNode.children as any[])[0].types
  ) {
    selectedNodeTypes = (selectedNode.children as any[])[0].types;
  }
  if (
    !(
      selectedNodeTypes.length && selectedNodeTypes[0] === FormatTypes.paragraph
    )
  ) {
    types.push(...selectedNodeTypes);
  }
  if (isActive) {
    const currentIndex = selectedNodeTypes.findIndex(
      (t) => t === newFormatType,
    );
    types.splice(currentIndex, 1);
  } else if (isFormatAlignment(newFormatType)) {
    const previousAlignmentIndex = selectedNodeTypes.findIndex((t) =>
      isFormatAlignment(t),
    );
    if (previousAlignmentIndex !== -1) {
      types.splice(previousAlignmentIndex, 1, newFormatType);
    } else {
      types.push(newFormatType);
    }
  } else if (isFormatHeading(newFormatType)) {
    const previousHeadingIndex = selectedNodeTypes.findIndex((t) =>
      isFormatHeading(t),
    );
    if (previousHeadingIndex !== -1) {
      types.splice(previousHeadingIndex, 1, newFormatType);
    } else {
      types.push(newFormatType);
    }
  } else if (isList) {
    const previousListIndex = selectedNodeTypes.findIndex((t) =>
      isFormatListItem(t),
    );
    if (previousListIndex === -1) {
      types.push(newFormatType);
    }
  } else {
    types.push(newFormatType);
  }

  const partialNode: Partial<CustomSlateElement> = {
    types,
  };
  Transforms.setNodes(editor, partialNode);

  if (!isActive && isList) {
    const block = { types: [format], children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const toggleMark = (editor: Editor, format: string) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

interface MarkAndBlockButtonProps {
  format: FormatTypes;
  icon: JSX.Element;
}

const BlockButton = ({ format, icon }: MarkAndBlockButtonProps) => {
  const editor = useSlate();
  const isActive = isBlockActive(editor, format);
  return (
    <TextEditorComponents
      active={isActive}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      {icon}
    </TextEditorComponents>
  );
};

const MarkButton = ({ format, icon }: MarkAndBlockButtonProps) => {
  const editor = useSlate();
  return (
    <TextEditorComponents
      active={isMarkActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      {icon}
    </TextEditorComponents>
  );
};

export const SLATE_INITIAL_VALUE = [
  {
    types: [FormatTypes.paragraph],
    children: [{ text: '' }],
  },
];

const hasImageNode = (nodes: CustomSlateElement[]): boolean => {
  return nodes.find((n) => n.type && n.type === FormatTypes.image) !== null;
};

const serialize = (
  node: Node,
  isHyperlinkNodeChild = false,
  parent?: Node,
  index?: number,
  editorWidth?: number,
  serializeImagesAsCID = false,
): string => {
  if (Text.isText(node)) {
    let updatedNode = node.text;
    if (node.bold) {
      updatedNode = `<strong>${updatedNode}</strong>`;
    }

    if (node.italic) {
      updatedNode = `<em>${updatedNode}</em>`;
    }

    if (node.underline) {
      updatedNode = `<u>${updatedNode}</u>`;
    }

    if (isHyperlinkNodeChild) return updatedNode;

    let colorStyle = '#000';
    Object.entries(node).forEach(([mark]) => {
      if (mark.startsWith('#')) colorStyle = mark;
    });

    // Empty text node
    if (node.text === '') {
      // When inserting a Hyperlink node, Slate might add empty text nodes siblings before and after the hyperlink node.
      // We don't want these empty text nodes to be serialized into a line jump '<br>'.
      // Thus, we have to check whether this node is a non-desired Hyperlink's sibling in order to ignore it.
      let isLineJump = true;
      if (parent !== undefined && index !== undefined && 'children' in parent) {
        const previousSibling =
          index < parent.children.length && parent.children[index - 1];
        const nextSibling =
          index < parent.children.length - 1 && parent.children[index + 1];
        if (previousSibling && previousSibling.type === FormatTypes.hyperlink) {
          isLineJump = false;
        }
        if (nextSibling && nextSibling.type === FormatTypes.hyperlink) {
          isLineJump = false;
        }
      }
      return isLineJump ? '<br>' : '';
    }

    return `<span style="color:${colorStyle}">${updatedNode}</span>`;
  }

  const children = node.children
    .map((n, i) =>
      serialize(
        n,
        'type' in node ? node.type === FormatTypes.hyperlink : false,
        node,
        i,
        editorWidth,
        serializeImagesAsCID,
      ),
    )
    .join('');

  if ('type' in node) {
    if (node.type === FormatTypes.hyperlink) {
      const linkNode = node as CustomSlateHyperlinkElement;
      return `<a href="${linkNode.url}" target="_blank" rel="noreferrer noopener notrack">${children}</a>`;
    }
    if (node.type === FormatTypes.image) {
      const imageNode = node as CustomSlateImageElement;
      let alignStyle = 'float: left; margin-right: 16px;';
      if (imageNode.align === FormatTypes.alignCenter)
        alignStyle = "display: 'block'; margin: '0px auto';";
      if (imageNode.align === FormatTypes.alignRight)
        alignStyle = 'float: right; margin-left: 16px;';
      let imgTag = '';
      const imageName = imageNode.imageName as string;
      const { imageSource } = imageNode;
      if (serializeImagesAsCID && imageName) {
        const cid = removeSpaces(removeAccents(imageName));
        imgTag = `<img src="cid:${cid}" alt="${imageName}" style="max-width: 100%; max-height: 100%;"/>`;
      } else {
        imgTag = `<img src="${imageSource}" alt="${imageSource}" style="max-width: 100%; max-height: 100%;"/>`;
      }
      return `<div style="height: ${imageNode.height}px; ${alignStyle}">${imgTag}</div>`;
    }
  }

  if (Editor.isEditor(node)) {
    // This node is the root node
    const width = editorWidth ? `${editorWidth}px` : 'auto';
    let style = `max-width:${width};margin: 0 auto;font-size:16px;font-family: Cabin, Arial, Helvetica, sans-serif;font-weight: 400;line-height: 1.43;`;
    if (hasImageNode(node.children as CustomSlateElement[]))
      style += 'overflow:auto;';
    return `<div style="${style}">${children}</div>`;
  }

  if (!node.types) {
    if (hasImageNode(node.children as CustomSlateElement[])) {
      return `<div style="overflow:auto;">${children}</div>`;
    }
    return children;
  }

  let block = children;
  (node.types as string[]).forEach((type) => {
    switch (type) {
      case FormatTypes.bulletedList:
        block = `<ul>${block}</ul>`;
        break;
      case FormatTypes.headingOne:
        block = `<h1>${block}</h1>`;
        break;
      case FormatTypes.headingTwo:
        block = `<h2>${block}</h2>`;
        break;
      case FormatTypes.listItem:
        block = `<li>${block}</li>`;
        break;
      case FormatTypes.numberedList:
        block = `<ol>${block}</ol>`;
        break;
      case FormatTypes.alignCenter:
        block = `<div style='text-align: center'>${block}</div>`;
        break;
      case FormatTypes.alignRight:
        block = `<div style='text-align: right'>${block}</div>`;
        break;
      case FormatTypes.alignLeft:
        break;
      default:
        block = `<p>${block}</p>`;
    }
  });
  return block;
};

export interface SlateTextEditorProps {
  name: string;
  onChange: FormikHandlers['handleChange'];
  onBlur: FormikHandlers['handleBlur'];
  value: string;

  onBlurEditorCustomHandler?: (slateValue: Node[]) => void;
  onAddImagesCustomHandler?: (image: File[]) => void;
  onSetValueCustomHandler?: (value: string) => void;
  customToolbarButtons?: React.ReactNode[];
  customAdditionalComponents?: React.ReactNode[];
  customValue?: Node[];
  // Used to load group's catalog images
  groupId?: number;
}

const SlateTextEditor = ({
  name,
  onBlur,
  onChange,
  value: formikValue,
  onBlurEditorCustomHandler,
  onAddImagesCustomHandler,
  onSetValueCustomHandler,
  customToolbarButtons,
  customAdditionalComponents: customeAdditionalComponents,
  groupId,
  customValue,
}: SlateTextEditorProps) => {
  const { t } = useTranslation(['messages/default']);

  const [value, setValue] = useState<Node[]>(SLATE_INITIAL_VALUE);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const editor = useMemo(
    () =>
      withHtml(
        withImages(
          withLinks(withHistory(withReact(createEditor()))),
          onAddImagesCustomHandler,
        ),
      ),
    [onAddImagesCustomHandler],
  ) as CustomEditor;

  const editableRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!customValue) return;

    editor.children = customValue;
    setFormikValue(editableRef.current || undefined);
  }, [customValue, editor]);

  useEffect(() => {
    if (formikValue === '') {
      // Form has been reset
      editor.selection = null;
      setValue(SLATE_INITIAL_VALUE);
    }
  }, [editor, formikValue]);

  const setFormikValue = (element?: HTMLDivElement) => {
    const editorWidth = element
      ? element.clientWidth - EDITOR_PADDING * 2
      : undefined;
    const serializedHtml = serialize(
      editor,
      false,
      undefined,
      undefined,
      editorWidth,
      // Workaround to get image as CID for the Messaging Service
      // (for now it is true that if we use onAddImagesCustomHandler we are in the messaging service)
      !!onAddImagesCustomHandler,
    );
    if (onSetValueCustomHandler) onSetValueCustomHandler(serializedHtml);
    onChange(name)(serializedHtml);
  };

  useEffect(() => {
    if (!!customValue) return;
    setFormikValue(editableRef.current || undefined);
  }, [customValue, value]);

  const onValueChange = (v: Node[]) => {
    const isEditorFocused = ReactEditor.isFocused(editor);
    if (isEditorFocused !== isFocused) {
      setIsFocused(isEditorFocused);
    }
    setValue(v);
  };

  const onBlurEditor = (event: FocusEvent<HTMLDivElement>) => {
    onBlur(name)(event);
    setFormikValue(event.currentTarget);
    setIsFocused(false);

    if (onBlurEditorCustomHandler) onBlurEditorCustomHandler(value);
  };

  const onFocusEditor = () => {
    setIsFocused(true);
  };

  return (
    <Box
      sx={[
        (theme) => ({
          position: 'relative',
          borderRadius: 1,
          border: `1px solid rgba(0, 0, 0, 0.23)`,
          boxSizing: 'border-box',
          '&:hover': {
            borderColor: theme.palette.text.primary,
          },
          // Reset on touch devices, it doesn't add specificity
          '@media (hover: none)': {
            '&:hover': {
              borderColor: 'rgba(0, 0, 0, 0.23)',
            },
          },
        }),
        isFocused &&
          ((theme) => ({
            boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
            '&:hover': {
              borderColor: theme.palette.primary.main,
            },
          })),
      ]}
      mt={2}
      mb={1}
    >
      <Slate editor={editor} value={value} onChange={onValueChange}>
        <Box
          position="relative"
          bgcolor={theme.palette.divider}
          borderRadius={`${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`}
        >
          <Box display="flex" flexWrap="wrap">
            <MarkButton
              format={FormatTypes.bold}
              icon={<FormatBold sx={{ display: 'block' }} />}
            />
            <MarkButton
              format={FormatTypes.italic}
              icon={<FormatItalic sx={{ display: 'block' }} />}
            />
            <MarkButton
              format={FormatTypes.underline}
              icon={<FormatUnderlined sx={{ display: 'block' }} />}
            />
            <TextEditorColorButton />
            <BlockButton
              format={FormatTypes.headingOne}
              icon={<LooksOne sx={{ display: 'block' }} />}
            />
            <BlockButton
              format={FormatTypes.headingTwo}
              icon={<LooksTwo sx={{ display: 'block' }} />}
            />
            <BlockButton
              format={FormatTypes.alignLeft}
              icon={<FormatAlignLeft sx={{ display: 'block' }} />}
            />
            <BlockButton
              format={FormatTypes.alignCenter}
              icon={<FormatAlignCenter sx={{ display: 'block' }} />}
            />
            <BlockButton
              format={FormatTypes.alignRight}
              icon={<FormatAlignRight sx={{ display: 'block' }} />}
            />
            <BlockButton
              format={FormatTypes.numberedList}
              icon={<FormatListNumbered sx={{ display: 'block' }} />}
            />
            <BlockButton
              format={FormatTypes.bulletedList}
              icon={<FormatListBulleted sx={{ display: 'block' }} />}
            />
            <TextEditorLinkButton />
            <TextEditorImageButton
              onAddImagesCustomHandle={onAddImagesCustomHandler}
              groupId={groupId}
            />
            {customToolbarButtons?.map((b) => b)}
          </Box>
        </Box>
        {customeAdditionalComponents?.map((c) => c)}
        <div ref={editableRef}>
          <StyledEditable
            placeholder={t('form.placeholder')}
            spellCheck
            onFocus={onFocusEditor}
            onBlur={onBlurEditor}
          />
        </div>
      </Slate>
    </Box>
  );
};

export default SlateTextEditor;
