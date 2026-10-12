/**
 * cardFormatter.ts
 * High-fidelity sanitizer and rich text formatter for Tavern / Chub character cards,
 * lore backgrounds, greetings, and AI prompt assembly.
 */

/**
 * Strips all HTML tags, comments, styles, scripts, and entities to produce clean plain text
 * for LLM system prompt assembly, image generation prompts, and short card snippets.
 */
export function stripHtmlForPrompt(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\s*(script|style|iframe|object|embed)[\s\S]*?<\/\s*\1\s*>/gi, '')
    .replace(/<\s*(script|style|iframe|object|embed)[^>]*\/?>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|blockquote|section|article)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Safely renders rich character descriptions containing Tavern/Chub HTML skins,
 * scenario lists, headings, images, or Markdown formatting into clean Aetheria UI.
 */
export function formatRichDescription(input: string): string {
  if (!input || typeof input !== 'string') return 'No detailed background provided.';
  let text = input.trim();
  if (!text) return 'No detailed background provided.';

  // 1. Strip comments & dangerous tags
  text = text.replace(/<!--[\s\S]*?-->/g, '');
  text = text.replace(/<\s*(script|style|iframe|object|embed|meta|link|svg|math)[\s\S]*?<\/\s*\1\s*>/gi, '');
  text = text.replace(/<\s*(script|style|iframe|object|embed|meta|link|svg|math)[^>]*\/?>/gi, '');
  text = text.replace(/\son[a-z]+\s*=\s*(["\'])[\s\S]*?\1/gi, '');
  text = text.replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, '');
  text = text.replace(/href\s*=\s*(["\'])\s*javascript:[\s\S]*?\1/gi, 'href="#"');

  // 2. Strip empty divs & replace center
  text = text.replace(/<div\b[^>]*>\s*<\/div>/gi, '');
  text = text.replace(/<center\b[^>]*>/gi, '<div class="text-center my-2.5">').replace(/<\/center>/gi, '</div>');
  // Strip outer / wrapper Chub skins that break theme layouts
  text = text.replace(/<div\b[^>]*>/gi, '').replace(/<\/div>/gi, '');

  const hasHtml = /<\/?([a-z][a-z0-9]*)\b[^>]*>/i.test(text);

  if (hasHtml) {
    // Images
    text = text.replace(/<img\b([^>]*)>/gi, (match, attrs) => {
      const srcMatch = attrs.match(/src=(["'])(.*?)\1/i);
      if (!srcMatch) return '';
      const src = srcMatch[2];
      return `<img src="${src}" class="max-h-56 w-auto max-w-full rounded-xl object-cover my-2.5 mx-auto border border-white/10 shadow-lg" loading="lazy" />`;
    });

    // Links
    text = text.replace(/<a\b([^>]*)>/gi, (match, attrs) => {
      const hrefMatch = attrs.match(/href=(["'])(.*?)\1/i);
      const href = hrefMatch ? hrefMatch[2] : '#';
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-purple-400 hover:text-purple-300 underline underline-offset-2">`;
    });

    // Headings
    text = text.replace(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi, (match, lvl, c) => {
      return `<h${lvl} class="font-bold text-white text-sm sm:text-base my-2 tracking-tight">${c.trim()}</h${lvl}>`;
    });

    // Lists & formatting
    text = text.replace(/<ol\b[^>]*>/gi, '<ol class="list-decimal list-inside space-y-1.5 my-2 text-slate-300">');
    text = text.replace(/<ul\b[^>]*>/gi, '<ul class="list-disc list-inside space-y-1.5 my-2 text-slate-300">');
    text = text.replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, '<li class="leading-relaxed">$1</li>');
    text = text.replace(/<p\b[^>]*>([\s\S]*?)<\/p>/gi, '<p class="mb-2 last:mb-0 leading-relaxed">$1</p>');
    text = text.replace(/<b\b[^>]*>([\s\S]*?)<\/b>/gi, '<strong class="font-semibold text-white">$1</strong>');
    text = text.replace(/<strong\b[^>]*>([\s\S]*?)<\/strong>/gi, '<strong class="font-semibold text-white">$1</strong>');
    text = text.replace(/<i\b[^>]*>([\s\S]*?)<\/i>/gi, '<em class="text-purple-200/90 italic">$1</em>');
    text = text.replace(/<em\b[^>]*>([\s\S]*?)<\/em>/gi, '<em class="text-purple-200/90 italic">$1</em>');
  }

  // Markdown inline formatting
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>');
  text = text.replace(/__([^_]+)__/g, '<strong class="font-semibold text-white">$1</strong>');
  text = text.replace(/(^|[^\*<])\*([^\*\n<]+)\*([^\*>]|$)/g, '$1<em class="text-purple-200/90 italic">$2</em>$3');
  text = text.replace(/`([^`\n]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-purple-300 text-[11px] font-mono">$1</code>');

  // Markdown block formatting if no HTML tags were present
  if (!hasHtml) {
    text = text.replace(/^### (.*$)/gim, '<h3 class="font-bold text-white text-sm my-2">$1</h3>');
    text = text.replace(/^## (.*$)/gim, '<h2 class="font-bold text-white text-sm sm:text-base my-2">$1</h2>');
    text = text.replace(/^# (.*$)/gim, '<h1 class="font-black text-white text-base my-2.5">$1</h1>');
    text = text.replace(/^[\*\-] (.*$)/gim, '<li class="leading-relaxed">$1</li>');

    text = text
      .split(/\n{2,}/)
      .map(p => {
        const trimmed = p.trim();
        if (trimmed.startsWith('<li')) {
          return `<ul class="list-disc list-inside space-y-1.5 my-2 text-slate-300">${trimmed}</ul>`;
        }
        return `<p class="mb-2.5 last:mb-0 leading-relaxed">${trimmed.replace(/\n/g, '<br/>')}</p>`;
      })
      .join('');

    // Unwrap block elements from <p>
    text = text.replace(/<p[^>]*>\s*(<h[1-6][^>]*>.*?<\/h[1-6]>)\s*(?:<br\/?>)?/gi, '$1<p class="mb-2 last:mb-0 leading-relaxed">');
    text = text.replace(/<p[^>]*>\s*(<ul[^>]*>[\s\S]*?<\/ul>)\s*(?:<br\/?>)?/gi, '$1<p class="mb-2 last:mb-0 leading-relaxed">');
    text = text.replace(/<p[^>]*>\s*<\/p>/gi, '');
  }

  return text.trim();
}

/**
 * Formats character greetings with evocative narrative styling:
 * *Action narrative* in italic purple serif and "Dialogue" in bright white.
 */
export function formatRichGreeting(input: string): string {
  if (!input || typeof input !== 'string') return '*Awaits your first message...*';
  let text = input.trim();
  if (!text) return '*Awaits your first message...*';

  text = text.replace(/<!--[\s\S]*?-->/g, '');
  text = text.replace(/<\s*(script|style|iframe)[^>]*>[\s\S]*?<\/\s*\1\s*>/gi, '');
  text = text.replace(/<[^>]+>/g, '');

  // 1. Dialogue in bright white
  text = text.replace(/"([^"\n]+)"/g, '___DIAL_START___$1___DIAL_END___');
  text = text.replace(/“([^”\n]+)”/g, '___DIAL_START___$1___DIAL_END___');

  // 2. Action narrative in italic purple
  text = text.replace(/\*([^\*\n]+)\*/g, '<em class="text-purple-300/90 italic font-serif">$1</em>');

  // 3. Restore dialogue
  text = text.replace(/___DIAL_START___(.*?)___DIAL_END___/g, '<span class="text-white font-medium">&ldquo;$1&rdquo;</span>');

  return text
    .split(/\n{2,}/)
    .map(p => `<p class="mb-2 last:mb-0 leading-relaxed">${p.replace(/\n/g, '<br/>')}</p>`)
    .join('');
}

// Global exposure for non-bundled inline scripts
if (typeof window !== 'undefined') {
  (window as any).formatRichDescription = formatRichDescription;
  (window as any).formatRichGreeting = formatRichGreeting;
  (window as any).stripHtmlForPrompt = stripHtmlForPrompt;
}
