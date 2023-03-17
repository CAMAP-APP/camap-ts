import { Element, Node, Transforms } from 'slate';
import { jsx } from 'slate-hyperscript';
import FormatTypes, { CustomEditor, CustomSlateDescendant } from './TextEditorFormatType';

type SourceDocumentType = 'google-doc' | 'libre-office' | 'ms-word' | 'other';

const PARAGRAPH_TYPE = { types: [FormatTypes.paragraph] };
const HEADING_TWO_TYPE = { types: [FormatTypes.headingTwo] };

const ELEMENT_TAGS = {
  A: (el: HTMLElement) => ({ type: FormatTypes.hyperlink, url: el.getAttribute('href') }),
  H1: () => ({ types: [FormatTypes.headingOne] }),
  H2: () => ({ types: [FormatTypes.headingTwo] }),
  IMG: (el: HTMLElement) => ({ type: FormatTypes.image, imageSource: el.getAttribute('src') }),
  LI: () => ({ types: [FormatTypes.listItem] }),
  OL: () => ({ types: [FormatTypes.numberedList] }),
  P: () => PARAGRAPH_TYPE,
  UL: () => ({ types: [FormatTypes.bulletedList] }),

  // The following are not handled by our message editor
  H3: () => HEADING_TWO_TYPE,
  H4: () => HEADING_TWO_TYPE,
  H5: () => HEADING_TWO_TYPE,
  H6: () => HEADING_TWO_TYPE,
  PRE: () => PARAGRAPH_TYPE,
  BLOCKQUOTE: () => PARAGRAPH_TYPE,
};

const TEXT_TAGS = {
  EM: () => ({ italic: true }),
  I: () => ({ italic: true }),
  STRONG: () => ({ bold: true }),
  B: () => ({ bold: true }),
  U: () => ({ underline: true }),
};

const hasImageNode = (el: HTMLElement | ChildNode) =>
  Array.from(el.childNodes).findIndex((n: ChildNode) => {
    return n.nodeName === 'IMG';
  }) !== -1;

const deserialize = (
  el: HTMLElement,
  sourceDocumentType: SourceDocumentType,
  recursiveLevel = 0,
): Node | string | null | (Node | string | null)[] => {
  if (el.nodeName.startsWith('#') && el.textContent && /^\n+\t*$/gm.test(el.textContent)) return null;
  if (el.nodeType === 3) {
    if (sourceDocumentType === 'libre-office') {
      // Libre Office adds newline and tabs in the middle of text node
      return el.textContent && el.textContent.replace(/\n/, ' ').replace(/\t/, ' ');
    }
    return el.textContent;
  }
  if (el.nodeType !== 1) return null;
  if (el.nodeName === 'BR') {
    if (sourceDocumentType === 'google-doc') return null; // Ignore BR in Google Doc
    return '\n';
  }
  if (sourceDocumentType === 'other' && el.textContent === '') {
    if (!(hasImageNode(el) || el.nodeName === 'IMG')) {
      return null;
    }
  }

  const { nodeName } = el;

  let children = Array.from(el.childNodes)
    .map((c) => deserialize(c as HTMLElement, sourceDocumentType, recursiveLevel + 1))
    .flat();

  if (children.length === 0) children = [jsx('text', {}, '')];

  if (children.length && children[0] !== null && (children[0] as Element).type === FormatTypes.image) return children;

  if (ELEMENT_TAGS[nodeName]) {
    let attrs = ELEMENT_TAGS[nodeName](el);
    const style = el.getAttribute('style');
    if (style?.includes('text-align: center') || style?.includes('text-align:center')) {
      attrs = { ...attrs, types: [...attrs.types, FormatTypes.alignCenter] };
    } else if (style?.includes('text-align: right') || style?.includes('text-align:right')) {
      attrs = { ...attrs, types: [...attrs.types, FormatTypes.alignRight] };
    } else {
      // We might find an align attribute with Libre Office
      const alignAttribute = el.getAttribute('align');
      if (alignAttribute === 'center') {
        attrs = { ...attrs, types: [...attrs.types, FormatTypes.alignCenter] };
      } else if (alignAttribute === 'right') {
        attrs = { ...attrs, types: [...attrs.types, FormatTypes.alignRight] };
      }
    }
    if (attrs.types && attrs.types.length > 1 && attrs.types.includes(FormatTypes.paragraph)) {
      attrs.types.splice(attrs.types.indexOf(FormatTypes.paragraph), 1);
    }
    if (sourceDocumentType === 'libre-office' && nodeName === 'LI') {
      if (
        children.length &&
        children[0] &&
        (children[0] as Element).children &&
        (children[0] as Element).children.length &&
        'text' in (children[0] as Element).children[0]
      ) {
        const textDescendant = (children[0] as Element).children[0] as CustomSlateDescendant;
        ((children[0] as Element).children[0] as CustomSlateDescendant).text = (textDescendant.text as string).trim();
      }
    }
    if (sourceDocumentType === 'libre-office' && nodeName === 'P') {
      const parent = el.parentNode;
      if (parent?.nodeName === 'LI') {
        // Libre Office uses P insides LI but we don't want them because
        // user agents add vertical margins in P that we don't want
        return children;
      }
    }
    return jsx('element', attrs, children);
  }

  if (TEXT_TAGS[nodeName]) {
    // B tag in Google Doc is omitted here because Google Docs uses `<b>` in weird ways.
    if (!(nodeName === 'B' && sourceDocumentType === 'google-doc')) {
      const attrs = TEXT_TAGS[nodeName](el);
      return children.map((child) => {
        if (child && typeof child !== 'string' && 'type' in child && child.type !== 'text') {
          return child;
        }
        return jsx('text', attrs, child);
      });
    }
  }

  // Google Doc
  if (sourceDocumentType === 'google-doc' && nodeName === 'SPAN') {
    const style = el.getAttribute('style');
    let attrs = {};
    if (style?.includes('font-style:italic')) {
      const italicAttr = TEXT_TAGS.I();
      attrs = { ...attrs, ...italicAttr };
    }
    if (style?.includes('font-weight:700')) {
      const boldAttr = TEXT_TAGS.STRONG();
      attrs = { ...attrs, ...boldAttr };
    }
    if (style?.includes('text-decoration:underline')) {
      const underlineAttr = TEXT_TAGS.U();
      attrs = { ...attrs, ...underlineAttr };
    }

    if (style?.includes('font-size:26pt')) {
      attrs = { ...attrs, types: [FormatTypes.headingOne] };
      return jsx('element', attrs, children);
    }

    if (Object.keys(attrs).length) return children.map((child) => jsx('text', attrs, child));
  }

  // Libre Office
  if (sourceDocumentType === 'libre-office' && nodeName === 'FONT') {
    const style = el.getAttribute('style');
    let attrs = {};
    if (style?.includes('font-size: 28pt')) {
      attrs = { ...attrs, types: [FormatTypes.headingOne] };
      return jsx('element', attrs, children);
    }
  }

  // Other
  if (sourceDocumentType === 'other' && (nodeName === 'DIV' || (nodeName === 'SPAN' && recursiveLevel === 0))) {
    let attrs = PARAGRAPH_TYPE;
    const style = el.getAttribute('style');
    if (style?.includes('text-align: center') || style?.includes('text-align:center')) {
      attrs = { ...attrs, types: [...attrs.types, FormatTypes.alignCenter] };
    } else if (style?.includes('text-align: right') || style?.includes('text-align:right')) {
      attrs = { ...attrs, types: [...attrs.types, FormatTypes.alignRight] };
    }
    return jsx('element', attrs, children);
  }

  return children;
};

