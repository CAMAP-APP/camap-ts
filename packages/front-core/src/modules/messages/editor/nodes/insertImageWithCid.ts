import { PlateEditor } from '@platejs/core/react';
import { getCid } from 'modules/messages/utils/cid';
import { InsertNodesOptions } from 'platejs';
import { KEYS } from 'platejs';

export const insertImageWithCid = async (editor: PlateEditor, files: FileList, options: InsertNodesOptions = {}) => {
  for (const file of files) {
    const cid = getCid(file.name);
    const previewUrl = URL.createObjectURL(file);

    editor.tf.insertNodes({
      type: editor.getType(KEYS.img),
      url: previewUrl,
      cid,
      filename: file.name,
      caption: file.name,
      children: [{ text: '' }],
    }, {
      nextBlock: true,
      ...(options as any),
    });

  }
};