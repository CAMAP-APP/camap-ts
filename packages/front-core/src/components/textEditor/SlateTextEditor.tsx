import withHelperTextTranslation from '@components/forms/shared/withHelperTextTranslation';
import { UserFragment, UserList } from '@gql';
import { LoadingButton } from '@mui/lab';
import { Alert, Box, TextField as MuiTextField } from '@mui/material';
import { formatUserList } from '@utils/fomat';
import { UserLists } from 'camap-common';
import { Field, Form, Formik } from 'formik';
import { fieldToTextField } from 'formik-mui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import MessageLatestMessagesSelect from './MessageLatestMessagesSelect';
import MessageObject from './MessageObject';
import MessageRecipientsSelect, {
  RecipientOption,
  RecipientOptionGroup,
} from './MessageRecipientsSelect';
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
import theme from '../../theme/default/theme';
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

// 🔧 FIX: Structure Slate valide pour une valeur vide
export const EMPTY_SLATE_VALUE: Node[] = [
  {
    types: [FormatTypes.paragraph],
    children: [{ text: '' }],
  },
];

export const EMPTY_EDITOR_HTML_REGEX = /<div style=".*"><p><br><\/p><\/div>/;

const EDITOR_PADDING = 8;

const StyledEditable = styled(CustomEditable)(() => ({
  minHeight: '350px !important',
  padding: EDITOR_PADDING,
  overflow: 'hidden',
}));

const getOtherListFormat = (format: string) => {
  if (format === FormatTypes.numberedList) {
    return FormatTypes.bulletedList;
  }

const CustomTextField = withHelperTextTranslation(
  MuiTextField,
  fieldToTextField,
);

const LatestMessagesFieldComponent = (props: any) => {
  return <MessageLatestMessagesSelect {...props} />;
};

const ObjectFieldComponent = (props: any) => {
  return <MessageObject {...props} />;
};

const MessagesForm = ({
  user,
  isPartnerConnected,
  defaultUserLists,
  onSubmit,
  isSuccessful,
  groupName,
}: Props) => {
  const { t } = useTranslation(['messages/default']);
  const { t: tLists } = useTranslation(['members/lists']);

  const defaultRecipientsOptions: RecipientOption[] = defaultUserLists.map(
    (ul) => ({
      value: ul.type,
      key: ul.type,
      label: formatUserList(ul, tLists),
      group: RecipientOptionGroup.DEFAULT,
      disabled: ul.count === 0,
    }),
  );

  const testLists = UserLists.TEST;
  defaultRecipientsOptions.push({
    key: testLists.type,
    value: testLists.type,
    label: tLists(testLists.type),
    group: RecipientOptionGroup.DEFAULT,
    disabled: false,
  });
  const vendorsLists = UserLists.VENDORS;
  defaultRecipientsOptions.push({
    key: vendorsLists.type,   
    value: vendorsLists.type,
    label: tLists(vendorsLists.type),
    group: RecipientOptionGroup.DEFAULT,
    disabled: false,
  });
  let senderEmail = '';
  let senderName = groupName;
  if (isPartnerConnected && !!user.email2) {
    senderEmail = user.email2;
  } else {
    senderEmail = user.email;
  }

  const initialValues: MessagesFormValues = {
    senderName,
    senderEmail,
    recipientsList: undefined,
    object: '',
    message: '', // Valeur initiale vide - SlateTextEditor gère la normalisation
  };

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

// 🔧 FIX: Utiliser EMPTY_SLATE_VALUE comme valeur initiale
export const SLATE_INITIAL_VALUE = EMPTY_SLATE_VALUE;

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

    if (node.text === '') {
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
  groupId?: number;
}

// 🔧 FIX: Fonction de normalisation pour garantir une structure Slate valide
const normalizeSlateValue = (val: any): Node[] => {
  if (!val || (Array.isArray(val) && val.length === 0) || val === '') {
    return EMPTY_SLATE_VALUE;
  }
  
  if (typeof val === 'string') {
    return EMPTY_SLATE_VALUE;
  }
  
  if (!Array.isArray(val)) {
    console.warn('Slate value is not an array, using EMPTY_SLATE_VALUE');
    return EMPTY_SLATE_VALUE;
  }
  
  return val.map((node: any) => {
    if (!node.children || node.children.length === 0) {
      return {
        ...node,
        children: [{ text: '' }],
      };
    }
    return node;
  });
};

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

  // 🔧 FIX: Normaliser la valeur initiale
  const [value, setValue] = useState<Node[]>(() => 
    normalizeSlateValue(customValue || SLATE_INITIAL_VALUE)
  );
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

    // 🔧 FIX: Normaliser customValue avant de l'utiliser
    const normalizedValue = normalizeSlateValue(customValue);
    editor.children = normalizedValue;
    setValue(normalizedValue);
    setFormikValue(editableRef.current || undefined);
  }, [customValue, editor]);

  useEffect(() => {
    if (formikValue === '') {
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
      <Slate editor={editor} initialValue={value} onChange={onValueChange}>
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