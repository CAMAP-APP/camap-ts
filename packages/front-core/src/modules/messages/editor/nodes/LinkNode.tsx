import CamapIcon, { CamapIconId } from "@components/utils/CamapIcon";
import { PlateElementProps, TPlateEditor, useSelected } from "@platejs/core/react";
import theme from "@theme/default/theme";
import { TLinkElement, Value } from "platejs";
import { useState } from "react";

type Props = PlateElementProps<TLinkElement> & {
    editor: TPlateEditor<Value>;
};

export const LinkNode = ({ element, children, editor }: Props): JSX.Element => {
    const [isHovered, setIsHovered] = useState(false);
    const [pinEditBox, setPinEditBox] = useState(false);
    const [editBoxValue, setEditBoxValue] = useState(element.url);
    const linkPath = editor.api.findPath(element);

    const isSelected = useSelected();

    const showEditBox = isHovered || pinEditBox || isSelected;
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
            {showEditBox && <div
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
                    opacity: showEditBox ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                    zIndex: 1000,
                }}>
                <CamapIcon id={CamapIconId.link} />
                <input
                    type="text"
                    value={editBoxValue}
                    contentEditable={false}
                    data-message-link-path={linkPath ? linkPath.join('.') : undefined}
                    onMouseDown={(e) => {
                        // Allow focusing the input without moving the editor selection.
                        e.stopPropagation();
                    }}
                    onFocus={() => setPinEditBox(true)}
                    onChange={(e) => setEditBoxValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key !== 'Enter') return;
                        e.preventDefault();
                        e.stopPropagation();

                        if (!linkPath) return;

                        setPinEditBox(false);
                        editor.tf.setNodes(
                            { url: editBoxValue },
                            { at: linkPath },
                        );

                        const after = editor.api.after(linkPath);
                        if (after) {
                            editor.tf.select(after);
                            editor.tf.collapse({ edge: 'end' });
                        } else {
                            editor.tf.select(linkPath);
                            editor.tf.collapse({ edge: 'end' });
                        }

                        editor.tf.focus?.();
                    }}
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