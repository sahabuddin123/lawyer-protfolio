export function resolveLocalized(text: any, locale: string = 'en'): string {
  if (!text) return '';
  if (typeof text === 'string') return text;
  if (typeof text === 'object') {
    return text[locale] || text.en || text.bn || Object.values(text)[0] || '';
  }
  return String(text);
}
