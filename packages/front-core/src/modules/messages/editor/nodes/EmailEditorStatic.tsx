import React from 'react';
import { pipeDecorate, pipeRenderElementStatic, pipeRenderLeafStatic, pipeRenderTextStatic, PlateStaticProps, SlateRenderElementProps } from "@platejs/core/static";

import { DecoratedRange, Descendant, EditableProps, ElementApi, isElementDecorationsEqual, isTextDecorationsEqual, NodeEntry, Path, RangeApi, SlateEditor, TElement, Text, TextApi, TText } from 'platejs';
  
function BaseElementStatic({
        decorate,
        decorations,
        editor,
        element = { children: [], type: '' },
        path,
    }: {
        decorate: EditableProps['decorate'];
        decorations: DecoratedRange[];
        editor: SlateEditor;
        element: TElement;
        path: Path;
        style?: React.CSSProperties;
    }) {

    const renderElement = pipeRenderElementStatic(editor);

    const attributes: SlateRenderElementProps['attributes'] = {
        'data-slate-node': 'element',
        ref: null,
    };

    let children: React.ReactNode = (
        <Children
            decorate={decorate}
            decorations={decorations}
            editor={editor}
            parentPath={path}
        >
            {element.children}
        </Children>
    );

    if (editor.api.isVoid(element)) {
        attributes['data-slate-void'] = true;
        children = (
        <span
            style={{
                color: 'transparent',
                height: '0',
                outline: 'none',
                position: 'absolute',
            }}
            data-slate-spacer
        >
            <Children
                decorate={decorate}
                decorations={decorations}
                editor={editor}
                parentPath={path}
            >
                {element.children}
            </Children>
        </span>
        );
    }
    if (editor.api.isInline(element)) {
        attributes['data-slate-inline'] = true;
    }

    return <>{renderElement?.({ attributes, children, element })}</>;
}

const ElementStatic = React.memo(
    BaseElementStatic,
    (prev, next) =>
        (prev.element === next.element ||
        (prev.element._memo !== undefined &&
            prev.element._memo === next.element._memo)) &&
        isElementDecorationsEqual(prev.decorations, next.decorations)
);

function BaseLeafStatic({
        decorations,
        editor,
        path,
        text = { text: '' },
    }: {
        decorations: DecoratedRange[];
        editor: SlateEditor;
        path: Path;
        text: TText;
    }) {
    const renderLeaf = pipeRenderLeafStatic(editor);
    const renderText = pipeRenderTextStatic(editor);

    const decoratedLeaves = TextApi.decorations(text, decorations);

    const leafElements = decoratedLeaves.map(({ leaf, position }, index) => {
        const text = leaf.text.replace(/\n/g, '<br/>');
        const leafElement = renderLeaf({
            attributes: {  },
            children: (
                <>{text}</>
            ),
            leaf: { text },
            leafPosition: position,
            text: { text },
        });

        return <React.Fragment key={index}>{leafElement}</React.Fragment>;
    });

    return renderText({
        attributes: { 'data-slate-node': 'text' as const, ref: null },
        children: leafElements,
        text: text as Text,
    });
}

export const LeafStatic = React.memo(BaseLeafStatic, (prev, next) => {
        return (
            // prev.text === next.text &&
            TextApi.equals(next.text, prev.text) &&
            isTextDecorationsEqual(next.decorations, prev.decorations)
        );
    });

const defaultDecorate: (entry: NodeEntry) => DecoratedRange[] = () => [];

function Children({
        children = [],
        decorate = defaultDecorate,
        decorations = [],
        editor,
        parentPath = [],
    }: {
        children: Descendant[];
        decorate: EditableProps['decorate'];
        decorations: DecoratedRange[];
        editor: SlateEditor;
        parentPath?: Path;
    }) {
    return (
        <>
        {children.map((child, i) => {
            const p = [...parentPath, i];

            let ds: DecoratedRange[] = [];

            const range = editor.api.range(p);

            if (range) {
                ds = decorate([child, p]);

                for (const dec of decorations) {
                    const d = RangeApi.intersection(dec, range);

                    if (d) {
                        ds.push(d);
                    }
                }
            }

            return ElementApi.isElement(child) ? (
                <ElementStatic
                    key={i}
                    decorate={decorate}
                    decorations={ds}
                    editor={editor}
                    element={child}
                    path={p}
                />
            ) : (
                <LeafStatic
                    key={i}
                    decorations={ds}
                    editor={editor}
                    path={p}
                    text={child}
                />
            );
        })}
        </>
    );
}

export default function EmailEditorStatic(props: PlateStaticProps) {
    const { className, editor, value, ...rest } = props;

    if (value) {
        editor.children = value;
    }

    const decorate = pipeDecorate(editor);

    let afterEditable: React.ReactNode = null;
    let beforeEditable: React.ReactNode = null;

    editor.meta.pluginCache.render.beforeEditable.forEach((key) => {
        const plugin = editor.getPlugin({ key });
        const BeforeEditable = plugin.render.beforeEditable;

        if (BeforeEditable) {
            beforeEditable = (
                <>
                {beforeEditable}
                <BeforeEditable />
                </>
            );
        }
    });

    editor.meta.pluginCache.render.afterEditable.forEach((key) => {
        const plugin = editor.getPlugin({ key });
        const AfterEditable = plugin.render.afterEditable;

        if (AfterEditable) {
        afterEditable = (
            <>
            {afterEditable}
            <AfterEditable />
            </>
        );
        }
    });

    const content = (
        <div
            {...rest}
        >
            <Children decorate={decorate} decorations={[]} editor={editor}>
                {editor.children}
            </Children>
        </div>
    );

    let aboveEditable: React.ReactNode = (
        <>
        {beforeEditable}
        {content}
        {afterEditable}
        </>
    );

    // Use pre-computed arrays for aboveEditable components
    editor.meta.pluginCache.render.aboveEditable.forEach((key) => {
        const plugin = editor.getPlugin({ key });
        const AboveEditable = plugin.render.aboveEditable;

        if (AboveEditable) {
        aboveEditable = <AboveEditable>{aboveEditable}</AboveEditable>;
        }
    });

    return aboveEditable;
}