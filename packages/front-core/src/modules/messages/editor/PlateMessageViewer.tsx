import { useMemo } from 'react';
import type { Value } from 'platejs';
import { Plate, PlateContent, usePlateEditor } from '@platejs/core/react';
import { plateStyles } from './plateStyles';
import { Box } from '@mui/material';
import { MESSAGE_VIEWER_PLUGINS } from './platePlugins';

export const PlateMessageViewer = ({ value }: { value: Value }) => {
  const plugins = useMemo(
    () => [...MESSAGE_VIEWER_PLUGINS],
    [],
  );

  const editor = usePlateEditor({
    plugins,
    value,
  }, [value]);

  return (
    <Box sx={[...plateStyles]}>
      <Plate editor={editor} readOnly>
        <PlateContent
          readOnly
        />
      </Plate>
    </Box>
  );
};

