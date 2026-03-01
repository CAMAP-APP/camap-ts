export const isEmptyEmailHtml = (html: string): boolean => {
  if (!html) return true;

  // If the message contains at least one image, consider it non-empty.
  if (/<img\b/i.test(html)) return false;

  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const text = (doc.body.textContent ?? '')
      .replace(/\u00A0/g, ' ')
      .trim();
    return text.length === 0;
  } catch {
    // Conservative fallback: if we can't parse, only treat whitespace-only as empty.
    return html.replace(/\s+/g, '').length === 0;
  }
};

