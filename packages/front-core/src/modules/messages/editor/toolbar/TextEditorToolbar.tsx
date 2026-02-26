import {
    FormatAlignCenter,
    FormatAlignLeft,
    FormatAlignRight,
    FormatBold,
    FormatItalic,
    FormatListBulleted,
    FormatListNumbered,
    FormatUnderlined,
    LooksOne,
    LooksTwo,
} from '@mui/icons-material';
import { Box } from "@mui/material";
import theme from "@theme/default/theme";
import { TextEditorToolbarButton } from "./TextEditorToolbarButton";
import { PlateEditor } from "@platejs/core/react";
import MessageColorButton from './MessageColorButton';
import MessageImageButton from './MessageImageButton';
import MessageLinkButton from './MessageLinkButton';
import { someList } from '@platejs/list-classic';
import type { MessageEditor } from '../platePlugins';

const isMarkActive = (
    editor: PlateEditor,
    mark: Mark,
) => {
    const marks = editor.api.marks();
    return !!marks?.[mark];
};

const toggleMark = (editor: PlateEditor, mark: Mark) => {
    editor.tf.toggleMark(mark);
};

type Align = 'left' | 'center' | 'right';
type Mark = 'bold' | 'italic' | 'underline';

const getActiveBlock = (editor: PlateEditor) => {
    const entry = editor.api.above({
        match: (n) => editor.api.isBlock(n as any),
    });
    return entry?.[0] as any | undefined;
};

const getActiveAlign = (editor: PlateEditor) => {
    const block = getActiveBlock(editor);
    const align = block?.align;
    if (
        align === 'left' ||
        align === 'center' ||
        align === 'right'
    )
        return align;
    return undefined;
};

const setAlign = (editor: PlateEditor, align: Align) => {
    editor.tf.setNodes(
        { align },
        { match: (n) => editor.api.isBlock(n as any) },
    );
};

const toggleHeading = (editor: PlateEditor, type: 'h1' | 'h2') => {
    const block = getActiveBlock(editor);
    const isActive = block?.type === type;
    const nextType = isActive ? 'p' : type;
    editor.tf.setNodes(
        { type: nextType },
        { match: (n) => editor.api.isBlock(n as any) },
    );
};

export default function TextEditorToolbar({
    editor,
    onAddImagesCustomHandle,
    groupId,
    toolbarEnd
}: {
    editor: MessageEditor,
    onAddImagesCustomHandle?: (files: File[]) => void,
    groupId?: number,
    toolbarEnd?: React.ReactNode
}) {
    return <Box
        position="relative"
        bgcolor={theme.palette.divider}
        borderRadius={`${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`}
    >
        <Box display="flex" flexWrap="wrap">
            <TextEditorToolbarButton
                active={isMarkActive(editor, 'bold')}
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleMark(editor, 'bold');
                }}
            >
                <FormatBold sx={{ display: 'block' }} />
            </TextEditorToolbarButton>
            <TextEditorToolbarButton
                active={isMarkActive(editor, 'italic')}
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleMark(editor, 'italic');
                }}
            >
                <FormatItalic sx={{ display: 'block' }} />
            </TextEditorToolbarButton>
            <TextEditorToolbarButton
                active={isMarkActive(editor, 'underline')}
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleMark(editor, 'underline');
                }}
            >
                <FormatUnderlined sx={{ display: 'block' }} />
            </TextEditorToolbarButton>

            <MessageColorButton />

            <TextEditorToolbarButton
                active={getActiveBlock(editor)?.type === 'h1'}
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleHeading(editor, 'h1');
                }}
            >
                <LooksOne sx={{ display: 'block' }} />
            </TextEditorToolbarButton>
            <TextEditorToolbarButton
                active={getActiveBlock(editor)?.type === 'h2'}
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleHeading(editor, 'h2');
                }}
            >
                <LooksTwo sx={{ display: 'block' }} />
            </TextEditorToolbarButton>

            <TextEditorToolbarButton
                active={getActiveAlign(editor) === 'left'}
                onMouseDown={(e) => {
                    e.preventDefault();
                    setAlign(editor, 'left');
                }}
            >
                <FormatAlignLeft sx={{ display: 'block' }} />
            </TextEditorToolbarButton>
            <TextEditorToolbarButton
                active={getActiveAlign(editor) === 'center'}
                onMouseDown={(e) => {
                    e.preventDefault();
                    setAlign(editor, 'center');
                }}
            >
                <FormatAlignCenter sx={{ display: 'block' }} />
            </TextEditorToolbarButton>
            <TextEditorToolbarButton
                active={getActiveAlign(editor) === 'right'}
                onMouseDown={(e) => {
                    e.preventDefault();
                    setAlign(editor, 'right');
                }}
            >
                <FormatAlignRight sx={{ display: 'block' }} />
            </TextEditorToolbarButton>

            <TextEditorToolbarButton
                active={someList(editor, 'ol')}
                onMouseDown={(e) => {
                    e.preventDefault();
                    editor.tf.ol.toggle()
                }}
            >
                <FormatListNumbered sx={{ display: 'block' }} />
            </TextEditorToolbarButton>
            <TextEditorToolbarButton
                active={someList(editor, 'ul')}
                onMouseDown={(e) => {
                    e.preventDefault();
                    editor.tf.ul.toggle()
                }}
            >
                <FormatListBulleted sx={{ display: 'block' }} />
            </TextEditorToolbarButton>

            <MessageLinkButton editor={editor} />
            <MessageImageButton
                onAddImagesCustomHandle={onAddImagesCustomHandle}
                groupId={groupId}
            />

            {toolbarEnd}
        </Box>
    </Box>
}