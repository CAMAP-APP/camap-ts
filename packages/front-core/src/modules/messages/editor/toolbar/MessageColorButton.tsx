import { FormatColorText } from '@mui/icons-material';
import { Box, ButtonBase } from '@mui/material';
import Popover from '@mui/material/Popover';
import { useTheme } from '@mui/material/styles';
import React from 'react';
import { useEditorRef } from '@platejs/core/react';
import theme from '../../../../theme/default/theme';
import { TextEditorToolbarButton } from './TextEditorToolbarButton';

const MessageColorButton = () => {
  const editor = useEditorRef();
  const { palette } = useTheme();
  const colors = [
    palette.common.black,
    palette.primary.main,
    palette.secondary.main,
    palette.info.main,
    palette.warning.main,
    palette.error.main,
  ];

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [isActive, setIsActive] = React.useState(false);

  const handleClose = () => {
    setAnchorEl(null);
    setIsActive(false);
  };

  const activeColor = (() => {
    try {
      const marks = editor.api.marks();
      const color = marks?.color;
      return typeof color === 'string' ? color : '';
    } catch {
      return '';
    }
  })();

  const onColorClick = (color: string) => {
    // Reset to default black by removing the mark.
    if (color === colors[0]) {
      editor.tf.removeMark('color');
    } else {
      editor.tf.addMark('color', color);
    }
    handleClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? 'message-color-popover' : undefined;

  return (
    <>
      <TextEditorToolbarButton
        aria-describedby={id}
        active={isActive}
        onMouseDown={(event) => {
          event.preventDefault();
          setIsActive(true);
          setAnchorEl(event.currentTarget);
        }}
      >
        <FormatColorText
          sx={{ display: 'block' }}
          htmlColor={activeColor || undefined}
        />
      </TextEditorToolbarButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Box flexGrow={1} padding={0.5} display="flex">
          {colors.map((c) => (
            <ButtonBase key={c} onClick={() => onColorClick(c)}>
              <Box
                borderRadius={'50%'}
                boxSizing={'border-box'}
                sx={{ cursor: 'pointer' }}
                height={'20px'}
                width={'20px'}
                margin={theme.spacing(0.5)}
                padding={'2px'}
                bgcolor={c}
                color={palette.getContrastText(c)}
              >
                {(activeColor === '' && c === colors[0]) || activeColor === c
                  ? '✓'
                  : ''}
              </Box>
            </ButtonBase>
          ))}
        </Box>
      </Popover>
    </>
  );
};

export default MessageColorButton;

