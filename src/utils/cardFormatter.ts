/**
 * cardFormatter.ts
 * High-fidelity rich text renderer and sanitizer for Tavern / Chub character cards,
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
    .replace(/<\/(p|div|h[1-6]|li|blockquote|section|article|tr)>/gi, '\n')
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
 * Fully decodes HTML entities (including single, double, triple escaped entities
 * like &amp;lt;, &lt;, &#60;, &#x3C;) so that character cards imported from Chub,
 * Tavern, or external JSONs parse as real DOM nodes rather than plain text code.
 */
export function decodeHtmlEntities(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';
  let str = raw;

  // 1. Recursive entity replacement pass (up to 4 iterations for deeply nested entity escaping)
  for (let i = 0; i < 4; i++) {
    if (!str.includes('&')) break;
    const prev = str;
    str = str
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&#x27;/gi, "'")
      .replace(/&#x2F;/gi, '/')
      .replace(/&#60;/gi, '<')
      .replace(/&#62;/gi, '>')
      .replace(/&#34;/gi, '"')
      .replace(/&#38;/gi, '&');
    if (str === prev) break;
  }

  // 2. Browser native textarea fallback if entity markers remain
  if (typeof document !== 'undefined' && str.includes('&')) {
    try {
      const txt = document.createElement('textarea');
      txt.innerHTML = str;
      if (txt.value && txt.value !== str) {
        str = txt.value;
      }
    } catch {}
  }

  return str;
}

/**
 * Sanitizes and renders rich character descriptions containing Tavern/Chub HTML layouts,
 * custom CSS skins, collapsible details/summaries, scenario grids, images, and Markdown.
 *
 * PRESERVES all structural and presentation tags (div, span, details, summary, style,
 * center, table, lists, headings, img, b, i, p, etc.) and author styles while stripping
 * XSS vectors (script, on* handlers, javascript:).
 */
export function formatRichDescription(input: string): string {
  if (!input || typeof input !== 'string') return 'No detailed background provided.';
  let text = input.trim();
  if (!text) return 'No detailed background provided.';

  // 0. Fully decode single, double, and triple escaped entities (&amp;lt; -> &lt; -> <)
  text = decodeHtmlEntities(text);

  // 1. Remove dangerous active scripts and external embed tags (XSS prevention)
  text = text.replace(/<!--[\s\S]*?-->/g, '');
  text = text.replace(/<\s*(script|iframe|object|embed|meta|base|form|input|button)[\s\S]*?<\/\s*\1\s*>/gi, '');
  text = text.replace(/<\s*(script|iframe|object|embed|meta|base|form|input|button)[^>]*\/?>/gi, '');

  // 2. Remove inline event handlers (onclick, onload, onerror, etc.)
  text = text.replace(/\son[a-z]+\s*=\s*(["\'])[\s\S]*?\1/gi, '');
  text = text.replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, '');

  // 3. Neutralize javascript: pseudo-protocol in URLs
  text = text.replace(/href\s*=\s*(["\'])\s*javascript:[\s\S]*?\1/gi, 'href="#"');
  text = text.replace(/src\s*=\s*(["\'])\s*javascript:[\s\S]*?\1/gi, 'src=""');

  // 4. Safely scope and sanitize <style> blocks if present in Chub card skins
  // Keeps creator styles and custom classes, but scopes global html/body rules
  text = text.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (match, css) => {
    // Strip @import to prevent external style injection
    let safeCss = css.replace(/@import\b[^;]*;/gi, '');
    // Scope global body/html rules to .card-rich-content
    safeCss = safeCss.replace(/\b(body|html|:root)\b/gi, '.card-rich-content');
    return `<style>${safeCss}</style>`;
  });

  // 5. Ensure responsive image safety without breaking author's layout
  text = text.replace(/<img\b([^>]*)>/gi, (match, attrs) => {
    if (!attrs.includes('loading=')) {
      attrs += ' loading="lazy"';
    }
    if (!attrs.includes('class=')) {
      attrs += ' class="max-w-full h-auto rounded-lg my-2 inline-block shadow-md"';
    }
    return `<img ${attrs.trim()}>`;
  });

  // 6. Ensure external links open safely in a new tab
  text = text.replace(/<a\b([^>]*)>/gi, (match, attrs) => {
    if (!attrs.includes('target=')) {
      attrs += ' target="_blank" rel="noopener noreferrer"';
    }
    if (!attrs.includes('class=')) {
      attrs += ' class="text-purple-400 hover:text-purple-300 underline underline-offset-2"';
    }
    return `<a ${attrs.trim()}>`;
  });

  const hasHtml = /<\/?([a-z][a-z0-9]*)\b[^>]*>/i.test(text);

  // 7. Inline markdown formatting (support mixed markdown and HTML)
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>');
  text = text.replace(/__([^_]+)__/g, '<strong class="font-semibold text-white">$1</strong>');
  text = text.replace(/(^|[^\*<])\*([^\*\n<]+)\*([^\*>]|$)/g, '$1<em class="text-purple-200/90 italic">$2</em>$3');
  text = text.replace(/`([^`\n]+)`/g, '<span translate="yes" class="px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-purple-300 text-[11px] font-mono inline-block">$1</span>');

  // 8. If text is pure markdown (no HTML structure tags), convert headers and lists
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
  }

  return text.trim();
}

/**
 * Formats character opening greetings with dialogue quotes, narrative italics, and macro expansions.
 */
export function formatRichGreeting(greeting: string): string {
  if (!greeting || typeof greeting !== 'string') return '*Awaits your first message...*';
  let text = greeting.trim();

  // 0. Fully decode entities
  text = decodeHtmlEntities(text);

  // Strip dangerous scripts
  text = text.replace(/<\s*(script|iframe|object|embed)[\s\S]*?<\/\s*\1\s*>/gi, '');
  text = text.replace(/\son[a-z]+\s*=\s*(["\'])[\s\S]*?\1/gi, '');

  const hasHtml = /<\/?([a-z][a-z0-9]*)\b[^>]*>/i.test(text);

  // Markdown italics for actions/narration: *action* -> <em ...>
  text = text.replace(/(^|[^\*<])\*([^\*\n<]+)\*([^\*>]|$)/g, '$1<em class="text-purple-300 italic">$2</em>$3');
  text = text.replace(/\*\*([^\*\n<]+)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');

  // Quoted dialogue: "speech" -> highlight speech
  text = text.replace(/"([^"\n]+)"/g, '<span translate="yes" class="text-white font-medium">"$1"</span>');
  text = text.replace(/“([^”\n]+)”/g, '<span translate="yes" class="text-white font-medium">“$1”</span>');
  text = text.replace(/«([^»\n]+)»/g, '<span translate="yes" class="text-white font-medium">«$1»</span>');

  if (!hasHtml) {
    text = text.replace(/\n/g, '<br/>');
  }

  return text;
}

// Global exposure for non-bundled inline scripts
if (typeof window !== 'undefined') {
  (window as any).formatRichDescription = formatRichDescription;
  (window as any).formatRichGreeting = formatRichGreeting;
  (window as any).stripHtmlForPrompt = stripHtmlForPrompt;
}

/**
 * Sanitizes character titles/taglines to ensure they remain clean, short, single-line
 * presentation labels without raw HTML tags, unparsed markdown, or excessive author notes.
 */
export function sanitizeTitle(input: string | undefined | null, fallback = 'Custom Companion'): string {
  if (!input || typeof input !== 'string') return fallback;
  // 1. Fully decode entities
  let str = decodeHtmlEntities(input);
  // 2. Strip HTML tags completely
  str = str.replace(/<[^>]+>/g, ' ');
  // 3. Normalize whitespace & strip newlines
  str = str.replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
  if (!str) return fallback;
  // 4. If creator stuffed a whole changelog or markdown article into title (> 75 chars)
  if (str.length > 75) {
    const parts = str.split(/[.!?,;\n]/);
    const candidate = parts[0]?.trim();
    if (candidate && candidate.length >= 3 && candidate.length <= 65) {
      return candidate;
    }
    return str.slice(0, 60).trim() + '...';
  }
  return str;
}

if (typeof window !== 'undefined') {
  (window as any).sanitizeTitle = sanitizeTitle;
}
