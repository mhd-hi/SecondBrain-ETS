/**
 * Normalizes HTML content by removing styling, decorative elements, and navigation
 * Useful for preparing HTML content for AI processing or clean text extraction
 */
export function normalizeHtml(html: string): string {
  let normalized = html;

  normalized = normalized.replaceAll(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  normalized = normalized.replaceAll(/\s+style="[^"]*"/gi, '');
  normalized = normalized.replaceAll(/\s+style='[^']*'/gi, '');
  normalized = normalized.replaceAll(/<\/?span[^>]*>/gi, '');
  normalized = normalized.replaceAll(/<\/?font[^>]*>/gi, '');

  const decorativePatterns = [
    /Plan de cours/gi,
    /Version PDF/gi,
    /Imprimer/gi,
    /Retour/gi,
    /Haut de page/gi,
    / École de technologie supérieure/gi,
  ];

  decorativePatterns.forEach((pattern) => {
    normalized = normalized.replaceAll(pattern, '');
  });

  normalized = normalized.replaceAll(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '');
  normalized = normalized.replaceAll(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '');
  normalized = normalized.replaceAll(/<header[^>]*>[\s\S]*?<\/header>/gi, '');
  normalized = normalized.replaceAll(/Tous droits réservés[\s\S]*$/gi, '');
  normalized = normalized.replaceAll(/<br\s*\/?>/gi, '\n');
  normalized = normalized.replaceAll(/<li[^>]*>/gi, '• ');
  normalized = normalized.replaceAll(/<\/li>/gi, '\n');
  normalized = normalized.replaceAll(/<\/ul>/gi, '\n');
  normalized = normalized.replaceAll(/<\/ol>/gi, '\n');
  normalized = normalized.replaceAll(/<ul[^>]*>/gi, '');
  normalized = normalized.replaceAll(/<ol[^>]*>/gi, '');
  normalized = normalized.replaceAll(/\n{3,}/g, '\n\n');
  normalized = normalized.trim();

  return normalized;
}
