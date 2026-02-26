import CamapIcon, { CamapIconId } from "@components/utils/CamapIcon";
import { PlateElementProps, TPlateEditor } from "@platejs/core/react";
import theme from "@theme/default/theme";
import { TLinkElement, Value } from "platejs";
import { useState } from "react";
import { MessageEditorPlugin } from "../platePlugins";

export const LinkNode = ({
    element,
    children,
    editor,
}: PlateElementProps<TLinkElement> & { editor: TPlateEditor<Value, MessageEditorPlugin> }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [pinEditBox, setPinEditBox] = useState(false);
    const [editBoxValue, setEditBoxValue] = useState(element.url);
    const linkPath = editor.api.findPath(element);
    return (
        // <a href={element.url} target="_blank" rel="noopener noreferrer">
        //     {children}
        // </a>
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                display: 'inline-block',
                color: theme.palette.primary.main,
                textDecoration: 'underline',
                position: 'relative',
            }}>
            {children}
            {(isHovered || pinEditBox) && <div
                // contentEditable={false}
                onMouseDown={(e) => {
                    // Prevent Plate/Slate from stealing the click.
                    e.stopPropagation();
                }}
                style={{
                    position: 'absolute',
                    top: '100%',
                    padding: '0.5em 1em',
                    left: '-1em',
                    boxSizing: 'content-box',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5em',
                    width: 'max-content',
                    maxWidth: '300px',
                    whiteSpace: 'normal',
                    overflowWrap: 'anywhere',
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    borderRadius: theme.shape.borderRadius,
                    boxShadow: theme.shadows[1],
                    opacity: (isHovered || pinEditBox) ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                    zIndex: 1000,
                }}>
                <CamapIcon id={CamapIconId.link} />
                <input
                    type="text"
                    value={editBoxValue}
                    contentEditable={false}
                    onMouseDown={(e) => {
                        // Allow focusing the input without moving the editor selection.
                        e.stopPropagation();
                    }}
                    onFocus={() => setPinEditBox(true)}
                    onChange={(e) => setEditBoxValue(e.target.value)}
                    onBlur={(e) => {
                        setPinEditBox(false);
                        if (!linkPath) return;
                        editor.tf.setNodes(
                            { url: editBoxValue },
                            { at: linkPath },
                        );
                    }} />
            </div>
            }
        </div>
    );
};