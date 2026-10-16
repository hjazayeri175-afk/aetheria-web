/**
 * Smart Device Marketing Name Resolution & Hardware Dictionary
 * Resolves raw factory build codes (e.g., 2311DRK48G, SM-S928B) into human-friendly marketing names.
 */

export interface ResolvedDeviceInfo {
  marketingName: string;
  rawModelCode: string | null;
  brand: string;
  os: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  secondaryFormatted: string;
  subtitleBadge: string;
  isKnownMarketingModel: boolean;
}

export const HARDWARE_MODEL_DICTIONARY: Record<string, { name: string; brand: string; type?: 'mobile' | 'tablet' }> = {
  // Xiaomi POCO Series
  '2311DRK48G': { name: 'Xiaomi POCO X6 Pro 5G', brand: 'POCO' },
  '2311DRK48I': { name: 'Xiaomi POCO X6 Pro 5G', brand: 'POCO' },
  '2311DRK48C': { name: 'Redmi K70E (POCO X6 Pro)', brand: 'Redmi' },
  '23122PCD1G': { name: 'Xiaomi POCO X6 5G', brand: 'POCO' },
  '23122PCD1I': { name: 'Xiaomi POCO X6 5G', brand: 'POCO' },
  '24069PC21G': { name: 'Xiaomi POCO F6', brand: 'POCO' },
  '24069PC21I': { name: 'Xiaomi POCO F6', brand: 'POCO' },
  '24053PY09G': { name: 'Xiaomi POCO F6 Pro', brand: 'POCO' },
  '24053PY09C': { name: 'Redmi K70 (POCO F6 Pro)', brand: 'Redmi' },
  '23049PCD8G': { name: 'Xiaomi POCO F5 5G', brand: 'POCO' },
  '23013PC75G': { name: 'Xiaomi POCO F5 Pro', brand: 'POCO' },
  '22011211G': { name: 'Xiaomi POCO F4 GT', brand: 'POCO' },
  '22041216G': { name: 'Xiaomi POCO X4 GT', brand: 'POCO' },
  '2201116PG': { name: 'Xiaomi POCO X4 Pro 5G', brand: 'POCO' },
  '22101320G': { name: 'Xiaomi POCO X5 Pro 5G', brand: 'POCO' },
  '22111317PG': { name: 'Xiaomi POCO X5 5G', brand: 'POCO' },
  'M2102J20SG': { name: 'Xiaomi POCO X3 Pro', brand: 'POCO' },
  'M2007J20CG': { name: 'Xiaomi POCO X3 NFC', brand: 'POCO' },
  '2201117PG': { name: 'Xiaomi POCO M4 Pro', brand: 'POCO' },
  '22101316UG': { name: 'Xiaomi POCO M5', brand: 'POCO' },

  // Xiaomi Flagships
  '23127PN0CG': { name: 'Xiaomi 14', brand: 'Xiaomi' },
  '24030PN60G': { name: 'Xiaomi 14 Ultra', brand: 'Xiaomi' },
  '23116PN5BC': { name: 'Xiaomi 14 Pro', brand: 'Xiaomi' },
  '2211133G': { name: 'Xiaomi 13', brand: 'Xiaomi' },
  '2210132G': { name: 'Xiaomi 13 Pro', brand: 'Xiaomi' },
  '23049PCD8I': { name: 'Xiaomi 13 Ultra', brand: 'Xiaomi' },
  '2112123AG': { name: 'Xiaomi 12', brand: 'Xiaomi' },
  '2201123G': { name: 'Xiaomi 12 Pro', brand: 'Xiaomi' },
  '2210129SG': { name: 'Xiaomi 12T Pro', brand: 'Xiaomi' },
  '22071212AG': { name: 'Xiaomi 12T', brand: 'Xiaomi' },
  '21081111RG': { name: 'Xiaomi 11T Pro', brand: 'Xiaomi' },
  '21081111HG': { name: 'Xiaomi 11T', brand: 'Xiaomi' },
  'M2011K2G': { name: 'Xiaomi Mi 11', brand: 'Xiaomi' },
  'M2007J3SG': { name: 'Xiaomi Mi 10T Pro', brand: 'Xiaomi' },

  // Redmi Note & Budget Series
  '2312DRA50G': { name: 'Redmi Note 13 Pro 5G', brand: 'Redmi' },
  '23090RA98G': { name: 'Redmi Note 13 Pro+ 5G', brand: 'Redmi' },
  '23129RAA4G': { name: 'Redmi Note 13 4G', brand: 'Redmi' },
  '23117RA68G': { name: 'Redmi Note 13 5G', brand: 'Redmi' },
  '22101316G': { name: 'Redmi Note 12 Pro 5G', brand: 'Redmi' },
  '23021RAAEG': { name: 'Redmi Note 12 4G', brand: 'Redmi' },
  '22111317G': { name: 'Redmi Note 12 5G', brand: 'Redmi' },
  '2201116SG': { name: 'Redmi Note 11 Pro', brand: 'Redmi' },
  '2201116TG': { name: 'Redmi Note 11', brand: 'Redmi' },
  'M2101K6G': { name: 'Redmi Note 10 Pro', brand: 'Redmi' },
  '23076RN4BI': { name: 'Redmi 12', brand: 'Redmi' },
  '23076RN8DY': { name: 'Redmi 12 4G', brand: 'Redmi' },
  '2310FPCA4G': { name: 'Redmi 13C', brand: 'Redmi' },
  '24040RN64Y': { name: 'Redmi 13', brand: 'Redmi' },

  // Samsung Galaxy S-Series
  'SM-S928B': { name: 'Samsung Galaxy S24 Ultra', brand: 'Samsung' },
  'SM-S928U': { name: 'Samsung Galaxy S24 Ultra', brand: 'Samsung' },
  'SM-S9280': { name: 'Samsung Galaxy S24 Ultra', brand: 'Samsung' },
  'SM-S926B': { name: 'Samsung Galaxy S24+', brand: 'Samsung' },
  'SM-S926U': { name: 'Samsung Galaxy S24+', brand: 'Samsung' },
  'SM-S921B': { name: 'Samsung Galaxy S24', brand: 'Samsung' },
  'SM-S921U': { name: 'Samsung Galaxy S24', brand: 'Samsung' },
  'SM-S918B': { name: 'Samsung Galaxy S23 Ultra', brand: 'Samsung' },
  'SM-S918U': { name: 'Samsung Galaxy S23 Ultra', brand: 'Samsung' },
  'SM-S916B': { name: 'Samsung Galaxy S23+', brand: 'Samsung' },
  'SM-S916U': { name: 'Samsung Galaxy S23+', brand: 'Samsung' },
  'SM-S911B': { name: 'Samsung Galaxy S23', brand: 'Samsung' },
  'SM-S911U': { name: 'Samsung Galaxy S23', brand: 'Samsung' },
  'SM-S711B': { name: 'Samsung Galaxy S23 FE', brand: 'Samsung' },
  'SM-S908B': { name: 'Samsung Galaxy S22 Ultra', brand: 'Samsung' },
  'SM-S908U': { name: 'Samsung Galaxy S22 Ultra', brand: 'Samsung' },
  'SM-S906B': { name: 'Samsung Galaxy S22+', brand: 'Samsung' },
  'SM-S901B': { name: 'Samsung Galaxy S22', brand: 'Samsung' },
  'SM-G998B': { name: 'Samsung Galaxy S21 Ultra', brand: 'Samsung' },
  'SM-G996B': { name: 'Samsung Galaxy S21+', brand: 'Samsung' },
  'SM-G991B': { name: 'Samsung Galaxy S21', brand: 'Samsung' },
  'SM-G990B': { name: 'Samsung Galaxy S21 FE', brand: 'Samsung' },

  // Samsung Galaxy Z Fold & Flip
  'SM-F956B': { name: 'Samsung Galaxy Z Fold 6', brand: 'Samsung' },
  'SM-F741B': { name: 'Samsung Galaxy Z Flip 6', brand: 'Samsung' },
  'SM-F946B': { name: 'Samsung Galaxy Z Fold 5', brand: 'Samsung' },
  'SM-F731B': { name: 'Samsung Galaxy Z Flip 5', brand: 'Samsung' },
  'SM-F936B': { name: 'Samsung Galaxy Z Fold 4', brand: 'Samsung' },
  'SM-F721B': { name: 'Samsung Galaxy Z Flip 4', brand: 'Samsung' },

  // Samsung Galaxy A-Series
  'SM-A556B': { name: 'Samsung Galaxy A55 5G', brand: 'Samsung' },
  'SM-A546B': { name: 'Samsung Galaxy A54 5G', brand: 'Samsung' },
  'SM-A546E': { name: 'Samsung Galaxy A54 5G', brand: 'Samsung' },
  'SM-A536B': { name: 'Samsung Galaxy A53 5G', brand: 'Samsung' },
  'SM-A528B': { name: 'Samsung Galaxy A52s 5G', brand: 'Samsung' },
  'SM-A525F': { name: 'Samsung Galaxy A52', brand: 'Samsung' },
  'SM-A356B': { name: 'Samsung Galaxy A35 5G', brand: 'Samsung' },
  'SM-A346B': { name: 'Samsung Galaxy A34 5G', brand: 'Samsung' },
  'SM-A256B': { name: 'Samsung Galaxy A25 5G', brand: 'Samsung' },
  'SM-A155F': { name: 'Samsung Galaxy A15', brand: 'Samsung' },
  'SM-A156B': { name: 'Samsung Galaxy A15 5G', brand: 'Samsung' },
  'SM-A145F': { name: 'Samsung Galaxy A14', brand: 'Samsung' },
  'SM-A146P': { name: 'Samsung Galaxy A14 5G', brand: 'Samsung' },

  // Samsung Galaxy Tablets
  'SM-X910': { name: 'Samsung Galaxy Tab S9 Ultra', brand: 'Samsung', type: 'tablet' },
  'SM-X810': { name: 'Samsung Galaxy Tab S9+', brand: 'Samsung', type: 'tablet' },
  'SM-X710': { name: 'Samsung Galaxy Tab S9', brand: 'Samsung', type: 'tablet' },
  'SM-X210': { name: 'Samsung Galaxy Tab A9+', brand: 'Samsung', type: 'tablet' },

  // OnePlus
  'CPH2581': { name: 'OnePlus 12', brand: 'OnePlus' },
  'CPH2583': { name: 'OnePlus 12', brand: 'OnePlus' },
  'CPH2611': { name: 'OnePlus 12R', brand: 'OnePlus' },
  'CPH2609': { name: 'OnePlus 12R', brand: 'OnePlus' },
  'CPH2449': { name: 'OnePlus 11', brand: 'OnePlus' },
  'CPH2413': { name: 'OnePlus 10 Pro', brand: 'OnePlus' },
  'NE2210': { name: 'OnePlus 10 Pro', brand: 'OnePlus' },
  'CPH2493': { name: 'OnePlus Nord 3', brand: 'OnePlus' },
  'CPH2513': { name: 'OnePlus Nord CE 3 Lite', brand: 'OnePlus' },

  // Google Pixel
  'Pixel 9 Pro XL': { name: 'Google Pixel 9 Pro XL', brand: 'Google' },
  'Pixel 9 Pro Fold': { name: 'Google Pixel 9 Pro Fold', brand: 'Google' },
  'Pixel 9 Pro': { name: 'Google Pixel 9 Pro', brand: 'Google' },
  'Pixel 9': { name: 'Google Pixel 9', brand: 'Google' },
  'Pixel 8 Pro': { name: 'Google Pixel 8 Pro', brand: 'Google' },
  'Pixel 8a': { name: 'Google Pixel 8a', brand: 'Google' },
  'Pixel 8': { name: 'Google Pixel 8', brand: 'Google' },
  'Pixel 7 Pro': { name: 'Google Pixel 7 Pro', brand: 'Google' },
  'Pixel 7a': { name: 'Google Pixel 7a', brand: 'Google' },
  'Pixel 7': { name: 'Google Pixel 7', brand: 'Google' },
  'Pixel 6 Pro': { name: 'Google Pixel 6 Pro', brand: 'Google' },
  'Pixel 6a': { name: 'Google Pixel 6a', brand: 'Google' },
  'Pixel 6': { name: 'Google Pixel 6', brand: 'Google' }
};

