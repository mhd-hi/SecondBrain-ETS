import { describe, expect, it } from 'vitest';
import { normalizeHtml } from '@/lib/utils/html-util';

describe('normalizeHtml', () => {
  it('removes <style> blocks and style attributes', () => {
    const input = `
      <div>
        <style>.a{color:red}</style>
        <p style="color:blue">Hello <span style='font-weight:700'>World</span></p>
      </div>
    `;

    const out = normalizeHtml(input);

    expect(out).not.toContain('<style>');
    expect(out).not.toContain('style="');
    expect(out).not.toContain('style=\'');
    expect(out).toContain('<div>');
    expect(out).toContain('<p>');
    expect(out).toContain('Hello World');
  });

  it('removes span and font tags and decorative phrases', () => {
    const input = `<div><span>Keep</span><font>F</font> Plan de cours Version PDF Imprimer</div>`;
    const out = normalizeHtml(input);

    expect(out).not.toMatch(/Plan de cours/i);
    expect(out).not.toMatch(/Version PDF/i);
    expect(out).not.toMatch(/Imprimer/i);
    // tags removed but content kept
    expect(out).toContain('Keep');
    expect(out).toContain('F');
  });

  it('removes nav/footer/header and trailing legal text', () => {
    const input = `
      <nav><a href="#">x</a></nav>
      <header>H</header>
      <p>Body</p>
      <footer>F</footer>
      Some content Tous droits réservés Confidential
    `;
    const out = normalizeHtml(input);

    expect(out).not.toContain('<nav');
    expect(out).not.toContain('<header');
    expect(out).not.toContain('<footer');
    // 'Tous droits réservés' and following content removed
    expect(out).not.toMatch(/Tous droits réservés/i);
    expect(out).toContain('Body');
  });

  it('converts <br> to newlines and <li> to bullets and collapses extra newlines', () => {
    const input = `
      <ul>
        <li>One</li>
        <li>Two</li>
      </ul>
      <br/><br>
      <ol><li>A</li><li>B</li></ol>
    `;

    const out = normalizeHtml(input);

    // bullets and newline separation
    expect(out).toContain('• One');
    expect(out).toContain('• Two');
    expect(out).toContain('• A');
    expect(out).toContain('• B');
    // No excessive 3+ consecutive newlines
    expect(out).not.toMatch(/\n{3,}/);
  });

  it('trims whitespace and normalizes multiple style blocks', () => {
    const input = ` <style>h1{}</style>\n\n\n<style>.x{}</style> <p> ok </p> `;
    const out = normalizeHtml(input);

    expect(out).toBe('<p> ok </p>');
  });

  it('removes decorative phrases including accented school name and navigation labels', () => {
    const input = `
      <div>Plan de cours Version PDF Imprimer Retour Haut de page  École de technologie supérieure</div>
    `;
    const out = normalizeHtml(input);

    expect(out).not.toMatch(/Plan de cours/i);
    expect(out).not.toMatch(/Version PDF/i);
    expect(out).not.toMatch(/Imprimer/i);
    expect(out).not.toMatch(/Retour/i);
    expect(out).not.toMatch(/Haut de page/i);
    expect(out).not.toMatch(/École de technologie supérieure/i);
  });

  it('handles uppercase STYLE attributes and preserves anchors outside nav', () => {
    const input = `
      <nav><a href="#">navlink</a></nav>
      <p STYLE="color:red" style='font-weight:700'>Text <a href="#">keep-link</a></p>
    `;
    const out = normalizeHtml(input);

    // nav removed
    expect(out).not.toContain('navlink');
    // style attributes removed and anchor in paragraph preserved
    expect(out).toContain('Text');
    expect(out).toContain('keep-link');
    expect(out).not.toMatch(/style=/i);
  });

  it('removes span and font tags even when they have attributes', () => {
    const input = `<div><span class="s">A</span><font size="3">B</font></div>`;
    const out = normalizeHtml(input);

    expect(out).toContain('A');
    expect(out).toContain('B');
    // tags removed
    expect(out).not.toMatch(/<span/i);
    expect(out).not.toMatch(/<font/i);
  });
});
