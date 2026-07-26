import { PlateEditor } from '@platejs/core/react';
import { getCid } from 'modules/messages/utils/cid';
import { registerImageFile } from 'modules/messages/utils/imageFileRegistry';
import { fileToDataURL } from 'modules/messages/utils/fileToDataURL';
import { InsertNodesOptions, KEYS } from 'platejs';

/**
 * Insert images with a stable cid and a persistable data: URL (never blob:).
 * Live File bytes are kept in the cid registry — not on the Slate node (JSON-unsafe).
 */
export const insertImageWithCid = async (
  editor: PlateEditor,
  files: FileList,
  options: InsertNodesOptions = {},
) => {
  for (const file of Array.from(files)) {
    const cid = getCid(file.name);
    const dataUrl = await fileToDataURL(file);
    registerImageFile(cid, file);

    editor.tf.insertNodes(
      {
        type: editor.getType(KEYS.img),
        url: dataUrl,
        cid,
        filename: file.name,
        caption: file.name,
        children: [{ text: '' }],
      },
      {
        nextBlock: true,
        ...(options as Record<string, unknown>),
      },
    );
  }
};
