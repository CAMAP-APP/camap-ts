import { InsertLink } from '@mui/icons-material';
import { Box, Grid, TextField } from '@mui/material';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Editor, Range, Transforms } from 'slate';
import { useSlate } from 'slate-react';
import { TextEditorComponents } from './TextEditorComponents';
import FormatTypes, { CustomEditor } from './TextEditorFormatType';

const isLinkActive = (editor: CustomEditor) => {
  const [link] = Editor.nodes(editor, {
    match: (n) => 'type' in n && n.type === FormatTypes.hyperlink,
  });
  return !!link;
};

const unwrapLink = (editor: CustomEditor) => {
  Transforms.unwrapNodes(editor, {
    match: (n) => 'type' in n && n.type === FormatTypes.hyperlink,
  });
};

const wrapLink = (editor: CustomEditor, url: string, text?: string) => {
  if (isLinkActive(editor)) {
    unwrapLink(editor);
  }

  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const link = {
    type: FormatTypes.hyperlink,
    url,
    children: isCollapsed ? [{ text: text || url }] : [],
  };

  if (isCollapsed) {
    Transforms.insertNodes(editor, link);
  } else {
    Transforms.wrapNodes(editor, link, { split: true });
    Transforms.collapse(editor, { edge: 'end' });
  }
};

const insertLink = (editor: CustomEditor, url: string, text?: string) => {
  if (editor.selection) {
    wrapLink(editor, url, text);
  }
};

const DEFAULT_SELECTION: Range = {
  anchor: {
    path: [0, 0],
    offset: 0,
  },
  focus: {
    path: [0, 0],
    offset: 0,
  },
};

const TextEditorLinkButton = () => {
  const { t } = useTranslation(['messages/default']);
  const editor = useSlate();
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [textInput, setTextInput] = React.useState<string>('');
  const [urlInput, setUrlInput] = React.useState<string>('');
  const [selection, setSelection] = React.useState<Range | null>(null);
  const [isActive, setIsActive] = React.useState(false);

  const reset = () => {
    setTextInput('');
    setUrlInput('');
    setSelection(null);
  };

  const onMouseDown = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    setIsActive(true);
    setSelection(editor.selection);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    reset();
    setIsActive(false);
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTextInput(event.target.value);
  };

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrlInput(event.target.value);
  };

  const onAddLink = () => {
    if (!urlInput) return;
    editor.selection = selection || DEFAULT_SELECTION;
    let url = urlInput;
    if (!urlInput.startsWith('http://') && !urlInput.startsWith('https://')) {
      url = `http://${urlInput}`;
    }
    insertLink(editor, url, textInput);
    handleClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? 'link-popover' : undefined;

  return (
    <>
      <TextEditorComponents
        aria-describedby={id}
        active={isActive || isLinkActive(editor)}
        onMouseDown={onMouseDown}
      >
        <InsertLink sx={{ display: 'block' }} />
      </TextEditorComponents>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Box flexGrow={1} p={2}>
          <Grid container spacing={1}>
            <Grid item xs={9}>
              <TextField
                label={t('text')}
                variant="outlined"
                fullWidth
                value={textInput}
                onChange={handleTextChange}
              />
            </Grid>
            <Grid item container xs={12} direction="row" alignItems="center">
              <Grid item xs={9}>
                <TextField
                  label={t('link')}
                  variant="outlined"
                  fullWidth
                  value={urlInput}
                  onChange={handleUrlChange}
                />
              </Grid>
              <Grid item xs={3} container justifyContent="center">
                <Button variant="contained" onClick={onAddLink}>
                  {t('apply')}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Popover>
    </>
  );
};

export default TextEditorLinkButton;
