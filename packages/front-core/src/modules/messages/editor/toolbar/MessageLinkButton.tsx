import { InsertLink } from '@mui/icons-material';
import { Box, Grid, TextField } from '@mui/material';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { PlateEditor } from '@platejs/core/react';
import { useEditorRef } from '@platejs/core/react';
import { TextEditorToolbarButton } from './TextEditorToolbarButton';

const isLinkActive = (editor: PlateEditor) => {
  const linkEntry = editor.api.above({
    match: (n) => !!n && typeof n === 'object' && (n as any).type === 'a',
  });
  return !!linkEntry;
};

const unwrapLink = (editor: PlateEditor) => {
  editor.tf.unwrapNodes({
    match: (n) => !!n && typeof n === 'object' && (n as any).type === 'a',
  });
};

const wrapLink = (editor: PlateEditor, url: string, text?: string) => {
  if (isLinkActive(editor)) unwrapLink(editor);

  const { selection } = editor;
  const isCollapsed = selection && editor.api.isCollapsed();
  const link = {
    type: 'a',
    url,
    children: isCollapsed ? [{ text: text || url }] : [],
  };

  if (isCollapsed) {
    editor.tf.insertNodes(link);
  } else {
    editor.tf.wrapNodes(link, { split: true });
    editor.tf.collapse({ edge: 'end' });
  }
};

const insertLink = (editor: PlateEditor, url: string, text?: string) => {
  if (!editor.selection) return;
  wrapLink(editor, url, text);
};

const DEFAULT_SELECTION =
  ({
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 0 },
  } as unknown as NonNullable<PlateEditor['selection']>);

const MessageLinkButton = () => {
  const { t } = useTranslation(['messages/default']);
  const editor = useEditorRef();
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [textInput, setTextInput] = React.useState<string>('');
  const [urlInput, setUrlInput] = React.useState<string>('');
  const [selection, setSelection] = React.useState<PlateEditor['selection']>(null);
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

  const onAddLink = () => {
    if (!urlInput) return;
    const nextSelection = selection || DEFAULT_SELECTION;
    editor.tf.select(nextSelection);
    let url = urlInput;
    if (!urlInput.startsWith('http://') && !urlInput.startsWith('https://')) {
      url = `http://${urlInput}`;
    }
    insertLink(editor, url, textInput);
    handleClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? 'message-link-popover' : undefined;

  return (
    <>
      <TextEditorToolbarButton
        aria-describedby={id}
        active={isActive || isLinkActive(editor)}
        onMouseDown={onMouseDown}
      >
        <InsertLink sx={{ display: 'block' }} />
      </TextEditorToolbarButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Box flexGrow={1} p={2}>
          <Grid container spacing={1}>
            <Grid item xs={9}>
              <TextField
                label={t('text')}
                variant="outlined"
                fullWidth
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
              />
            </Grid>
            <Grid item container xs={12} direction="row" alignItems="center">
              <Grid item xs={9}>
                <TextField
                  label={t('link')}
                  variant="outlined"
                  fullWidth
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
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

export default MessageLinkButton;

