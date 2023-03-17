import { Box } from '@mui/material';
import React from 'react';
import BackButton from '../../components/utils/BackButton';
import MessageTable from './containers/MessageTable';

interface MessageProps {
  messageId: number;
  onBack: () => void;
}

const Message = ({ messageId, onBack }: MessageProps) => {
  return (
    <Box>
      <Box mb={2}>
        <MessageTable messageId={messageId} />
      </Box>
      <Box p={{ xs: 1, sm: 0 }}>
        <BackButton onClick={onBack} />
      </Box>
    </Box>
  );
};

export default Message;