const findNodesList = (el: ChildNode): NodeListOf<ChildNode> => {
  const nodeList = el.childNodes;
  if (nodeList.length === 1 && nodeList[0].nodeName === 'DIV') {
    return findNodesList(nodeList[0]);
  }
  return nodeList;
};

const deserializeBody = (body: HTMLBodyElement, sourceDocumentType: SourceDocumentType): Node[] => {
  const bodyChildren = findNodesList(body);
  const children = Array.from(bodyChildren)
    .map((c) => deserialize(c as HTMLElement, sourceDocumentType))
    .flat()
    .filter((c) => c !== null);
  return jsx('fragment', {}, children);
};

const getSourceDocumentType = (data: DataTransfer, html: HTMLDocument): SourceDocumentType => {
  const isGoogle = data.types.findIndex((t) => t.startsWith('application/x-vnd.google')) !== -1;
  if (isGoogle) return 'google-doc';

  const headChildren = Array.from(html.head.children);
  const isLibreOffice =
    headChildren.findIndex((c) => {
      if (c.nodeName !== 'META') return false;
      return (c as HTMLMetaElement).content.includes('LibreOffice');
    }) !== -1;
  if (isLibreOffice) return 'libre-office';

  const isMsWord =
    headChildren.findIndex((c) => {
      if (c.nodeName !== 'META') return false;
      return (c as HTMLMetaElement).content.includes('Microsoft Word');
    }) !== -1;
  if (isMsWord) return 'ms-word';

  return 'other';
};

const withHtml = (editor: CustomEditor) => {
  const e = editor;
  const { insertData } = editor;

  e.insertData = (data) => {
    if (data.types.includes('application/x-slate-fragment')) {
      insertData(data);
      return;
    }

    const html = data.getData('text/html');

    if (html) {
      const parsed = new DOMParser().parseFromString(html, 'text/html');

      const appleInterchangeNewlines = parsed.getElementsByClassName('Apple-interchange-newline');
      Array.from(appleInterchangeNewlines).forEach((appleInterchangeNewline) => {
        appleInterchangeNewline.remove();
      });

      const childToBeRemoved: ChildNode[] = [];
      const cleanBody = parsed.body;
      cleanBody.childNodes.forEach((c) => {
        if (c.textContent === '' && !hasImageNode(c)) {
          childToBeRemoved.push(c);
        }
      });
      childToBeRemoved.forEach((c) => c.remove());

      const sourceDocumentType: SourceDocumentType = getSourceDocumentType(data, parsed);
      let fragment = deserializeBody(cleanBody as HTMLBodyElement, sourceDocumentType);

      if (
        fragment.length === 1 &&
        'children' in fragment[0] &&
        'type' in fragment[0] &&
        fragment[0].type !== FormatTypes.image
      ) {
        fragment = fragment[0].children;
      }

      Transforms.insertFragment(e, fragment);

      return;
    }

    insertData(data);
  };

  return editor;
};

export default withHtml;
