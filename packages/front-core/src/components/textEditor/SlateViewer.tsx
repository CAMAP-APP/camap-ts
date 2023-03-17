import React, { useMemo } from 'react';
import { createEditor, Descendant } from 'slate';
import { Slate, withReact } from 'slate-react';
import CustomEditable from './CustomEditable';

const SlateViewer = ({ value }: { value: Descendant[] }) => {
  const editor = useMemo(() => withReact(createEditor()), []);

  return (
    <Slate editor={editor} value={value} onChange={() => {}}>
      <CustomEditable readOnly />
    </Slate>
  );
};

export default SlateViewer;
