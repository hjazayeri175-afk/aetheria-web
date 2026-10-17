export interface WallpaperScene {
  id: string;
  value: string;
}

export interface WallpaperPattern {
  id: string;
  gradient: string;
  patternId: string;
  patternOpacity: number;
}

export interface ColorMeshGradient {
  id: string;
  value: string;
}

export interface SolidDarkTone {
  id: string;
  value: string;
}

export interface DoodlePatternItem {
  id: string;
  name: string;
  pattern: string;
  patternSize: string;
}

export const DOODLE_PATTERNS: Record<string, DoodlePatternItem> = {
  'none': { id: 'none', name: 'None', pattern: 'none', patternSize: 'auto' },
  'pattern-amore': {
    id: 'pattern-amore',
    name: 'Geometric Hearts',
    pattern: 'url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2290%22%20height%3D%2290%22%20viewBox%3D%220%200%2090%2090%22%20fill%3D%22none%22%20stroke%3D%22rgba%28255%2C255%2C255%2C0.4%29%22%20stroke-width%3D%221.2%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%20%3C%21--%20Heart%201%20--%3E%20%3Cpath%20d%3D%22M25%2035%20C15%2022%202%2032%2012%2045%20L25%2056%20L38%2045%20C48%2032%2035%2022%2025%2035%20Z%22%20/%3E%20%3C%21--%20Star%20dot%20--%3E%20%3Ccircle%20cx%3D%2270%22%20cy%3D%2220%22%20r%3D%221.5%22%20fill%3D%22rgba%28255%2C255%2C255%2C0.6%29%22%20/%3E%20%3C%21--%20Small%20Heart%202%20--%3E%20%3Cpath%20d%3D%22M70%2065%20C64%2056%2055%2062%2061%2070%20L70%2077%20L79%2070%20C85%2062%2076%2056%2070%2065%20Z%22%20stroke-width%3D%221%22%20/%3E%20%3C%21--%20Constellation%20spark%20--%3E%20%3Cpath%20d%3D%22M20%2075%20L23%2078%20L20%2081%20L17%2078%20Z%22%20fill%3D%22rgba%28255%2C255%2C255%2C0.5%29%22%20/%3E%20%3Cpath%20d%3D%22M72%2015%20L72%2025%20M67%2020%20L77%2020%22%20stroke-width%3D%220.8%22%20/%3E%20%3C%21--%20Soft%20connecting%20line%20--%3E%20%3Cpath%20d%3D%22M38%2045%20Q%2055%2035%2067%2020%22%20stroke-dasharray%3D%222%203%22%20stroke-width%3D%220.8%22%20stroke%3D%22rgba%28255%2C255%2C255%2C0.2%29%22%20/%3E%20%3C/svg%3E")',
    patternSize: '90px 90px'
  },
  'pattern-gamer': {
    id: 'pattern-gamer',
    name: 'Cyber Grid & D-Pad',
    pattern: 'url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2280%22%20height%3D%2280%22%20viewBox%3D%220%200%2080%2080%22%20fill%3D%22none%22%20stroke%3D%22rgba%28255%2C255%2C255%2C0.35%29%22%20stroke-width%3D%221.1%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%20%3C%21--%20Cyber%20Circuit%20Grid%20--%3E%20%3Cpath%20d%3D%22M0%2040%20H25%20L35%2030%20H55%20L65%2040%20H80%22%20/%3E%20%3Cpath%20d%3D%22M40%200%20V20%20L30%2030%22%20/%3E%20%3Cpath%20d%3D%22M50%2050%20L60%2060%20V80%22%20/%3E%20%3C%21--%20D-Pad%20cross%20--%3E%20%3Cpath%20d%3D%22M18%2014%20H22%20V18%20H26%20V22%20H22%20V26%20H18%20V22%20H14%20V18%20H18%20Z%22%20/%3E%20%3C%21--%20Action%20buttons%20--%3E%20%3Ccircle%20cx%3D%2262%22%20cy%3D%2218%22%20r%3D%222.5%22%20fill%3D%22rgba%28255%2C255%2C255%2C0.5%29%22%20/%3E%20%3Ccircle%20cx%3D%2268%22%20cy%3D%2224%22%20r%3D%222.5%22%20/%3E%20%3C%21--%20Pixel%20spark%20--%3E%20%3Crect%20x%3D%2225%22%20y%3D%2260%22%20width%3D%224%22%20height%3D%224%22%20fill%3D%22rgba%28255%2C255%2C255%2C0.4%29%22%20/%3E%20%3Crect%20x%3D%2235%22%20y%3D%2268%22%20width%3D%223%22%20height%3D%223%22%20fill%3D%22rgba%28255%2C255%2C255%2C0.3%29%22%20/%3E%20%3C%21--%20Connection%20node%20--%3E%20%3Ccircle%20cx%3D%2225%22%20cy%3D%2240%22%20r%3D%222%22%20fill%3D%22rgba%28255%2C255%2C255%2C0.5%29%22%20/%3E%20%3Ccircle%20cx%3D%2265%22%20cy%3D%2240%22%20r%3D%222%22%20fill%3D%22rgba%28255%2C255%2C255%2C0.5%29%22%20/%3E%20%3C/svg%3E")',
    patternSize: '80px 80px'
  },
  'pattern-coffee': {
    id: 'pattern-coffee',
    name: 'Artisan Cafe Doodles',
    pattern: 'url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2290%22%20height%3D%2290%22%20viewBox%3D%220%200%2090%2090%22%20fill%3D%22none%22%20stroke%3D%22rgba%28255%2C255%2C255%2C0.38%29%22%20stroke-width%3D%221.2%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%20%3C%21--%20Coffee%20Bean%201%20--%3E%20%3Cellipse%20cx%3D%2222%22%20cy%3D%2224%22%20rx%3D%2210%22%20ry%3D%2214%22%20transform%3D%22rotate%28-30%2022%2024%29%22%20/%3E%20%3Cpath%20d%3D%22M16%2014%20Q%2024%2024%2016%2034%22%20stroke-width%3D%221%22%20/%3E%20%3C%21--%20Cup%20with%20Steam%20--%3E%20%3Cpath%20d%3D%22M60%2055%20H78%20C78%2066%2070%2072%2060%2072%20C50%2072%2042%2066%2042%2055%20H60%20Z%22%20/%3E%20%3Cpath%20d%3D%22M78%2058%20H84%20C87%2058%2087%2066%2084%2066%20H76%22%20/%3E%20%3C%21--%20Steam%20curves%20--%3E%20%3Cpath%20d%3D%22M52%2048%20Q%2050%2042%2054%2036%22%20stroke-width%3D%221%22%20/%3E%20%3Cpath%20d%3D%22M62%2048%20Q%2064%2040%2060%2034%22%20stroke-width%3D%221%22%20/%3E%20%3C%21--%20Chemex%20outline%20--%3E%20%3Cpath%20d%3D%22M64%2012%20H76%20L70%2020%20L76%2028%20H64%20L70%2020%20Z%22%20stroke-width%3D%221%22%20/%3E%20%3C%21--%20Coffee%20Bean%202%20--%3E%20%3Cellipse%20cx%3D%2228%22%20cy%3D%2270%22%20rx%3D%228%22%20ry%3D%2211%22%20transform%3D%22rotate%2840%2028%2070%29%22%20/%3E%20%3Cpath%20d%3D%22M24%2064%20Q%2031%2070%2026%2078%22%20stroke-width%3D%220.9%22%20/%3E%20%3C/svg%3E")',
    patternSize: '90px 90px'
  },
  'pattern-power': {
    id: 'pattern-power',
    name: 'Kinetic Energy Bolts',
    pattern: 'url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2280%22%20height%3D%2280%22%20viewBox%3D%220%200%2080%2080%22%20fill%3D%22none%22%20stroke%3D%22rgba%28255%2C255%2C255%2C0.4%29%22%20stroke-width%3D%221.2%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%20%3C%21--%20Main%20Lightning%20Bolt%20--%3E%20%3Cpolygon%20points%3D%2226%2C10%2014%2C38%2028%2C38%2018%2C70%2046%2C32%2032%2C32%22%20/%3E%20%3C%21--%20Pulse%20Wave%20--%3E%20%3Cpath%20d%3D%22M50%2020%20L55%2020%20L58%2014%20L62%2026%20L66%2018%20L70%2022%20L75%2022%22%20stroke-width%3D%221.1%22%20/%3E%20%3C%21--%20Spark%20particles%20--%3E%20%3Ccircle%20cx%3D%2264%22%20cy%3D%2252%22%20r%3D%222%22%20fill%3D%22rgba%28255%2C255%2C255%2C0.6%29%22%20/%3E%20%3Ccircle%20cx%3D%2256%22%20cy%3D%2262%22%20r%3D%221.5%22%20fill%3D%22rgba%28255%2C255%2C255%2C0.4%29%22%20/%3E%20%3Cpath%20d%3D%22M68%2045%20L72%2045%20M70%2043%20L70%2047%22%20stroke-width%3D%221%22%20/%3E%20%3C%21--%20Small%20secondary%20bolt%20--%3E%20%3Cpolygon%20points%3D%2268%2C66%2062%2C74%2067%2C74%2063%2C82%2073%2C72%2068%2C72%22%20stroke-width%3D%220.9%22%20/%3E%20%3C/svg%3E")',
    patternSize: '80px 80px'
  },
  'pattern-winter': {
    id: 'pattern-winter',
    name: 'Nordic Frost & Pine',
    pattern: 'url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2290%22%20height%3D%2290%22%20viewBox%3D%220%200%2090%2090%22%20fill%3D%22none%22%20stroke%3D%22rgba%28255%2C255%2C255%2C0.38%29%22%20stroke-width%3D%221.1%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%20%3C%21--%206-Point%20Snowflake%20--%3E%20%3Cpath%20d%3D%22M25%2015%20V35%20M15%2025%20H35%20M18%2018%20L32%2032%20M32%2018%20L18%2032%22%20/%3E%20%3Ccircle%20cx%3D%2225%22%20cy%3D%2225%22%20r%3D%221.5%22%20fill%3D%22rgba%28255%2C255%2C255%2C0.7%29%22%20/%3E%20%3C%21--%20Pine%20Tree%20Silhouette%20--%3E%20%3Cpath%20d%3D%22M68%2045%20L78%2058%20H72%20L82%2072%20H54%20L64%2058%20H58%20Z%22%20stroke-width%3D%221.1%22%20/%3E%20%3Cline%20x1%3D%2268%22%20y1%3D%2272%22%20x2%3D%2268%22%20y2%3D%2278%22%20stroke-width%3D%221.5%22%20/%3E%20%3C%21--%20Tiny%20snowflake%20--%3E%20%3Cpath%20d%3D%22M68%2018%20V28%20M63%2023%20H73%22%20stroke-width%3D%220.9%22%20/%3E%20%3C%21--%20Frost%20star%20dots%20--%3E%20%3Ccircle%20cx%3D%2245%22%20cy%3D%2240%22%20r%3D%221.2%22%20fill%3D%22rgba%28255%2C255%2C255%2C0.5%29%22%20/%3E%20%3Ccircle%20cx%3D%2220%22%20cy%3D%2265%22%20r%3D%221.5%22%20fill%3D%22rgba%28255%2C255%2C255%2C0.4%29%22%20/%3E%20%3Ccircle%20cx%3D%2235%22%20cy%3D%2280%22%20r%3D%221%22%20fill%3D%22rgba%28255%2C255%2C255%2C0.5%29%22%20/%3E%20%3C/svg%3E")',
    patternSize: '90px 90px'
  },
  'pattern-ocean': {
    id: 'pattern-ocean',
    name: 'Bioluminescent Deep Reef',
    pattern: 'url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2290%22%20height%3D%2290%22%20viewBox%3D%220%200%2090%2090%22%20fill%3D%22none%22%20stroke%3D%22rgba%28255%2C255%2C255%2C0.38%29%22%20stroke-width%3D%221.2%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%20%3C%21--%20Ocean%20Sine%20Wave%201%20--%3E%20%3Cpath%20d%3D%22M0%2030%20C15%2020%2C%2030%2040%2C%2045%2030%20C60%2020%2C%2075%2040%2C%2090%2030%22%20/%3E%20%3C%21--%20Ocean%20Sine%20Wave%202%20--%3E%20%3Cpath%20d%3D%22M0%2065%20C15%2055%2C%2030%2075%2C%2045%2065%20C60%2055%2C%2075%2075%2C%2090%2065%22%20stroke-dasharray%3D%223%203%22%20stroke-width%3D%220.9%22%20/%3E%20%3C%21--%20Scallop%20Seashell%20--%3E%20%3Cpath%20d%3D%22M25%2045%20C15%2045%2C%2012%2055%2C%2025%2060%20C38%2055%2C%2035%2045%2C%2025%2045%20Z%22%20stroke-width%3D%221%22%20/%3E%20%3Cpath%20d%3D%22M25%2045%20L25%2060%20M20%2047%20L23%2059%20M30%2047%20L27%2059%22%20stroke-width%3D%220.8%22%20/%3E%20%3C%21--%20Oxygen%20Bubble%20clusters%20--%3E%20%3Ccircle%20cx%3D%2268%22%20cy%3D%2218%22%20r%3D%223%22%20/%3E%20%3Ccircle%20cx%3D%2274%22%20cy%3D%2212%22%20r%3D%221.5%22%20/%3E%20%3Ccircle%20cx%3D%2260%22%20cy%3D%2222%22%20r%3D%222%22%20/%3E%20%3Ccircle%20cx%3D%2270%22%20cy%3D%2248%22%20r%3D%222.5%22%20/%3E%20%3Ccircle%20cx%3D%2278%22%20cy%3D%2252%22%20r%3D%221.5%22%20/%3E%20%3C/svg%3E")',
    patternSize: '90px 90px'
  },
  'pattern-sunset': {
    id: 'pattern-sunset',
    name: 'Retro Sunburst & Palm',
    pattern: 'url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%20100%20100%22%20fill%3D%22none%22%20stroke%3D%22rgba%28255%2C255%2C255%2C0.38%29%22%20stroke-width%3D%221.2%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%20%3C%21--%20Concentric%20Sunburst%20over%20Horizon%20--%3E%20%3Cpath%20d%3D%22M15%2045%20H55%22%20stroke-width%3D%221.3%22%20/%3E%20%3Cpath%20d%3D%22M25%2045%20A%2010%2010%200%200%201%2045%2045%22%20/%3E%20%3Cpath%20d%3D%22M20%2045%20A%2015%2015%200%200%201%2050%2045%22%20stroke-dasharray%3D%222%202%22%20/%3E%20%3C%21--%20Radiating%20Sunbeams%20--%3E%20%3Cpath%20d%3D%22M35%2022%20V14%20M25%2026%20L19%2020%20M45%2026%20L51%2020%22%20stroke-width%3D%221%22%20/%3E%20%3C%21--%20Palm%20Frond%20silhouette%20--%3E%20%3Cpath%20d%3D%22M78%2085%20Q%2075%2060%2088%2045%22%20stroke-width%3D%221.3%22%20/%3E%20%3Cpath%20d%3D%22M88%2045%20Q%2078%2048%2074%2055%20M88%2045%20Q%2082%2052%2076%2062%20M88%2045%20Q%2094%2052%2090%2060%22%20stroke-width%3D%221%22%20/%3E%20%3C%21--%20Horizon%20flock%20birds%20--%3E%20%3Cpath%20d%3D%22M68%2020%20Q%2072%2016%2076%2020%20Q%2080%2016%2084%2020%22%20stroke-width%3D%220.9%22%20/%3E%20%3Cpath%20d%3D%22M18%2075%20Q%2022%2072%2026%2075%20Q%2030%2072%2034%2075%22%20stroke-width%3D%220.8%22%20/%3E%20%3C/svg%3E")',
    patternSize: '100px 100px'
  },
  'pattern-terminal': {
    id: 'pattern-terminal',
    name: 'Phosphor CRT Matrix',
    pattern: 'url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2270%22%20height%3D%2270%22%20viewBox%3D%220%200%2070%2070%22%20fill%3D%22none%22%20stroke%3D%22rgba%28255%2C255%2C255%2C0.35%29%22%20stroke-width%3D%221%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%20%3C%21--%20Horizontal%20CRT%20Scanlines%20--%3E%20%3Cline%20x1%3D%220%22%20y1%3D%2212%22%20x2%3D%2270%22%20y2%3D%2212%22%20stroke-dasharray%3D%222%204%22%20stroke-width%3D%220.6%22%20stroke%3D%22rgba%28255%2C255%2C255%2C0.2%29%22%20/%3E%20%3Cline%20x1%3D%220%22%20y1%3D%2236%22%20x2%3D%2270%22%20y2%3D%2236%22%20stroke-dasharray%3D%222%204%22%20stroke-width%3D%220.6%22%20stroke%3D%22rgba%28255%2C255%2C255%2C0.2%29%22%20/%3E%20%3Cline%20x1%3D%220%22%20y1%3D%2260%22%20x2%3D%2270%22%20y2%3D%2260%22%20stroke-dasharray%3D%222%204%22%20stroke-width%3D%220.6%22%20stroke%3D%22rgba%28255%2C255%2C255%2C0.2%29%22%20/%3E%20%3C%21--%20Terminal%20prompt%20%3E_%20--%3E%20%3Cpath%20d%3D%22M8%2024%20L14%2028%20L8%2032%20M17%2032%20H24%22%20stroke-width%3D%221.2%22%20/%3E%20%3C%21--%20Monospaced%20Code%20Hex%20Characters%20--%3E%20%3Ctext%20x%3D%2235%22%20y%3D%2227%22%20font-size%3D%229%22%20font-family%3D%22monospace%22%20fill%3D%22rgba%28255%2C255%2C255%2C0.4%29%22%20stroke%3D%22none%22%3E0x7F%3C/text%3E%20%3C%21--%20Brackets%20and%20code%20tokens%20--%3E%20%3Cpath%20d%3D%22M12%2048%20H8%20V58%20H12%20M20%2048%20H24%20V58%20H20%22%20stroke-width%3D%221%22%20/%3E%20%3Ctext%20x%3D%2238%22%20y%3D%2255%22%20font-size%3D%228%22%20font-family%3D%22monospace%22%20fill%3D%22rgba%28255%2C255%2C255%2C0.3%29%22%20stroke%3D%22none%22%3E%7B%2001%20%7D%3C/text%3E%20%3C/svg%3E")',
    patternSize: '70px 70px'
  },
  'pattern-zen': {
    id: 'pattern-zen',
    name: 'Wabi-Sabi Sand Ripples',
    pattern: 'url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2290%22%20height%3D%2290%22%20viewBox%3D%220%200%2090%2090%22%20fill%3D%22none%22%20stroke%3D%22rgba%28255%2C255%2C255%2C0.36%29%22%20stroke-width%3D%221.1%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%20%3C%21--%20Raked%20Sand%20Circular%20Ripples%20--%3E%20%3Ccircle%20cx%3D%2228%22%20cy%3D%2230%22%20r%3D%2210%22%20stroke-dasharray%3D%223%203%22%20/%3E%20%3Ccircle%20cx%3D%2228%22%20cy%3D%2230%22%20r%3D%2218%22%20stroke-dasharray%3D%223%203%22%20/%3E%20%3Ccircle%20cx%3D%2228%22%20cy%3D%2230%22%20r%3D%2226%22%20stroke-dasharray%3D%223%203%22%20stroke-width%3D%220.8%22%20/%3E%20%3C%21--%20Balanced%20River%20Stones%20--%3E%20%3Cellipse%20cx%3D%2228%22%20cy%3D%2230%22%20rx%3D%226%22%20ry%3D%224%22%20fill%3D%22rgba%28255%2C255%2C255%2C0.25%29%22%20stroke-width%3D%221.2%22%20/%3E%20%3C%21--%20Bamboo%20Stalk%20--%3E%20%3Cline%20x1%3D%2272%22%20y1%3D%2210%22%20x2%3D%2272%22%20y2%3D%2280%22%20stroke-width%3D%221.5%22%20/%3E%20%3Cline%20x1%3D%2268%22%20y1%3D%2232%22%20x2%3D%2276%22%20y2%3D%2232%22%20stroke-width%3D%221.5%22%20/%3E%20%3Cline%20x1%3D%2268%22%20y1%3D%2258%22%20x2%3D%2276%22%20y2%3D%2258%22%20stroke-width%3D%221.5%22%20/%3E%20%3C%21--%20Bamboo%20Leaves%20--%3E%20%3Cpath%20d%3D%22M72%2032%20Q%2082%2028%2086%2034%22%20stroke-width%3D%221.1%22%20/%3E%20%3Cpath%20d%3D%22M72%2058%20Q%2062%2054%2058%2060%22%20stroke-width%3D%221.1%22%20/%3E%20%3C%21--%20Stone%202%20in%20sand%20--%3E%20%3Cellipse%20cx%3D%2248%22%20cy%3D%2272%22%20rx%3D%227%22%20ry%3D%224.5%22%20transform%3D%22rotate%28-15%2048%2072%29%22%20stroke-width%3D%221%22%20/%3E%20%3C/svg%3E")',
    patternSize: '90px 90px'
  },
  'pattern-urban': {
    id: 'pattern-urban',
    name: 'Architectural Monstera',
    pattern: 'url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2290%22%20height%3D%2290%22%20viewBox%3D%220%200%2090%2090%22%20fill%3D%22none%22%20stroke%3D%22rgba%28255%2C255%2C255%2C0.36%29%22%20stroke-width%3D%221.1%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%20%3C%21--%20City%20Skyscraper%20Grid%20--%3E%20%3Crect%20x%3D%2212%22%20y%3D%2232%22%20width%3D%2218%22%20height%3D%2248%22%20rx%3D%221%22%20/%3E%20%3Cline%20x1%3D%2218%22%20y1%3D%2238%22%20x2%3D%2224%22%20y2%3D%2238%22%20stroke-width%3D%220.9%22%20/%3E%20%3Cline%20x1%3D%2218%22%20y1%3D%2246%22%20x2%3D%2224%22%20y2%3D%2246%22%20stroke-width%3D%220.9%22%20/%3E%20%3Cline%20x1%3D%2218%22%20y1%3D%2254%22%20x2%3D%2224%22%20y2%3D%2254%22%20stroke-width%3D%220.9%22%20/%3E%20%3C%21--%20Metro%20connection%20node%20lines%20--%3E%20%3Cpath%20d%3D%22M0%2018%20H35%20L48%2032%20H90%22%20stroke-width%3D%220.9%22%20stroke-dasharray%3D%222%203%22%20/%3E%20%3Ccircle%20cx%3D%2235%22%20cy%3D%2218%22%20r%3D%222.5%22%20fill%3D%22rgba%28255%2C255%2C255%2C0.5%29%22%20/%3E%20%3C%21--%20Monstera%20Leaf%20Silhouette%20--%3E%20%3Cpath%20d%3D%22M65%2080%20C50%2065%2C%2052%2045%2C%2068%2040%20C84%2045%2C%2086%2065%2C%2071%2080%20Z%22%20stroke-width%3D%221.2%22%20/%3E%20%3Cpath%20d%3D%22M68%2040%20V75%22%20stroke-width%3D%220.9%22%20/%3E%20%3Cpath%20d%3D%22M68%2050%20Q%2060%2048%2057%2052%20M68%2058%20Q%2058%2056%2056%2062%22%20stroke-width%3D%220.8%22%20/%3E%20%3Cpath%20d%3D%22M68%2050%20Q%2076%2048%2079%2052%20M68%2058%20Q%2078%2056%2080%2062%22%20stroke-width%3D%220.8%22%20/%3E%20%3C/svg%3E")',
    patternSize: '90px 90px'
  },
  'pattern-stargazer': {
    id: 'pattern-stargazer',
    name: 'Astrolabe & Constellations',
    pattern: 'url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%20100%20100%22%20fill%3D%22none%22%20stroke%3D%22rgba%28255%2C255%2C255%2C0.4%29%22%20stroke-width%3D%221.1%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%20%3C%21--%20Astrolabe%20Orbit%20Ring%20--%3E%20%3Cellipse%20cx%3D%2250%22%20cy%3D%2250%22%20rx%3D%2236%22%20ry%3D%2216%22%20transform%3D%22rotate%28-25%2050%2050%29%22%20stroke-dasharray%3D%223%203%22%20stroke-width%3D%220.9%22%20/%3E%20%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2228%22%20stroke-width%3D%220.8%22%20stroke%3D%22rgba%28255%2C255%2C255%2C0.2%29%22%20/%3E%20%3C%21--%204-Point%20Star%20Cluster%20--%3E%20%3Cpath%20d%3D%22M50%2042%20V58%20M42%2050%20H58%22%20stroke-width%3D%221.3%22%20/%3E%20%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%221.5%22%20fill%3D%22rgba%28255%2C255%2C255%2C0.8%29%22%20/%3E%20%3C%21--%20Constellation%20Chart%20%28Big%20Dipper%29%20--%3E%20%3Ccircle%20cx%3D%2216%22%20cy%3D%2222%22%20r%3D%221.8%22%20fill%3D%22rgba%28255%2C255%2C255%2C0.7%29%22%20/%3E%20%3Ccircle%20cx%3D%2230%22%20cy%3D%2218%22%20r%3D%221.8%22%20fill%3D%22rgba%28255%2C255%2C255%2C0.7%29%22%20/%3E%20%3Ccircle%20cx%3D%2242%22%20cy%3D%2226%22%20r%3D%221.8%22%20fill%3D%22rgba%28255%2C255%2C255%2C0.7%29%22%20/%3E%20%3Ccircle%20cx%3D%2248%22%20cy%3D%2235%22%20r%3D%221.8%22%20fill%3D%22rgba%28255%2C255%2C255%2C0.7%29%22%20/%3E%20%3Cpath%20d%3D%22M16%2022%20L30%2018%20L42%2026%20L48%2035%22%20stroke-dasharray%3D%222%202%22%20stroke-width%3D%220.9%22%20/%3E%20%3C%21--%20Star%20dots%20--%3E%20%3Ccircle%20cx%3D%2282%22%20cy%3D%2225%22%20r%3D%221.5%22%20fill%3D%22rgba%28255%2C255%2C255%2C0.6%29%22%20/%3E%20%3Ccircle%20cx%3D%2274%22%20cy%3D%2278%22%20r%3D%222%22%20fill%3D%22rgba%28255%2C255%2C255%2C0.7%29%22%20/%3E%20%3Ccircle%20cx%3D%2222%22%20cy%3D%2275%22%20r%3D%221.2%22%20fill%3D%22rgba%28255%2C255%2C255%2C0.5%29%22%20/%3E%20%3C/svg%3E")',
    patternSize: '100px 100px'
  }
};

