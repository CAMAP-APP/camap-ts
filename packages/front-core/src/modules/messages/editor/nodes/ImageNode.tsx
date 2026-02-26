import { PlateEditor } from "@platejs/core/react";
import { MessageImageElement } from "../messageEditorSchema";

export const ImageNode = ({ element, editor, children, api }: { element: MessageImageElement, editor: PlateEditor, children: React.ReactNode[], api: PlateEditor['api'] }) => {
    return <img src={element.dataUrl} />;
};