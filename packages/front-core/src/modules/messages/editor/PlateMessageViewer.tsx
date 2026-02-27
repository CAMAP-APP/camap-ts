import { useMemo } from 'react';
import type { Value } from 'platejs';
import { Plate, PlateContent, usePlateEditor } from '@platejs/core/react';
import { getPlatePlugins } from './platePlugins';
import { plateStyles } from './plateStyles';
import { Box } from '@mui/material';

export const PlateMessageViewer = ({ value }: { value: Value }) => {
  const plugins = useMemo(
    () => getPlatePlugins(),
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