/**
 * Resolves a model code or prefix against known brands and series.
 */
function resolveModelPrefix(model: string): { name: string; brand: string; type?: 'mobile' | 'tablet' } | null {
  const clean = model.trim().toUpperCase();

  // Direct match
  if (HARDWARE_MODEL_DICTIONARY[clean]) {
    return HARDWARE_MODEL_DICTIONARY[clean];
  }

  // Check POCO / Xiaomi factory model codes
  if (/^2311DRK48/i.test(clean)) return { name: 'Xiaomi POCO X6 Pro', brand: 'POCO' };
  if (/^23122PCD1/i.test(clean)) return { name: 'Xiaomi POCO X6', brand: 'POCO' };
  if (/^24069PC21/i.test(clean)) return { name: 'Xiaomi POCO F6', brand: 'POCO' };
  if (/^24053PY09/i.test(clean)) return { name: 'Xiaomi POCO F6 Pro', brand: 'POCO' };
  if (/^23049PCD8/i.test(clean)) return { name: 'Xiaomi POCO F5', brand: 'POCO' };
  if (/^23013PC75/i.test(clean)) return { name: 'Xiaomi POCO F5 Pro', brand: 'POCO' };
  if (/^22011211/i.test(clean)) return { name: 'Xiaomi POCO F4 GT', brand: 'POCO' };
  if (/^22041216/i.test(clean)) return { name: 'Xiaomi POCO X4 GT', brand: 'POCO' };
  if (/^2201116P/i.test(clean)) return { name: 'Xiaomi POCO X4 Pro 5G', brand: 'POCO' };
  if (/^22101320/i.test(clean)) return { name: 'Xiaomi POCO X5 Pro 5G', brand: 'POCO' };
  if (/^23127PN0C/i.test(clean)) return { name: 'Xiaomi 14', brand: 'Xiaomi' };
  if (/^24030PN60/i.test(clean)) return { name: 'Xiaomi 14 Ultra', brand: 'Xiaomi' };
  if (/^2211133/i.test(clean)) return { name: 'Xiaomi 13', brand: 'Xiaomi' };
  if (/^2210132/i.test(clean)) return { name: 'Xiaomi 13 Pro', brand: 'Xiaomi' };
  if (/^2312DRA50/i.test(clean)) return { name: 'Redmi Note 13 Pro 5G', brand: 'Redmi' };
  if (/^23090RA98/i.test(clean)) return { name: 'Redmi Note 13 Pro+ 5G', brand: 'Redmi' };
  if (/^23129RAA4/i.test(clean)) return { name: 'Redmi Note 13 4G', brand: 'Redmi' };
  if (/^23117RA68/i.test(clean)) return { name: 'Redmi Note 13 5G', brand: 'Redmi' };
  if (/^22101316/i.test(clean)) return { name: 'Redmi Note 12 Pro', brand: 'Redmi' };
  if (/^23076RN[48]/i.test(clean)) return { name: 'Redmi 12', brand: 'Redmi' };

  // Samsung Galaxy Series prefixes
  if (/^SM-S92[0-9]/i.test(clean)) return { name: 'Samsung Galaxy S24 Series', brand: 'Samsung' };
  if (/^SM-S91[0-9]/i.test(clean)) return { name: 'Samsung Galaxy S23 Series', brand: 'Samsung' };
  if (/^SM-S90[0-9]/i.test(clean)) return { name: 'Samsung Galaxy S22 Series', brand: 'Samsung' };
  if (/^SM-S71[0-9]/i.test(clean)) return { name: 'Samsung Galaxy S23 FE', brand: 'Samsung' };
  if (/^SM-G99[0-9]/i.test(clean)) return { name: 'Samsung Galaxy S21 Series', brand: 'Samsung' };
  if (/^SM-G98[0-9]/i.test(clean)) return { name: 'Samsung Galaxy S20 Series', brand: 'Samsung' };
  if (/^SM-N98[0-9]/i.test(clean)) return { name: 'Samsung Galaxy Note 20 Series', brand: 'Samsung' };
  if (/^SM-F9[0-9]/i.test(clean)) return { name: 'Samsung Galaxy Z Fold Series', brand: 'Samsung' };
  if (/^SM-F7[0-9]/i.test(clean)) return { name: 'Samsung Galaxy Z Flip Series', brand: 'Samsung' };
  if (/^SM-A55[0-9]/i.test(clean)) return { name: 'Samsung Galaxy A55 5G', brand: 'Samsung' };
  if (/^SM-A54[0-9]/i.test(clean)) return { name: 'Samsung Galaxy A54 5G', brand: 'Samsung' };
  if (/^SM-A53[0-9]/i.test(clean)) return { name: 'Samsung Galaxy A53 5G', brand: 'Samsung' };
  if (/^SM-A52[0-9]/i.test(clean)) return { name: 'Samsung Galaxy A52 Series', brand: 'Samsung' };
  if (/^SM-A35[0-9]/i.test(clean)) return { name: 'Samsung Galaxy A35 5G', brand: 'Samsung' };
  if (/^SM-A34[0-9]/i.test(clean)) return { name: 'Samsung Galaxy A34 5G', brand: 'Samsung' };
  if (/^SM-A25[0-9]/i.test(clean)) return { name: 'Samsung Galaxy A25 5G', brand: 'Samsung' };
  if (/^SM-A15[0-9]/i.test(clean)) return { name: 'Samsung Galaxy A15', brand: 'Samsung' };
  if (/^SM-A14[0-9]/i.test(clean)) return { name: 'Samsung Galaxy A14', brand: 'Samsung' };
  if (/^SM-X[0-9]/i.test(clean) || /^SM-T[0-9]/i.test(clean)) {
    return { name: `Samsung Galaxy Tab (${clean})`, brand: 'Samsung', type: 'tablet' };
  }
  if (/^SM-[A-Z0-9]+/i.test(clean)) {
    return { name: `Samsung Galaxy (${clean})`, brand: 'Samsung' };
  }

  // Google Pixel regex
  const pixelMatch = model.match(/Pixel\s*[0-9]+[a-zA-Z\s]*/i);
  if (pixelMatch) {
    return { name: `Google ${pixelMatch[0].trim()}`, brand: 'Google' };
  }

  // OnePlus
  if (/^CPH[0-9]{4}/i.test(clean) || /^NE[0-9]{4}/i.test(clean)) {
    return { name: `OnePlus Device (${clean})`, brand: 'OnePlus' };
  }

  // Clear brand words in model name (e.g. "POCO X6 Pro", "Redmi Note 12")
  if (/^POCO\s/i.test(model)) return { name: `Xiaomi ${model}`, brand: 'POCO' };
  if (/^Redmi\s/i.test(model)) return { name: model, brand: 'Redmi' };
  if (/^Xiaomi\s/i.test(model)) return { name: model, brand: 'Xiaomi' };
  if (/^OnePlus\s/i.test(model)) return { name: model, brand: 'OnePlus' };

  return null;
}

