import { AttachFile } from '@mui/icons-material';
import { Box, Chip } from '@mui/material';
import React from 'react';
import { MessagesContext } from '../../MessagesContext';

const BINARY_TO_BASE64_SIZE_FACTOR = 1.33;

const getSizeAsString = (octet: number): string => {
  const units = ['o', ' Ko', ' Mo', ' Go'];

  if (octet < 1000) {
    return `${octet}${units[0]}`;
  }
  if (octet < 1000000) {
    const ko = Math.round(octet / 1024);
    return `${ko}${units[1]}`;
  }
  const mo = octet / (1024 * 1024);
  return `${Math.round(mo * 10) / 10}${units[2]}`;
};

const AttachmentList = () => {
  const { attachments, removeAttachment } = React.useContext(MessagesContext);

  if (attachments.length === 0) return null;

  return (
    <Box
      position="relative"
      sx={{
        borderRight: `solid`,
        borderBottom: `solid`,
        borderLeft: `solid`,
        borderColor: 'divider',
        flexDirection: 'row',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}
      p={1}
    >
      <AttachFile sx={{ display: 'block' }} />
      {attachments.map((a) => (
        <Box m={0.5} key={a.name} maxWidth="100%">
          <Chip
            label={`${a.name} (${getSizeAsString(
              a.size * BINARY_TO_BASE64_SIZE_FACTOR,
            )})`}
            size="small"
            onDelete={() => removeAttachment(a)}
            sx={{ maxWidth: '100%' }}
          />
        </Box>
      ))}
    </Box>
  );
};

export default AttachmentList;
