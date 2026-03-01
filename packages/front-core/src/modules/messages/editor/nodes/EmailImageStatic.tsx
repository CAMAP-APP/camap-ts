import { MessageImageElement } from "../messageEditorSchema";

export default function EmailImageStatic({ element }: { element: MessageImageElement }) {

    const src = element.cid ?? (typeof element.url === 'string' ? element.url : '');

    return <img src={src} alt={element.filename} />
}