export interface ResolverOptions {
  userAgent?: string;
  modelCode?: string | null;
  platform?: string | null;
  browser?: string | null;
  secChMobile?: string | null;
}

/**
 * 3-Layer Device Resolver Utility
 * Resolves userAgent and client hints into clean marketing name and secondary metadata.
 */
export function resolveFriendlyDeviceName(options: ResolverOptions): ResolvedDeviceInfo {
  const ua = options.userAgent || '';
  const secModel = (options.modelCode || '').replace(/"/g, '').trim();
  const secPlatform = (options.platform || '').replace(/"/g, '').trim();

  // 1. Detect Browser
  let browser = options.browser || 'Web Browser';
  if (!options.browser) {
    if (/Edg\//i.test(ua)) browser = 'Microsoft Edge';
    else if (/Chrome\//i.test(ua) && !/Chromium|Edg/i.test(ua)) browser = 'Google Chrome';
    else if (/Safari\//i.test(ua) && !/Chrome|Chromium/i.test(ua)) browser = 'Apple Safari';
    else if (/Firefox\//i.test(ua)) browser = 'Mozilla Firefox';
  }

  // 2. Detect OS & Base Device Type
  let os = 'Unknown OS';
  let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';

  if (options.secChMobile === '?1' || /Mobile|Android|iPhone|iPad/i.test(ua)) {
    deviceType = /iPad|Tablet|SM-T|SM-X/i.test(ua) ? 'tablet' : 'mobile';
  }

  // Extract raw model code if present in UA or Client Hints
  let rawModel: string | null = null;
  if (secModel && secModel !== 'K' && secModel !== '""') {
    rawModel = secModel;
  } else if (/Android/i.test(ua)) {
    const modelMatch = ua.match(/;\s*([^;)]+)\s+Build\//i) || ua.match(/Android[^;]*;\s*([^;)]+)\)/i);
    if (modelMatch && modelMatch[1]) {
      const candidate = modelMatch[1].trim();
      if (!/^(K|wv|Linux|U|Android)$/i.test(candidate)) {
        rawModel = candidate;
      }
    }
  }

  // Check OS
  if (/iPhone/i.test(ua)) {
    os = 'iOS';
    deviceType = 'mobile';
    return {
      marketingName: 'Apple iPhone',
      rawModelCode: rawModel,
      brand: 'Apple',
      os,
      deviceType,
      browser,
      secondaryFormatted: `${browser} • iOS`,
      subtitleBadge: 'iOS',
      isKnownMarketingModel: true
    };
  }

  if (/iPad/i.test(ua)) {
    os = 'iPadOS';
    deviceType = 'tablet';
    return {
      marketingName: 'Apple iPad',
      rawModelCode: rawModel,
      brand: 'Apple',
      os,
      deviceType,
      browser,
      secondaryFormatted: `${browser} • iPadOS`,
      subtitleBadge: 'iPadOS',
      isKnownMarketingModel: true
    };
  }

  if (/Macintosh|Mac OS X/i.test(ua) || secPlatform === 'macOS') {
    os = 'macOS';
    deviceType = 'desktop';
    return {
      marketingName: 'Apple Mac',
      rawModelCode: null,
      brand: 'Apple',
      os,
      deviceType,
      browser,
      secondaryFormatted: `${browser} • macOS`,
      subtitleBadge: 'macOS',
      isKnownMarketingModel: true
    };
  }

  if (/Windows/i.test(ua) || secPlatform === 'Windows') {
    os = 'Windows';
    deviceType = 'desktop';
    return {
      marketingName: 'Windows PC',
      rawModelCode: null,
      brand: 'Microsoft',
      os,
      deviceType,
      browser,
      secondaryFormatted: `${browser} • Windows`,
      subtitleBadge: 'Windows',
      isKnownMarketingModel: true
    };
  }

  if (/Linux/i.test(ua) && !/Android/i.test(ua) && secPlatform !== 'Android') {
    os = 'Linux';
    deviceType = 'desktop';
    return {
      marketingName: 'Linux Workstation',
      rawModelCode: null,
      brand: 'Linux',
      os,
      deviceType,
      browser,
      secondaryFormatted: `${browser} • Linux`,
      subtitleBadge: 'Linux',
      isKnownMarketingModel: true
    };
  }

  // Android Resolution
  if (/Android/i.test(ua) || secPlatform === 'Android') {
    os = 'Android';

    if (rawModel) {
      const resolved = resolveModelPrefix(rawModel);
      if (resolved) {
        return {
          marketingName: resolved.name,
          rawModelCode: rawModel,
          brand: resolved.brand,
          os: 'Android',
          deviceType: resolved.type || deviceType,
          browser,
          secondaryFormatted: `${browser} • Android (${rawModel})`,
          subtitleBadge: `Android (${rawModel})`,
          isKnownMarketingModel: true
        };
      }

      // Check if it's a factory build serial code (e.g. 2311DRK48G, V2250, RMX3363, or alphanumeric 5-14 chars)
      const isFactoryBuildSerial = /^[0-9A-Z_-]{5,14}$/i.test(rawModel);
      if (isFactoryBuildSerial) {
        return {
          marketingName: deviceType === 'tablet' ? 'Android Tablet' : 'Android Smartphone',
          rawModelCode: rawModel,
          brand: 'Android',
          os: 'Android',
          deviceType,
          browser,
          secondaryFormatted: `${browser} • Android (${rawModel})`,
          subtitleBadge: `Android (Model: ${rawModel})`,
          isKnownMarketingModel: false
        };
      }

      // Readable non-dictionary string (e.g. "Pixel 8 Pro")
      return {
        marketingName: rawModel,
        rawModelCode: rawModel,
        brand: 'Android',
        os: 'Android',
        deviceType,
        browser,
        secondaryFormatted: `${browser} • Android (${rawModel})`,
        subtitleBadge: `Android (${rawModel})`,
        isKnownMarketingModel: false
      };
    }

    return {
      marketingName: deviceType === 'tablet' ? 'Android Tablet' : 'Android Smartphone',
      rawModelCode: null,
      brand: 'Android',
      os: 'Android',
      deviceType,
      browser,
      secondaryFormatted: `${browser} • Android`,
      subtitleBadge: 'Android',
      isKnownMarketingModel: false
    };
  }

  return {
    marketingName: 'Connected Device',
    rawModelCode: rawModel,
    brand: 'Generic',
    os,
    deviceType,
    browser,
    secondaryFormatted: `${browser} • ${os}`,
    subtitleBadge: os,
    isKnownMarketingModel: false
  };
}

/**
 * Standard privacy IP mask (IPv4 & IPv6)
 * e.g. 138.124.180.25 -> 138.124.***.***
 */
export function maskIp(ip: string): string {
  if (!ip) return '***.***.***.***';
  const clean = ip.trim();
  if (clean.includes(':')) {
    const parts = clean.split(':');
    return parts.length >= 4 ? `${parts[0]}:${parts[1]}:****:****` : `${clean.substring(0, 8)}****`;
  }
  const parts = clean.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.***.***`;
  }
  return clean;
}

