/**
 * Universal Client-Side HTML Sanitizer
 * Defensively cleans rich text HTML before rendering in dangerouslySetInnerHTML
 */

const BLOCKED_TAGS = ['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'FORM', 'INPUT', 'BUTTON', 'TEXTAREA', 'SVG'];

const DISALLOWED_SCHEMES = ['javascript:', 'vbscript:', 'data:', 'file:', 'about:'];

export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) {
    return '';
  }

  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    // Basic regex fallback if executed outside browser
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/\son\w+\s*=\s*(['"]).*?\1/gi, '')
      .replace(/\son\w+\s*=\s*[^>\s]+/gi, '');
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Recursively clean nodes
    function cleanNode(node: Node) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const tagName = el.tagName.toUpperCase();

        if (BLOCKED_TAGS.includes(tagName)) {
          el.remove();
          return;
        }

        // Clean attributes
        const attributesToRemove: string[] = [];
        for (let i = 0; i < el.attributes.length; i++) {
          const attr = el.attributes[i];
          const name = attr.name.toLowerCase();
          const value = attr.value.trim().toLowerCase();

          // Strip event handlers (e.g. onclick, onerror)
          if (name.startsWith('on')) {
            attributesToRemove.push(attr.name);
            continue;
          }

          // Strip unsafe URL protocols in href / src
          if (name === 'href' || name === 'src') {
            for (const scheme of DISALLOWED_SCHEMES) {
              if (value.startsWith(scheme)) {
                attributesToRemove.push(attr.name);
                break;
              }
            }
          }
        }

        for (const attrName of attributesToRemove) {
          el.removeAttribute(attrName);
        }
      }

      // Process children
      const children = Array.from(node.childNodes);
      for (const child of children) {
        cleanNode(child);
      }
    }

    cleanNode(doc.body);
    return doc.body.innerHTML;
  } catch {
    // If parsing fails, return plain text
    return html.replace(/<[^>]*>/g, '');
  }
}
