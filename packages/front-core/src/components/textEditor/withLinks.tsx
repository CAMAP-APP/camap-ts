import { isFinishedUrl, isUrl, URL_PATTERN } from '@utils/url';
import { containsEmail, CONTAINS_EMAIL_REGEX } from 'camap-common';
import { BaseRange, Editor, Location, Node, NodeEntry, Path, Range, Transforms } from 'slate';
import FormatTypes, { CustomEditor } from './TextEditorFormatType';

const isLinkActive = (editor: CustomEditor) => {
  const [link] = Editor.nodes(editor, {
    match: (n) => { // will be called with all nodes in current path
      console.log('node', n);
      return 'type' in n && n.type === FormatTypes.hyperlink
    },
  });
  return !!link;
};

const unwrapLink = (editor: CustomEditor) => {
  Transforms.unwrapNodes(editor, {
    match: (n) => 'type' in n && n.type === FormatTypes.hyperlink,
  });
};

const wrapLink = (editor: CustomEditor, url: string, linkLocation?: Location, text?: string) => {
  if (isLinkActive(editor)) {
    console.log("we have a link, unwrapping");
    unwrapLink(editor);
  }

  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const link = {
    type: FormatTypes.hyperlink,
    url,
    children: isCollapsed ? [{ text: text || url }] : [],
  };

  if (isCollapsed) {
    Transforms.insertNodes(editor, link, { at: linkLocation });
  } else {
    Transforms.wrapNodes(editor, link, { split: true, at: linkLocation });
    Transforms.collapse(editor, { edge: 'end' });
  }
};

const wrapEmail = (editor: CustomEditor, email: string, location: BaseRange) => {
  wrapLink(editor, `mailto:${email}`, location, email);
};

const withLinks = (editor: CustomEditor) => {
  const e = editor;
  const { insertData, insertText, isInline, normalizeNode } = e;

  let isWrapingNodeEntry: NodeEntry<Node> | undefined;

  e.isInline = (element) => {
    return element.type === FormatTypes.hyperlink ? true : isInline(element);
  };

  e.insertText = (text) => {
    console.log('insertText', text);
    if (text && isUrl(text) || isLinkActive(e)) {
      wrapLink(e, text);
    } else {
      insertText(text);
    }
  };

  e.insertData = (data) => {
    console.log('insertData', data);
    const text = data.getData('text/plain');
    const trimmedText = text && text.trim();
    if (trimmedText && isUrl(trimmedText)) {
      wrapLink(e, trimmedText);
    } else {
      insertData(data);
    }
  };

  e.normalizeNode = (entry: NodeEntry) => {
    const node: Node = entry[0];
    if ('text' in node && node.text) {
      const { text } = node;
      if (
        !(
          isWrapingNodeEntry &&
          'text' in isWrapingNodeEntry[0] &&
          (isWrapingNodeEntry[0].text?.trim() === text ||
            isWrapingNodeEntry[0].text?.trim() === text.trim())
        )
      ) {
        if (text && isFinishedUrl(text)) {
          const url = text.match(URL_PATTERN)![0];

          isWrapingNodeEntry = entry;

          const entryPath: Path = entry[1];
          const startIndexOfUrl = text.indexOf(url);
          const endIndexOfUrl = startIndexOfUrl + url.length;

          wrapLink(e, url, {
            focus: { offset: endIndexOfUrl, path: entryPath },
            anchor: { offset: startIndexOfUrl, path: entryPath },
          });
          // Transforms.setSelection(e, sel);

          return;
        }
        if (text && !text.includes('"')) {
          // containsEmail lags exponentially when the text contains a double quote '"'
          // hence we don't call it that's the case
          if (containsEmail(text)) {
            const email = text.match(CONTAINS_EMAIL_REGEX)![0];

            isWrapingNodeEntry = entry;

            const entryPath: Path = entry[1];

            const startIndexOfUrl = text.indexOf(email);
            const endIndexOfUrl = startIndexOfUrl + email.length;

            wrapEmail(e, email, {
              focus: { offset: endIndexOfUrl, path: entryPath },
              anchor: { offset: startIndexOfUrl, path: entryPath },
            });

            return;
          }
        } else {
          isWrapingNodeEntry = undefined;
        }
      } else {
        isWrapingNodeEntry = undefined;
      }
    }
    normalizeNode(entry);
  };

  return e;
};

export default withLinks;
