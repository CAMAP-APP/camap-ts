import { LinkPlugin } from '@platejs/link/react';
import { ListPlugin, BulletedListPlugin, NumberedListPlugin, TaskListPlugin, ListItemPlugin } from '@platejs/list-classic/react';
import {
    BasicBlocksPlugin,
    BasicMarksPlugin,
} from '@platejs/basic-nodes/react';
import {
    FontColorPlugin,
    TextAlignPlugin,
} from '@platejs/basic-styles/react';
import {
    IndentPlugin
} from '@platejs/indent/react';
import { ImagePlugin } from '@platejs/media/react';
import { MediaImageNode } from './nodes/MediaImageNode';
import { AutoformatPlugin } from '@platejs/autoformat';
import type { InferConfig, PlatePlugin, TPlateEditor } from '@platejs/core/react';
import type { PluginConfig, Value } from 'platejs';
import { autoformatRules } from './autoformat';
import { LinkNode } from './nodes/LinkNode';

// `@platejs/basic-nodes` currently exports these as `PluginConfig<any, ...>` which collapses
// `InferTransforms<...>` to `any` when deriving the editor type. We keep runtime behavior
// but provide a stable string key for type inference.
const TypedBasicBlocksPlugin = BasicBlocksPlugin as PlatePlugin<
    PluginConfig<'basicBlocks', {}, {}, {}, {}>
>;
const TypedBasicMarksPlugin = BasicMarksPlugin as PlatePlugin<
    PluginConfig<'basicMarks', {}, {}, {}, {}>
>;

export const MESSAGE_BASE_PLUGINS = [
    TypedBasicBlocksPlugin,
    TypedBasicMarksPlugin,
    FontColorPlugin,
    TextAlignPlugin,
    LinkPlugin.withComponent(LinkNode),
    IndentPlugin,
    ListPlugin,
    BulletedListPlugin,
    NumberedListPlugin,
    TaskListPlugin,
    ListItemPlugin,
    ImagePlugin.withComponent(MediaImageNode),
] as const;

export const MESSAGE_EDITOR_PLUGINS = [
    ...MESSAGE_BASE_PLUGINS,
    AutoformatPlugin.configure({
        options: {
            rules: [...autoformatRules],
        },
    }),
] as const;

export type MessageEditorPlugin = InferConfig<(typeof MESSAGE_EDITOR_PLUGINS)[number]>;
export type MessageEditor = TPlateEditor<Value, MessageEditorPlugin>;

/**
 * Backward-compatible helper for call sites that want a fresh array instance.
 * Keeps the historical behavior (no autoformat plugin).
 */
export const getPlatePlugins = () => [...MESSAGE_BASE_PLUGINS];