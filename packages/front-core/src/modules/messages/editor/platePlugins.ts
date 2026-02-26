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

export const getPlatePlugins = () => {
    return [
        BasicBlocksPlugin,
        BasicMarksPlugin,
        FontColorPlugin,
        TextAlignPlugin,
        LinkPlugin,
        IndentPlugin,
        ListPlugin, BulletedListPlugin, NumberedListPlugin, TaskListPlugin, ListItemPlugin,
        ImagePlugin.withComponent(MediaImageNode)
    ]
}