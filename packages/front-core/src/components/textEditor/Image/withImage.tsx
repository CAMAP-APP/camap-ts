import { encodeFileToBase64String } from '@utils/encoding';
import {
  getBase64EncodedImage,
  getContentAndTypeFromBase64EncodedImage,
} from '@utils/image';
import { isUrl } from '@utils/url';
import { Transforms } from 'slate';
import FormatTypes, {
  CustomEditor,
  CustomSlateElement,
  CustomSlateImageElement,
} from '../TextEditorFormatType';
import IMAGE_EXTENSIONS from './ImageExtensions';

const isImageUrl = (url: string) => {
  if (!url) return false;
  if (!isUrl(url)) return false;
  const extension = url.split('.').pop();
  return extension && IMAGE_EXTENSIONS.includes(extension);
};

export const insertImage = (
  editor: CustomEditor,
  urlOrBase64: string | ArrayBuffer | null,
  imageName?: string,
) => {
  const image = {
    type: FormatTypes.image,
    imageSource: urlOrBase64,
    imageName,
    children: [{ text: '' }],
  };
  Transforms.insertNodes(editor, image);
};

export const withImages = (
  editor: CustomEditor,
  onAddImageCustomHandler?: (image: File[]) => void,
) => {
  const e = editor;
  const { insertData, isVoid, insertFragment } = e;

  e.isVoid = (element) => {
    return element.type === FormatTypes.image ? true : isVoid(element);
  };

  e.insertFragment = (fragment) => {
    fragment.forEach((node: Node) => {
      if (
        (node as CustomElement).type === FormatTypes.image &&
        !isUrl((node as CustomSlateImageElement).imageSource)
      ) {
        const imageNode = node as CustomSlateImageElement;
        let imageName: string;
        const [content, contentType] = getContentAndTypeFromBase64EncodedImage(
          imageNode.imageSource,
        );
        if ('imageName' in imageNode) {
          imageName = imageNode.imageName;
        } else {
          imageName = content.substring(0, 20);
        }
        if (onAddImageCustomHandler)
          onAddImageCustomHandler([
            new File([content], imageName, { type: contentType }),
          ]);
      }
    });

    insertFragment(fragment);
  };

  e.insertData = (data) => {
    const text = data.getData('text/plain');
    const { files } = data;

    if (files && files.length > 0) {
      const filesArray = Array.from(files);
      filesArray.forEach(async (file) => {
        const [mime] = file.type.split('/');

        if (mime === 'image') {
          const base64 = await encodeFileToBase64String(file);
          if (base64) {
            const fileName = file.name;
            insertImage(
              editor,
              getBase64EncodedImage(base64, file.type),
              fileName,
            );
            if (onAddImageCustomHandler) onAddImageCustomHandler([file]);
          }
        }
      });
    } else if (isImageUrl(text)) {
      insertImage(editor, text);
    } else {
      insertData(data);
    }
  };

  return e;
};