export const GALLERY_SCENES: WallpaperScene[] = [
  { id: 'scene-library', value: '/wallpapers/fantasy_library.webp' },
  { id: 'scene-neon', value: '/wallpapers/neon_city.webp' },
  { id: 'scene-starry', value: '/wallpapers/starry_galaxy.webp' },
  { id: 'scene-cafe', value: '/wallpapers/cozy_cafe.webp' }
];

export const GALLERY_PATTERNS: WallpaperPattern[] = [
  { id: 'wp-pat-stargazer', gradient: 'linear-gradient(135deg, #0e122b 0%, #1c2045 50%, #080916 100%)', patternId: 'pattern-stargazer', patternOpacity: 30 },
  { id: 'wp-pat-gamer', gradient: 'linear-gradient(135deg, #0a1838 0%, #163668 50%, #060e22 100%)', patternId: 'pattern-gamer', patternOpacity: 28 },
  { id: 'wp-pat-ocean', gradient: 'linear-gradient(135deg, #051d26 0%, #0b3848 50%, #031015 100%)', patternId: 'pattern-ocean', patternOpacity: 28 },
  { id: 'wp-pat-sunset', gradient: 'linear-gradient(135deg, #3d0a26 0%, #7e1654 50%, #1c0512 100%)', patternId: 'pattern-sunset', patternOpacity: 28 },
  { id: 'wp-pat-amore', gradient: 'linear-gradient(135deg, #2a0e4e 0%, #581c87 50%, #16072b 100%)', patternId: 'pattern-amore', patternOpacity: 28 },
  { id: 'wp-pat-power', gradient: 'linear-gradient(135deg, #1f103b 0%, #3e1b72 50%, #110822 100%)', patternId: 'pattern-power', patternOpacity: 28 },
  { id: 'wp-pat-terminal', gradient: 'linear-gradient(135deg, #05261d 0%, #065f46 50%, #021711 100%)', patternId: 'pattern-terminal', patternOpacity: 28 },
  { id: 'wp-pat-winter', gradient: 'linear-gradient(135deg, #14202b 0%, #22374a 50%, #0c141c 100%)', patternId: 'pattern-winter', patternOpacity: 28 },
  { id: 'wp-pat-coffee', gradient: 'linear-gradient(135deg, #2b1509 0%, #683719 50%, #180a04 100%)', patternId: 'pattern-coffee', patternOpacity: 28 },
  { id: 'wp-pat-zen', gradient: 'linear-gradient(135deg, #1e2025 0%, #33363e 50%, #121316 100%)', patternId: 'pattern-zen', patternOpacity: 28 },
  { id: 'wp-pat-urban', gradient: 'linear-gradient(135deg, #0a1f14 0%, #183d28 50%, #06140d 100%)', patternId: 'pattern-urban', patternOpacity: 28 }
];

