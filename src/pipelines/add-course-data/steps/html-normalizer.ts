/**
 * Normalize and clean HTML content from PlanETS before AI parsing
 *
 * This function removes styling/decorative elements and normalizes formatting
 * to help the AI parser focus on actual course content.
 */
export function normalizeHtml(html: string): string {
    let normalized = html;

    // 1. Remove styling tags and their contents
    normalized = normalized.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

    // 2. Remove inline styles from all tags
    normalized = normalized.replace(/\s+style="[^"]*"/gi, '');
    normalized = normalized.replace(/\s+style='[^']*'/gi, '');

    // 3. Remove span tags but keep content
    normalized = normalized.replace(/<\/?span[^>]*>/gi, '');

    // 4. Remove font tags but keep content
    normalized = normalized.replace(/<\/?font[^>]*>/gi, '');

    // 5. Remove common decorative/navigation text patterns
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

    // 6. Remove navigation elements
    normalized = normalized.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '');
    normalized = normalized.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '');
    normalized = normalized.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '');

    // 7. Remove common disclaimer/legal text patterns (greedy)
    normalized = normalized.replace(/Tous droits réservés[\s\S]*$/gi, '');

    // 8. Normalize <br> tags to consistent line breaks
    normalized = normalized.replace(/<br\s*\/?>/gi, '\n');

    // 9. Normalize list items - convert to bullet fragments
    normalized = normalized.replace(/<li[^>]*>/gi, '• ');
    normalized = normalized.replace(/<\/li>/gi, '\n');

    // 10. Clean up multiple consecutive spaces/tabs
    normalized = normalized.replace(/[ \t]+/g, ' ');

    // 11. Clean up excessive newlines (keep max 2)
    normalized = normalized.replace(/\n{3,}/g, '\n\n');

    // 12. Trim whitespace from each line
    normalized = normalized
        .split('\n')
        .map(line => line.trim())
        .join('\n');

    // 13. Remove leading/trailing whitespace
    normalized = normalized.trim();

    return normalized;
}
