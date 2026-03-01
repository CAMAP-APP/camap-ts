import type { BaseNode } from 'slate';
import {
    AttachmentFileInput,
    AttachmentUnion,
    EmbeddedImageAttachment,
} from '../../../gql';
import { removeAccents, removeSpaces } from '../../../utils/fomat/string';
import { getContentAndTypeFromBase64EncodedImage } from '../../../utils/image';
import { isUrl } from '@utils/url';

export const reusedMessageEmbeddedImages = (
    newContentValue: BaseNode[],
    attachments: AttachmentUnion[] | undefined,
) => {
    const embeddedImagesToAdd: AttachmentFileInput[] = [];
    const embeddedImageAttachments =
        attachments &&
        attachments.map((a) => {
            if ('cid' in a) {
                return a as EmbeddedImageAttachment;
            }
            return null;
        });

    const recursivelyCheckNode = (nodes: BaseNode[]) => {
        nodes.forEach((n) => {
            if ('type' in n) {
                if (n.type !== 'img') {
                    if ('children' in n && Array.isArray(n.children)) {
                        recursivelyCheckNode(n.children.filter((x: unknown) => x != null && typeof x === 'object'));
                    }
                } else {
                    const imageNode = n as any;
                    const imageSource = imageNode.dataUrl || '';
                    const [content, contentType] = getContentAndTypeFromBase64EncodedImage(imageSource);

                    const embeddedImageAttachment = embeddedImageAttachments?.find(
                        (a) => a && a.content === content,
                    );

                    let cid: string;
                    if (embeddedImageAttachment) {
                        cid = embeddedImageAttachment.cid;
                    } else {
                        cid = imageNode.filename
                            ? removeSpaces(removeAccents(imageNode.filename))
                            : (imageNode.cid ?? '');
                    }

                    if (
                        imageNode.url &&
                        !imageNode.dataUrl?.startsWith('data:image') &&
                        isUrl(imageNode.url)
                    ) {
                        return;
                    }

                    embeddedImagesToAdd.push({
                        filename: imageNode.filename ?? 'image',
                        contentType,
                        encoding: 'base64',
                        content,
                        cid,
                    });
                }
            }
        });
    };

    recursivelyCheckNode(newContentValue);

    return embeddedImagesToAdd;
}