export const COLOR_MESH_GRADIENTS: ColorMeshGradient[] = [
  { id: 'mesh-teal', value: 'radial-gradient(circle at 80% 20%, #1e525e 0%, #0d1e2e 60%, #08111a 100%)' },
  { id: 'mesh-indigo', value: 'radial-gradient(circle at 30% 20%, #342868 0%, #171536 50%, #090918 100%)' },
  { id: 'mesh-emerald', value: 'radial-gradient(circle at 70% 30%, #1d4d38 0%, #0f2b20 50%, #061510 100%)' },
  { id: 'mesh-gunmetal', value: 'radial-gradient(circle at 50% 30%, #2f3542 0%, #1b1e25 50%, #0f1014 100%)' },
  { id: 'mesh-plum', value: 'radial-gradient(circle at 60% 20%, #4a1e36 0%, #290f1e 50%, #12060d 100%)' },
  { id: 'mesh-bronze', value: 'radial-gradient(circle at 30% 30%, #4d3319 0%, #291a0c 55%, #120b05 100%)' },
  { id: 'mesh-ocean', value: 'radial-gradient(circle at 70% 70%, #133a52 0%, #092032 50%, #040e17 100%)' },
  { id: 'mesh-cyber', value: 'radial-gradient(circle at 20% 80%, #3d1c4e 0%, #1b1435 50%, #0b0718 100%)' },
  { id: 'mesh-rose', value: 'radial-gradient(circle at 50% 20%, #4a2233 0%, #24101a 50%, #0f050b 100%)' }
];

export const SOLID_DARK_TONES: SolidDarkTone[] = [
  { id: 'solid-slate', value: '#1b2e3c' },
  { id: 'solid-navy', value: '#111a24' },
  { id: 'solid-obsidian', value: '#080d14' },
  { id: 'solid-oled', value: '#000000' },
  { id: 'solid-forest', value: '#1e3522' },
  { id: 'solid-pine', value: '#122215' },
  { id: 'solid-moss', value: '#0a140c' },
  { id: 'solid-olive', value: '#2c2a21' },
  { id: 'solid-espresso', value: '#282119' },
  { id: 'solid-cocoa', value: '#18130e' },
  { id: 'solid-burgundy', value: '#3b2325' },
  { id: 'solid-maroon', value: '#241214' }
];
