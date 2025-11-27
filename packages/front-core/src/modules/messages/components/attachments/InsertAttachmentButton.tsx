import { AttachFile } from '@mui/icons-material';
import { Box } from '@mui/material';
import React from 'react';
import { TextEditorComponents } from '../../../../components/textEditor/TextEditorComponents';
import { MessagesContext } from '../../MessagesContext';

const InsertAttachmentButton = () => {
  const { addAttachment } = React.useContext(MessagesContext);
  const attachmentInput = React.useRef<HTMLInputElement>(null);
  const [isActive, setIsActive] = React.useState(false);

  const openUploadAttachmentInput = () => {
    if (!attachmentInput || !attachmentInput.current) return;
    attachmentInput.current.value = '';
    attachmentInput.current.click();
  };

  const onMouseDown = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    setIsActive(true);
    openUploadAttachmentInput();
  };

  const onMouseUp = () => {
    setIsActive(false);
  };

  const uploadAttachment = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (
      !event ||
      !event.target ||
      !event.target.files ||
      event.target.files.length === 0
    )
      return;

    const file = event.target.files[0];
    addAttachment(file);
  };

  return (
    <TextEditorComponents
      active={isActive}
      onMouseDown={onMouseDown}
      aria-controls="attachment-upload-menu"
      aria-haspopup="true"
      onMouseUp={onMouseUp}
    >
      <AttachFile sx={{ display: 'block' }} />
      <Box display="none">
        <input
          type="file"
          accept="*"
          ref={attachmentInput}
          onChange={uploadAttachment}
        />
      </Box>
    </TextEditorComponents>
  );
};

export default InsertAttachmentButton;
