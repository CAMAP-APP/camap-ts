import type { Value } from 'platejs';
import { removeAccents, removeSpaces } from '../../../../utils/fomat/string';
import FormatTypes from './LegacyTextEditorFormatType';
import type {
  MessageAlignment,
  MessageImageElement,
  MessageLinkElement,
} from '../messageEditorSchema';

type LegacyText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  [key: string]: unknown;
};

type LegacyElement = {
  type?: string;
  types?: string[];
  url?: string;
  align?: string;
  imageName?: string;
  imageSource?: string;
  width?: number;
  height?: number;
  children?: Array<LegacyNode>;
  [key: string]: unknown;
};

type LegacyNode = LegacyText | LegacyElement;

const asAlignment = (align?: string): MessageAlignment | undefined => {
  if (align === FormatTypes.alignCenter) return 'center';
  if (align === FormatTypes.alignRight) return 'right';
  if (align === FormatTypes.alignLeft) return 'left';
  return undefined;
};

const typesHas = (types: unknown, type: string): boolean =>
  Array.isArray(types) && types.some((t) => t === type);

const migrateLegacyText = (node: LegacyText): any => {
  const migrated: Record<string, unknown> = { text: node.text ?? '' };
  if (node.bold) migrated.bold = true;
  if (node.italic) migrated.italic = true;
  if (node.underline) migrated.underline = true;

  // Legacy stores color by creating a mark key that starts with '#'.
  for (const [key] of Object.entries(node)) {
    if (key.startsWith('#')) {
      migrated.color = key;
      break;
    }
  }

  return migrated;
};

const ensureNonEmptyInlineChildren = (children: any[]): any[] => {
  if (children.length === 0) return [{ text: '' }];
  return children;
};

const migrateInlineChildren = (children?: LegacyNode[]): any[] => {
  if (!children) return [{ text: '' }];
  const out: any[] = [];
  for (const child of children) {
    if (child && typeof child === 'object' && 'text' in child) {
      out.push(migrateLegacyText(child as LegacyText));
    } else if (child && typeof child === 'object' && 'type' in child) {
      const el = child as LegacyElement;
      if (el.type === FormatTypes.hyperlink && typeof el.url === 'string') {
        const link: MessageLinkElement = {
          type: 'a',
          url: el.url,
          children: ensureNonEmptyInlineChildren(migrateInlineChildren(el.children)),
        };
        out.push(link);
      } else {
        // Unexpected inline element: flatten into its children.
        out.push(...migrateInlineChildren(el.children));
      }
    }
  }
  return ensureNonEmptyInlineChildren(out);
};

type ListContext =
  | { kind: 'none' }
  | { kind: 'list'; listStyleType: 'disc' | 'decimal'; indent: number };

const migrateLegacyImage = (el: LegacyElement): MessageImageElement => {
  const imageName = typeof el.imageName === 'string' ? el.imageName : undefined;
  const imageSource = typeof el.imageSource === 'string' ? el.imageSource : '';
  const isEmbedded = imageSource.startsWith('data:image');

  const cid = imageName ? removeSpaces(removeAccents(imageName)) : undefined;
  const url = isEmbedded && cid ? `cid:${cid}` : imageSource;

  return {
    type: 'img',
    url,
    dataUrl: isEmbedded ? imageSource : undefined,
    filename: imageName,
    cid: isEmbedded ? cid : undefined,
    align: asAlignment(typeof el.align === 'string' ? el.align : undefined),
    width: typeof el.width === 'number' ? el.width : undefined,
    height: typeof el.height === 'number' ? el.height : undefined,
    children: [{ text: '' }],
  };
};

