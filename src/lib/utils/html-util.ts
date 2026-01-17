/**
 * Normalizes HTML content by removing styling, decorative elements, and navigation
 * Useful for preparing HTML content for AI processing or clean text extraction
 */
export function normalizeHtml(html: string): string {
  let normalized = html;

  normalized = normalized.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  normalized = normalized.replace(/\s+style="[^"]*"/gi, '');
  normalized = normalized.replace(/\s+style='[^']*'/gi, '');
  normalized = normalized.replace(/<\/?span[^>]*>/gi, '');
  normalized = normalized.replace(/<\/?font[^>]*>/gi, '');

  const decorativePatterns = [
    /Plan de cours/gi,
    /Version PDF/gi,
    /Imprimer/gi,
    /Retour/gi,
    /Haut de page/gi,
    / École de technologie supérieure/gi,
  ];

  decorativePatterns.forEach((pattern) => {
    normalized = normalized.replace(pattern, '');
  });

  normalized = normalized.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '');
  normalized = normalized.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '');
  normalized = normalized.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '');
  normalized = normalized.replace(/Tous droits réservés[\s\S]*$/gi, '');
  normalized = normalized.replace(/<br\s*\/?>/gi, '\n');
  normalized = normalized.replace(/<li[^>]*>/gi, '• ');
  normalized = normalized.replace(/<\/li>/gi, '\n');
  normalized = normalized.replace(/<\/ul>/gi, '\n');
  normalized = normalized.replace(/<\/ol>/gi, '\n');
  normalized = normalized.replace(/<ul[^>]*>/gi, '');
  normalized = normalized.replace(/<ol[^>]*>/gi, '');
  normalized = normalized.replace(/\n{3,}/g, '\n\n');
  normalized = normalized.trim();

  return normalized;
}
