import { useMemo } from 'react';
import type { Value } from 'platejs';
import { Plate, PlateContent, usePlateEditor } from '@platejs/core/react';
import { getPlatePlugins } from './platePlugins';

export const PlateMessageViewer = ({ value }: { value: Value }) => {
  const plugins = useMemo(
    () => getPlatePlugins(),
    [],
  );

  const editor = usePlateEditor({
    plugins,
    value,
  });

  return (
    <Plate editor={editor} readOnly>
      <PlateContent
        readOnly
      />
    </Plate>
  );
};

