// Zero-dependency Edge WebCrypto utilities for Cloudflare Workers

export async function hashPassword(password: string, saltHex?: string): Promise<{ hashHex: string; saltHex: string }> {
  const enc = new TextEncoder();
  const salt = saltHex 
    ? hexToUint8Array(saltHex) 
    : crypto.getRandomValues(new Uint8Array(16));
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );

  return {
    hashHex: uint8ArrayToHex(new Uint8Array(derivedBits)),
    saltHex: uint8ArrayToHex(salt)
  };
}

export async function verifyPassword(password: string, hashHex: string, saltHex: string): Promise<boolean> {
  const { hashHex: computedHash } = await hashPassword(password, saltHex);
  return constantTimeCompare(computedHash, hashHex);
}

export async function hashToken(token: string): Promise<string> {
  const enc = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', enc.encode(token));
  return uint8ArrayToHex(new Uint8Array(hashBuffer));
}

export function generateSecureToken(length: number = 32): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return uint8ArrayToHex(bytes);
}

export function generateResetCode(): string {
  const bytes = crypto.getRandomValues(new Uint32Array(1));
  const num = (bytes[0] % 900000) + 100000;
  return num.toString();
}

function uint8ArrayToHex(arr: Uint8Array): string {
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

function hexToUint8Array(hex: string): Uint8Array {
  const len = hex.length;
  const arr = new Uint8Array(len / 2);
  for (let i = 0; i < len; i += 2) {
    arr[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return arr;
}

function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
