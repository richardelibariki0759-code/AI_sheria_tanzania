import { Pipe, PipeTransform } from '@angular/core';

/**
 * Turns the small subset of Markdown the backend produces (**bold**,
 * *italic*, "- " / "1. " lists, blank-line paragraphs) into HTML.
 *
 * The input is HTML-escaped first, so this is safe to bind with
 * [innerHTML] — no raw tags from the bot or the user can get through,
 * only the <strong>/<em>/<ul>/<ol>/<li>/<p> tags this pipe adds itself.
 */
@Pipe({
  name: 'markdownLite',
  standalone: true
})
export class MarkdownLitePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }

    const escaped = value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const lines = escaped.split(/\r?\n/);
    const htmlParts: string[] = [];

    let listItems: string[] = [];
    let listType: 'ul' | 'ol' | null = null;

    const flushList = () => {
      if (listItems.length && listType) {
        htmlParts.push(`<${listType}>${listItems.join('')}</${listType}>`);
      }
      listItems = [];
      listType = null;
    };

    for (const rawLine of lines) {
      const line = rawLine.trim();

      if (!line) {
        flushList();
        continue;
      }

      const bulletMatch = line.match(/^[-*•‣▪]\s+(.*)$/);
      const numberedMatch = line.match(/^\(?\d+[.)]\s+(.*)$/);

      if (bulletMatch) {
        if (listType !== 'ul') {
          flushList();
          listType = 'ul';
        }
        listItems.push(`<li>${this.inline(bulletMatch[1])}</li>`);
        continue;
      }

      if (numberedMatch) {
        if (listType !== 'ol') {
          flushList();
          listType = 'ol';
        }
        listItems.push(`<li>${this.inline(numberedMatch[1])}</li>`);
        continue;
      }

      flushList();
      htmlParts.push(`<p>${this.inline(line)}</p>`);
    }

    flushList();
    return htmlParts.join('');
  }

  private inline(text: string): string {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>');
  }
}
