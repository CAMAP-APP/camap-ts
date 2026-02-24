import { AutoformatRule } from "@platejs/autoformat";
import { SlateEditor, TRange } from "platejs";
import { upsertLink } from "@platejs/link";

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const URL_WITH_ALLOWED_SCHEME_REGEX = /^(?:https?:\/\/|mailto:|tel:)/i;
const URL_DOMAIN_REGEX =
    /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+(?::\d{2,5})?(?:[/?#][^\s]*)?$/i;

const getAutoLinkHref = (token: string): string | null => {
    if (EMAIL_REGEX.test(token)) return `mailto:${token}`;

    if (URL_WITH_ALLOWED_SCHEME_REGEX.test(token)) return token;
    if (/^www\./i.test(token)) return `https://${token}`;
    if (URL_DOMAIN_REGEX.test(token)) return `https://${token}`;

    return null;
};

const getLastTokenBeforeCursor = (
    editor: SlateEditor,
): { token: string; range: TRange } | null => {
    const selection = editor.selection;
    if (!selection || !editor.api.isCollapsed()) return null;

    const fromBlockStart = editor.api.range('start', selection);
    if (!fromBlockStart) return null;

    const textBeforeCursor = editor.api.string(fromBlockStart);
    const rawToken = textBeforeCursor.match(/(?:^|\s)(\S+)$/)?.[1];
    if (!rawToken) return null;

    // Allow leading punctuation like "(https://...)" without including it in the link.
    const token = rawToken.replace(/^[([{<"'`]+/, '');
    if (!token || !rawToken.endsWith(token)) return null;

    const anchor = editor.api.before(selection, {
        matchString: token,
        skipInvalid: true,
    });
    if (!anchor) return null;

    const range: TRange = { anchor, focus: selection.anchor };
    if (editor.api.string(range) !== token) return null;

    return { token, range };
};

const autoformatAutoLinkRule: AutoformatRule = {
    mode: 'text',
    match: '',
    insertTrigger: true,
    trigger: [
        ' ',
        '\n',
        '\t',
        '.',
        ',',
        ';',
        ':',
        '!',
        '?',
        ')',
        ']',
        '}',
        '"',
        "'",
    ],
    query: (editor, { text }) => {
        if (!text) return false;

        const info = getLastTokenBeforeCursor(editor);
        if (!info) return false;

        const href = getAutoLinkHref(info.token);
        if (!href) return false;

        // Avoid wrapping links inside links.
        if (editor.api.some({ at: info.range, match: { type: 'a' } })) return false;

        return true;
    },
    format: (editor) => {
        const info = getLastTokenBeforeCursor(editor);
        if (!info) return;

        const href = getAutoLinkHref(info.token);
        if (!href) return;

        if (editor.api.some({ at: info.range, match: { type: 'a' } })) return;

        editor.tf.select(info.range);
        console.log('upsertLink', info.token, href);
        console.log(editor.children)
        upsertLink(editor, { text: info.token, url: href });
        console.log(editor.children)
        editor.tf.collapse({ edge: 'end' });
    },
};

export const autoformatRules = [autoformatAutoLinkRule];