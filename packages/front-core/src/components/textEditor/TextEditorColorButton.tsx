import { FormatColorText } from '@mui/icons-material';
import { Box, ButtonBase } from '@mui/material';
import Popover from '@mui/material/Popover';
import { useTheme } from '@mui/material/styles';
import React from 'react';
import { Editor } from 'slate';
import { useSlate } from 'slate-react';
import theme from '../../theme';
import { TextEditorComponents } from './TextEditorComponents';

const TextEditorColorButton = () => {
  const editor = useSlate();
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

  const onMouseDown = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    setIsActive(true);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setIsActive(false);
  };

  const isMarkActive = (color: string) => {
    try {
      const marks = Editor.marks(editor);
      return (marks && color in marks) ? marks[color as keyof typeof marks] === true : false;
    } catch {
      return false;
    }
  };

  const onColorClick = (color: string) => {
    const marks = Editor.marks(editor);
    let otherColorMark = '';
    if (marks) {
      Object.entries(marks).forEach(([mark]) => {
        if (mark.startsWith('#')) otherColorMark = mark;
      });
    }

    if (otherColorMark !== '') {
      Editor.removeMark(editor, otherColorMark);
    }
    if (color !== colors[0]) {
      const newColorMark = color;
      Editor.addMark(editor, newColorMark, true);
    }

    handleClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? 'color-popover' : undefined;

  let activeColor = '';
  colors.forEach((c) => {
    if (isMarkActive(c)) activeColor = c;
  });

  return (
    <>
      <TextEditorComponents
        aria-describedby={id}
        active={isActive}
        onMouseDown={onMouseDown}
      >
        <FormatColorText sx={{ display: 'block' }} htmlColor={activeColor} />
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
                {(isMarkActive(c) || (activeColor === '' && c === colors[0])) &&
                  '✓'}
              </Box>
            </ButtonBase>
          ))}
        </Box>
      </Popover>
    </>
  );
};

export default TextEditorColorButton;