const migrateLegacyBlocks = (
  nodes: LegacyNode[],
  ctx: ListContext,
): any[] => {
  const out: any[] = [];

  console.log('ctx', nodes);

  for (const node of nodes) {
    if (!node || typeof node !== 'object') continue;

    // Text nodes at block level are unexpected, but keep them.
    if ('text' in node && typeof (node as any).text === 'string') {
      out.push({
        type: 'p',
        ...(ctx.kind === 'list'
          ? { indent: ctx.indent, listStyleType: ctx.listStyleType }
          : {}),
        children: [migrateLegacyText(node as LegacyText)],
      });
      continue;
    }

    const el = node as LegacyElement;
    const types = el.types;

    // Legacy list wrappers: recurse with list context.
    if (typesHas(types, FormatTypes.bulletedList)) {
      out.push(
        ...migrateLegacyBlocks(el.children ?? [], {
          kind: 'list',
          listStyleType: 'disc',
          indent: ctx.kind === 'list' ? ctx.indent : 1,
        }),
      );
      continue;
    }
    if (typesHas(types, FormatTypes.numberedList)) {
      out.push(
        ...migrateLegacyBlocks(el.children ?? [], {
          kind: 'list',
          listStyleType: 'decimal',
          indent: ctx.kind === 'list' ? ctx.indent : 1,
        }),
      );
      continue;
    }

    // Inline-only legacy nodes.
    if (el.type === FormatTypes.hyperlink && typeof el.url === 'string') {
      out.push({
        type: 'p',
        ...(ctx.kind === 'list'
          ? { indent: ctx.indent, listStyleType: ctx.listStyleType }
          : {}),
        children: [
          {
            type: 'a',
            url: el.url,
            children: ensureNonEmptyInlineChildren(migrateInlineChildren(el.children)),
          },
        ],
      });
      continue;
    }

    if (el.type === FormatTypes.image) {
      out.push(migrateLegacyImage(el));
      continue;
    }

    // Legacy list item: create a single list block + migrate nested lists (if any).
    if (typesHas(types, FormatTypes.listItem)) {
      const inlineChildren: LegacyNode[] = [];
      const nestedNodes: LegacyNode[] = [];
      for (const child of el.children ?? []) {
        if (
          child &&
          typeof child === 'object' &&
          'types' in (child as any) &&
          (typesHas((child as any).types, FormatTypes.bulletedList) ||
            typesHas((child as any).types, FormatTypes.numberedList))
        ) {
          nestedNodes.push(child);
        } else {
          inlineChildren.push(child);
        }
      }

      const listStyleType =
        ctx.kind === 'list' ? ctx.listStyleType : 'disc';
      const indent = ctx.kind === 'list' ? ctx.indent : 1;

      out.push({
        type: 'p',
        indent,
        listStyleType,
        children: migrateInlineChildren(inlineChildren),
      });

      if (nestedNodes.length) {
        out.push(
          ...migrateLegacyBlocks(nestedNodes, {
            kind: 'list',
            listStyleType,
            indent: indent + 1,
          }),
        );
      }

      continue;
    }

    // Normal block element.
    const blockTypes = Array.isArray(types) ? types : [];
    const align: MessageAlignment | undefined = (() => {
      if (blockTypes.includes(FormatTypes.alignCenter)) return 'center';
      if (blockTypes.includes(FormatTypes.alignRight)) return 'right';
      if (blockTypes.includes(FormatTypes.alignLeft)) return 'left';
      return undefined;
    })();

    const type: 'p' | 'h1' | 'h2' = (() => {
      if (blockTypes.includes(FormatTypes.headingOne)) return 'h1';
      if (blockTypes.includes(FormatTypes.headingTwo)) return 'h2';
      return 'p';
    })();

    out.push({
      type,
      ...(align ? { align } : {}),
      ...(ctx.kind === 'list'
        ? { indent: ctx.indent, listStyleType: ctx.listStyleType }
        : {}),
      children: migrateInlineChildren(el.children),
    });
  }

  return out.length ? out : [{ type: 'p', children: [{ text: '' }] }];
};

export const migrateLegacyMessageValueToV2Value = (legacyValue: unknown): Value => {
  if (!Array.isArray(legacyValue)) {
    return [{ type: 'p', children: [{ text: '' }] }];
  }
  return migrateLegacyBlocks(legacyValue as LegacyNode[], { kind: 'none' }) as Value;
};

