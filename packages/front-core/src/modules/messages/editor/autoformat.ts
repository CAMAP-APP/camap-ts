import { AutoformatRule } from "@platejs/autoformat";
import { SlateEditor, TRange } from "platejs";
import { upsertLink } from "@platejs/link";

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

const TRAILING_LINK_PUNCTUATION_REGEX = /[),.;:!?\]"'}>]+$/;

const getAutoLinkHref = (token: string): string | null => {
    if (EMAIL_REGEX.test(token)) return `mailto:${token}`;

    return null;
};

const isValidHref = (href: string): boolean => {
    try {
        // eslint-disable-next-line no-new
        new URL(href);
        return true;
    } catch {
        return false;
    }
};

const getAutoLinkInfo = (
    editor: SlateEditor,
): { token: string; href: string; range: TRange } | null => {
    const selection = editor.selection;
    if (!selection || !editor.api.isCollapsed()) return null;

    const fromBlockStart = editor.api.range('start', selection);
    if (!fromBlockStart) return null;

    const textBeforeCursor = editor.api.string(fromBlockStart);
    const rawToken = textBeforeCursor.match(/(?:^|\s)(\S+)$/)?.[1];
    if (!rawToken) return null;

    // Allow leading punctuation like "(https://...)" without including it in the link.
    const withoutLeadingPunctuation = rawToken.replace(/^[([{<"'`]+/, '');
    if (!withoutLeadingPunctuation) return null;

    // Often the trigger character (".", ")", ",", etc.) is appended to the token. If we include it,
    // we may produce an invalid URL and the Link plugin will normalize it away.
    let token = withoutLeadingPunctuation;
    let href: string | null = null;

    // Try progressively stripping trailing punctuation until we get a valid-looking href.
    // (E.g. "https://example.com)." -> "https://example.com")
    // Keep at least 1 character to avoid infinite loops on punctuation-only tokens.
    while (token.length > 0) {
        const candidateHref = getAutoLinkHref(token);
        if (candidateHref && isValidHref(candidateHref)) {
            href = candidateHref;
            break;
        }

        const nextToken = token.replace(TRAILING_LINK_PUNCTUATION_REGEX, '');
        if (nextToken === token) break;
        token = nextToken;
    }

    if (!href) return null;

    const anchor = editor.api.before(selection, {
        matchString: token,
        skipInvalid: true,
    });
    if (!anchor) return null;

    // If we stripped trailing punctuation, only wrap the actual token, not the punctuation.
    const trailingCount = withoutLeadingPunctuation.length - token.length;
    const focus =
        trailingCount > 0
            ? editor.api.before(selection.anchor, {
                distance: trailingCount,
                unit: 'character',
            }) ?? selection.anchor
            : selection.anchor;

    const range: TRange = { anchor, focus };
    if (editor.api.string(range) !== token) return null;

    return { token, href, range };
};

const autoformatAutoEmail: AutoformatRule = {
    mode: 'text',
    match: '',
    insertTrigger: true,
    trigger: [
        ' ',
        '\n',
        '\t'
    ],
    query: (editor, { text }) => {
        if (!text) return false;

        const info = getAutoLinkInfo(editor);
        if (!info) return false;

        // Avoid wrapping links inside links.
        if (editor.api.some({ at: info.range, match: { type: 'a' } })) return false;

        return true;
    },
    format: (editor) => {
        const info = getAutoLinkInfo(editor);
        if (!info) return;

        if (editor.api.some({ at: info.range, match: { type: 'a' } })) return;

        editor.tf.select(info.range);
        upsertLink(editor, { text: info.token, url: info.href });
        editor.tf.collapse({ edge: 'end' });
    },
};

export const autoformatRules = [autoformatAutoEmail];