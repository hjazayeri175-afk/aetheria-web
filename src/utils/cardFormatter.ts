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
  // 1. Decode entities first so tags hidden behind &lt; &gt; are exposed to strip
  let str = decodeHtmlEntities(text);
  str = str
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\s*(script|style|iframe|object|embed)[\s\S]*?<\/\s*\1\s*>/gi, '')
    .replace(/<\s*(script|style|iframe|object|embed)[^>]*\/?>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|blockquote|section|article|tr)>/gi, '\n')
    .replace(/<[^>]+>/g, '');
  // 2. Second decode pass for double-encoded entities (&amp;lt;)
  if (str.includes('&')) {
    str = decodeHtmlEntities(str);
    str = str.replace(/<[^>]+>/g, '');
  }
  return str
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
/**
 * Universal tag-shielded rich text processor for Markdown + HTML content.
 * Protects existing HTML elements & attributes from regex collisions (quotes, asterisks, brackets),
 * while formatting markdown images, links, styles, and dialogue safely.
 */
function processRichContent(
  input: string, 
  mode: 'description' | 'greeting', 
  charName?: string
): string {
  if (!input || typeof input !== 'string') {
    return mode === 'greeting' ? '*Awaits your first message...*' : 'No detailed background provided.';
  }
  let text = input.trim();
  if (!text) {
    return mode === 'greeting' ? '*Awaits your first message...*' : 'No detailed background provided.';
  }

  // 1. Fully decode entities (up to 4 passes for nested entities)
  text = decodeHtmlEntities(text);

  // 2. Expand {{char}} and {{user}} macros if present
  if (charName) {
    text = text.replace(/\{\{char\}\}/gi, charName);
  } else {
    text = text.replace(/\{\{char\}\}/gi, 'Companion');
  }
  text = text.replace(/\{\{user\}\}/gi, 'You');

  // 3. Strip active dangerous scripts and event handlers (XSS prevention)
  text = text.replace(/<!--[\s\S]*?-->/g, '');
  text = text.replace(/<\s*(script|iframe|object|embed|meta|base|form|input|button)[\s\S]*?<\/\s*\1\s*>/gi, '');
  text = text.replace(/<\s*(script|iframe|object|embed|meta|base|form|input|button)[^>]*\/?>/gi, '');
  text = text.replace(/\son[a-z]+\s*=\s*(["'])[\s\S]*?\1/gi, '');
  text = text.replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, '');
  text = text.replace(/href\s*=\s*(["'])\s*javascript:[\s\S]*?\1/gi, 'href="#"');
  text = text.replace(/src\s*=\s*(["'])\s*javascript:[\s\S]*?\1/gi, 'src=""');

  // 4. Format/scope style blocks if present in Chub card skins
  text = text.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (_, css) => {
    let safeCss = css.replace(/@import\b[^;]*;/gi, '');
    safeCss = safeCss.replace(/\b(body|html|:root)\b/gi, '.card-rich-content');
    return `<style>${safeCss}</style>`;
  });

  // 5. Enhance existing <img> tags (responsive + lazy loading)
  text = text.replace(/<img\b([^>]*?)(\/?)>/gi, (_, attrs) => {
    let cleanAttrs = attrs.replace(/\/$/, '').trim();
    if (!cleanAttrs.includes('loading=')) cleanAttrs += ' loading="lazy"';
    if (!cleanAttrs.includes('class=')) cleanAttrs += ' class="max-w-full h-auto rounded-lg my-2 inline-block shadow-md"';
    return `<img ${cleanAttrs} />`;
  });

  // 6. Enhance existing <a> tags (open safely in new tab)
  text = text.replace(/<a\b([^>]*)>/gi, (_, attrs) => {
    if (!attrs.includes('target=')) attrs += ' target="_blank" rel="noopener noreferrer"';
    if (!attrs.includes('class=')) attrs += ' class="text-purple-400 hover:text-purple-300 underline underline-offset-2"';
    return `<a ${attrs.trim()}>`;
  });

  // 7. Tokenize / Mask ALL existing HTML tags so regexes never touch tag syntax or attribute quotes!
  const tokens: string[] = [];
  function addToken(html: string): string {
    tokens.push(html);
    return `\x00TOKEN_${tokens.length - 1}\x00`;
  }

  let masked = text.replace(/<[^>]+>/g, (tag) => addToken(tag));

  // 8. Markdown images: ![alt](url)
  masked = masked.replace(/!\[([^\]]*)\]\((https?:\/\/[^\s\)]+)\)/g, (_, alt, url) => {
    return addToken(`<img src="${url}" alt="${alt || 'Scene illustration'}" class="max-w-full h-auto rounded-lg my-2 inline-block shadow-md" loading="lazy" />`);
  });

  // Standalone image URLs on their own line: e.g. https://...png
  masked = masked.replace(/(^|\n)\s*(https?:\/\/\S+\.(?:png|jpe?g|webp|gif))(?:\s*($|\n))/gi, (_, p1, url, p2) => {
    return `${p1}${addToken(`<img src="${url}" alt="Illustration" class="max-w-full h-auto rounded-lg my-2 inline-block shadow-md" loading="lazy" />`)}${p2}`;
  });

  // 9. Markdown links: [text](url)
  masked = masked.replace(/\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g, (_, label, url) => {
    return addToken(`<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-purple-400 hover:text-purple-300 underline underline-offset-2">${label}</a>`);
  });

  // 10. Markdown inline code: `code`
  masked = masked.replace(/`([^`\n]+)`/g, (_, code) => {
    return addToken(`<span translate="yes" class="px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-purple-300 text-[11px] font-mono inline-block">${code}</span>`);
  });

  // 11. Markdown Headers & lists (for description mode)
  if (mode === 'description') {
    masked = masked.replace(/^### (.*$)/gim, (_, c) => addToken(`<h3 class="font-bold text-slate-900 dark:text-white text-sm my-2">${c}</h3>`));
    masked = masked.replace(/^## (.*$)/gim, (_, c) => addToken(`<h2 class="font-bold text-slate-900 dark:text-white text-sm sm:text-base my-2">${c}</h2>`));
    masked = masked.replace(/^# (.*$)/gim, (_, c) => addToken(`<h1 class="font-black text-slate-900 dark:text-white text-base my-2.5">${c}</h1>`));
    masked = masked.replace(/^[\*\-] (.*$)/gim, (_, c) => addToken(`<li class="leading-relaxed text-slate-800 dark:text-slate-200">${c}</li>`));
  }

  // 12. Markdown Bold: **text** or __text__
  masked = masked.replace(/\*\*([^\*\n]+)\*\*/g, (_, content) => {
    return addToken(`<strong class="text-slate-900 dark:text-white font-semibold">${content}</strong>`);
  });
  masked = masked.replace(/__([^_\n]+)__/g, (_, content) => {
    return addToken(`<strong class="text-slate-900 dark:text-white font-semibold">${content}</strong>`);
  });

  // 13. Markdown Strikethrough: ~~text~~
  masked = masked.replace(/~~([^~\n]+)~~/g, (_, content) => {
    return addToken(`<del class="text-slate-500 dark:text-slate-400 line-through">${content}</del>`);
  });

  // 14. Markdown Italics (actions / narration): *text* or _text_
  masked = masked.replace(/(^|[^\*])\*([^\*\n]+)\*([^\*]|$)/g, (_, p1, content, p2) => {
    const cls = mode === 'greeting' ? 'text-purple-700 dark:text-purple-300 italic' : 'text-purple-700 dark:text-purple-200/90 italic';
    return `${p1}${addToken(`<em class="${cls}">${content}</em>`)}${p2}`;
  });

  // 15. Dialogue Quotes (for greetings and story dialogue)
  if (mode === 'greeting') {
    masked = masked.replace(/"([^"\n]+)"/g, (_, speech) => {
      return addToken(`<span translate="yes" class="text-slate-900 dark:text-white font-medium">"${speech}"</span>`);
    });
    masked = masked.replace(/“([^”\n]+)”/g, (_, speech) => {
      return addToken(`<span translate="yes" class="text-slate-900 dark:text-white font-medium">“${speech}”</span>`);
    });
    masked = masked.replace(/«([^»\n]+)»/g, (_, speech) => {
      return addToken(`<span translate="yes" class="text-slate-900 dark:text-white font-medium">«${speech}»</span>`);
    });
  }

  // 16. Newlines / Paragraph handling
  const hasStructuralHtml = /<(?:p|div|table|ul|ol|h[1-6]|details|blockquote)\b/i.test(text);
  if (!hasStructuralHtml) {
    if (mode === 'description') {
      masked = masked
        .split(/\n{2,}/)
        .map(p => {
          const trimmed = p.trim();
          if (trimmed.includes('\x00TOKEN_') && tokens.some(t => t.startsWith('<li'))) {
            return `<ul class="list-disc list-inside space-y-1.5 my-2 text-slate-700 dark:text-slate-300">${trimmed}</ul>`;
          }
          return `<p class="mb-2.5 last:mb-0 leading-relaxed">${trimmed.replace(/\n/g, '<br/>')}</p>`;
        })
        .join('');
    } else {
      masked = masked.replace(/\n/g, '<br/>');
    }
  }

  // 17. Unmask all tokens
  const result = masked.replace(/\x00TOKEN_(\d+)\x00/g, (_, i) => tokens[Number(i)] || '');
  return result.trim();
}

/**
 * Sanitizes and renders rich character descriptions containing Tavern/Chub HTML layouts,
 * custom CSS skins, collapsible details/summaries, scenario grids, images, and Markdown.
 */
export function formatRichDescription(input: string, charName?: string): string {
  return processRichContent(input, 'description', charName);
}

/**
 * Formats character opening greetings with dialogue quotes, narrative italics, and macro expansions.
 */
export function formatRichGreeting(greeting: string, charName?: string): string {
  return processRichContent(greeting, 'greeting', charName);
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
  // 1. Fully decode entities (up to 4 passes for nested encoding like &amp;lt;)
  let str = decodeHtmlEntities(input);
  // 2. Convert closing block tags into periods to cleanly separate headings from body text
  str = str.replace(/<\/(?:h[1-6]|p|div|li|blockquote)>/gi, '. ').replace(/<br\s*\/?>/gi, '. ');
  // 3. Strip scripts, styles, comments, and all HTML/XML tags
  str = str.replace(/<script[\s\S]*?<\/script>/gi, ' ');
  str = str.replace(/<style[\s\S]*?<\/style>/gi, ' ');
  str = str.replace(/<!--[\s\S]*?-->/g, ' ');
  str = str.replace(/<\/?[a-zA-Z][^>]*>/g, ' ');
  str = str.replace(/<[^>]+>/g, ' ');
  // 4. Second decode & strip pass for double-encoded or hidden tags
  if (str.includes('&')) {
    str = decodeHtmlEntities(str);
    str = str.replace(/<\/?[a-zA-Z][^>]*>/g, ' ').replace(/<[^>]+>/g, ' ');
  }
  // 5. Strip Markdown formatting (# headings, **bold**, *italic*, `code`, [link](url))
  str = str.replace(/(^|\s)#{1,6}\s+/g, '$1');
  str = str.replace(/(\*\*|__)(.*?)\1/g, '$2');
  str = str.replace(/(\*|_)(.*?)\1/g, '$2');
  str = str.replace(/~~(.*?)~~/g, '$1');
  str = str.replace(/`([^`]+)`/g, '$1');
  str = str.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  str = str.replace(/(^|\s)>\s*/g, '$1');
  str = str.replace(/(^|\s)[-*+]\s+/g, '$1');
  // 6. Remove stray unclosed or dangling tag brackets
  str = str.replace(/<+[a-zA-Z0-9]*$/g, '');
  str = str.replace(/^>+/g, '');
  // 7. Normalize whitespace & strip newlines
  str = str.replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
  if (!str) return fallback;
  // 8. If creator stuffed a whole changelog or markdown article into title (> 75 chars)
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

/**
 * Fast blended token estimator for character cards.
 * Heuristic based on word count & character length (~3.8-4 chars per token).
 */
export function estimateTokens(text: string | undefined | null): number {
  if (!text || typeof text !== 'string') return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const words = trimmed.split(/\s+/).filter(Boolean).length;
  const chars = trimmed.length;
  return Math.max(1, Math.round((words * 1.2 + chars / 4) / 2));
}

/**
 * Filters out raw AI system prompts, roleplay constraints, and hidden model directives
 * from the public-facing description, while preserving character lore, backstory,
 * traits, and creator notes in full.
 */
export function cleanPublicDescription(rawDesc?: string | null, creatorNotes?: string | null): string {
  let desc = (rawDesc || '').trim();
  const notes = (creatorNotes || '').trim();

  // If creator notes exist and are not already part of the description, prepend them nicely
  if (notes && notes.length > 3) {
    const noteSnippet = notes.slice(0, 30);
    if (!desc.includes(noteSnippet)) {
      desc = desc ? `${notes}\n\n${desc}` : notes;
    }
  }

  // 1. Remove HTML system tags: <system>...</system>, <guidelines>...</guidelines>, etc.
  desc = desc.replace(/<\s*(?:system|guidelines|rules|instructions|behavior|prompt|formatting)[\s\S]*?<\/\s*(?:system|guidelines|rules|instructions|behavior|prompt|formatting)\s*>/gi, '');

  // 2. Remove pure system directives like [System: ...], [Guidelines: ...], [Rule: ...]
  desc = desc.replace(/\[\s*(?:System|Guidelines?|Rules?|Instructions?|Constraints?)[^\]]*\]/gi, '');

  // 3. Remove standard boilerplate model guardrails (strictly line-by-line, never eating character lore)
  desc = desc.replace(/^[ \t]*(?:Character\s+dialogue\s+and\s+)?(?:system(?:\s+instructions)?|roleplay\s+guidelines?|behavior\s+constraints?|formatting\s+rules?)[:\s]*$/gim, '');
  desc = desc.replace(/^[ \t]*[-*•]?\s*(?:(?:always\s+|never\s+)?(?:stay in character|respond in character|write in third person)|(?:do not|never|avoid|forbidden to)\s+(?:speak|narrate|act)\s+for\s+(?:\{\{user\}\}|the user|user))[^\n]*$/gim, '');

  // 4. Normalize whitespace
  desc = desc.replace(/[\r\n]{3,}/g, '\n\n').trim();

  return desc || notes || 'No detailed background provided.';
}

/**
 * Extracts structured definition components and token breakdown for Chub.ai style Definition tab.
 */
export function extractCardDefinition(char: any) {
  if (!char || typeof char !== 'object') {
    return {
      tokensTotal: 0,
      tokensPermanent: 0,
      tokensGreeting: 0,
      personality: '',
      scenario: '',
      systemPrompt: '',
      mesExample: '',
      greeting: '',
      creatorNotes: '',
      rawDesc: ''
    };
  }

  const personality = (char.personality || '').trim();
  const scenario = (char.scenario || '').trim();
  const systemPrompt = (char.systemPrompt || char.system_prompt || '').trim();
  const mesExample = (char.mesExample || char.mes_example || '').trim();
  const greeting = (char.greeting || char.first_mes || '').trim();
  const creatorNotes = (char.creator_notes || char.creatorNotes || '').trim();
  const rawDesc = (char.description || '').trim();

  const permanentText = [personality, scenario, systemPrompt].filter(Boolean).join('\n\n');
  const totalText = [rawDesc, permanentText, mesExample, greeting].filter(Boolean).join('\n\n');

  const tokensPermanent = estimateTokens(permanentText);
  const tokensGreeting = estimateTokens(greeting);
  const tokensTotal = estimateTokens(totalText);

  return {
    tokensTotal,
    tokensPermanent,
    tokensGreeting,
    personality,
    scenario,
    systemPrompt,
    mesExample,
    greeting,
    creatorNotes,
    rawDesc
  };
}

function parseRgbColor(colorStr: string | null | undefined): { r: number; g: number; b: number; a: number } | null {
  if (!colorStr) return null;
  const s = colorStr.trim().toLowerCase();
  if (s === 'transparent' || s === 'inherit' || s === 'initial' || s === 'unset') return null;

  if (s.startsWith('#')) {
    let hex = s.slice(1);
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    if (hex.length >= 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: 1
      };
    }
  }

  const match = s.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d\.]+))?\s*\)/);
  if (match) {
    return {
      r: parseInt(match[1], 10),
      g: parseInt(match[2], 10),
      b: parseInt(match[3], 10),
      a: match[4] !== undefined ? parseFloat(match[4]) : 1
    };
  }
  return null;
}

function calculateLuminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * Adaptive Contrast & Luminance Engine for Rich Character Content
 * Dynamically reconciles author skins, background images, and custom dark boxes in Day Mode.
 */
export function resolveAdaptiveContrast(container?: HTMLElement | null): void {
  if (!container || typeof window === 'undefined') return;

  const isDayMode = 
    document.documentElement.getAttribute('data-base-mode') === 'day' ||
    document.documentElement.classList.contains('day-mode');

  // If not Day mode (standard dark theme), revert day mode cleared styles
  if (!isDayMode) {
    const cleared = container.querySelectorAll('.day-mode-card-cleared');
    cleared.forEach((el: any) => {
      el.classList.remove('day-mode-card-cleared');
      if (el.dataset.origBg !== undefined) el.style.backgroundColor = el.dataset.origBg;
      if (el.dataset.origBorder !== undefined) el.style.borderColor = el.dataset.origBorder;
      if (el.dataset.origColor !== undefined) el.style.color = el.dataset.origColor;
    });
    const darkDetected = container.querySelectorAll('.dark-surface-detected, .light-surface-detected, [data-on-dark-surface], [data-has-bg-image]');
    darkDetected.forEach((el: any) => {
      el.classList.remove('dark-surface-detected', 'light-surface-detected');
      el.removeAttribute('data-on-dark-surface');
      el.removeAttribute('data-has-bg-image');
    });
    return;
  }

  // In Day Mode:
  // Phase 1: Detect <img> tags acting as full banners or absolute background illustrations
  const imgElements = Array.from(container.querySelectorAll('img')) as HTMLImageElement[];
  for (const img of imgElements) {
    const inline = img.getAttribute('style') || '';
    const imgStyle = window.getComputedStyle(img);
    const isAbsolute = 
      imgStyle.position === 'absolute' || 
      imgStyle.position === 'fixed' || 
      inline.includes('position: absolute') || 
      inline.includes('position:absolute');
    
    if (isAbsolute && img.parentElement) {
      img.parentElement.setAttribute('data-has-bg-image', 'true');
      img.parentElement.classList.add('dark-surface-detected');
      const childTexts = img.parentElement.querySelectorAll('p, li, div, span, strong, b, h1, h2, h3, h4, h5, h6, a');
      childTexts.forEach((c) => {
        c.classList.add('dark-surface-detected');
        c.setAttribute('data-on-dark-surface', 'true');
      });
    }
  }

  // Phase 2: Traverse elements for background-image, dark box backgrounds, or custom author skins
  const elements = Array.from(container.querySelectorAll('*')) as HTMLElement[];
  elements.unshift(container);

  for (const el of elements) {
    if (!el || !(el instanceof HTMLElement)) continue;

    // 1. Check for background image (in inline style or computedStyle)
    const inlineStyle = el.getAttribute('style') || '';
    const compStyle = window.getComputedStyle(el);
    const bgImg = el.style.backgroundImage || compStyle.backgroundImage || '';

    const hasBgImage = 
      /url\s*\(/i.test(bgImg) || 
      /\bbackground(?:-image)?\s*:[^;]*url\s*\(/i.test(inlineStyle);

    if (hasBgImage) {
      el.setAttribute('data-has-bg-image', 'true');
      el.classList.add('dark-surface-detected');
      el.classList.remove('light-surface-detected');

      // Mark all descendant text nodes with data-on-dark-surface="true"
      const descendants = el.querySelectorAll('p, li, div, span, strong, b, h1, h2, h3, h4, h5, h6, a');
      descendants.forEach((child) => {
        child.classList.add('dark-surface-detected');
        child.setAttribute('data-on-dark-surface', 'true');
      });

      // Extract URL for luminance measurement
      const match = bgImg.match(/url\(['"]?([^'"]+)['"]?\)/i) || inlineStyle.match(/url\(['"]?([^'"]+)['"]?\)/i);
      if (match && match[1]) {
        const url = match[1];
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              canvas.width = 16;
              canvas.height = 16;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0, 16, 16);
                const data = ctx.getImageData(0, 0, 16, 16).data;
                let totalLum = 0;
                let count = 0;
                for (let i = 0; i < data.length; i += 4) {
                  if (data[i + 3] < 32) continue;
                  totalLum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                  count++;
                }
                const avgLum = count > 0 ? totalLum / count : 0;
                if (avgLum >= 140) {
                  el.classList.remove('dark-surface-detected');
                  el.classList.add('light-surface-detected');
                  descendants.forEach((c) => c.removeAttribute('data-on-dark-surface'));
                } else {
                  el.classList.add('dark-surface-detected');
                  el.classList.remove('light-surface-detected');
                  descendants.forEach((c) => c.setAttribute('data-on-dark-surface', 'true'));
                }
              }
            } catch (e) {
              // CORS or tainted canvas -> keep dark-surface-detected for safe high contrast
              el.classList.add('dark-surface-detected');
              descendants.forEach((c) => c.setAttribute('data-on-dark-surface', 'true'));
            }
          };
          img.onerror = () => {
            el.classList.add('dark-surface-detected');
            descendants.forEach((c) => c.setAttribute('data-on-dark-surface', 'true'));
          };
          img.src = url;
        } catch (_) {
          el.classList.add('dark-surface-detected');
          descendants.forEach((c) => c.setAttribute('data-on-dark-surface', 'true'));
        }
      }
      continue;
    }

    // 2. If this element is inside an element with background image, mark and continue
    if (el.closest('.dark-surface-detected, [data-has-bg-image="true"], [data-on-dark-surface="true"]')) {
      el.classList.add('dark-surface-detected');
      el.setAttribute('data-on-dark-surface', 'true');
      continue;
    }

    // 3. Check for dark background colors WITHOUT background-image
    const inlineBg = el.style.backgroundColor || el.style.background || '';
    const compBg = compStyle.backgroundColor;
    const colorToTest = inlineBg || compBg;

    const parsed = parseRgbColor(colorToTest);
    if (parsed && parsed.a > 0.3) {
      const lum = calculateLuminance(parsed.r, parsed.g, parsed.b);
      // Dark box (Luminance < 110 out of 255)
      if (lum < 110) {
        if (el.dataset.origBg === undefined) el.dataset.origBg = el.style.backgroundColor || '';
        if (el.dataset.origBorder === undefined) el.dataset.origBorder = el.style.borderColor || '';
        if (el.dataset.origColor === undefined) el.dataset.origColor = el.style.color || '';

        el.classList.add('day-mode-card-cleared');
        el.style.backgroundColor = '#f8fafc';
        el.style.borderColor = '#cbd5e1';
        el.style.color = '#1e293b';
      }
    }
  }
}

if (typeof window !== 'undefined') {
  (window as any).sanitizeTitle = sanitizeTitle;
  (window as any).estimateTokens = estimateTokens;
  (window as any).cleanPublicDescription = cleanPublicDescription;
  (window as any).extractCardDefinition = extractCardDefinition;
  (window as any).resolveAdaptiveContrast = resolveAdaptiveContrast;
}
