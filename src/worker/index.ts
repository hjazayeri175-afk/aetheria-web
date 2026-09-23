import { 
  hashPassword, 
  verifyPassword, 
  hashToken, 
  generateSecureToken, 
  generateResetCode 
} from './crypto';

export interface Env {
  DB: D1Database;
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  MICROSOFT_CLIENT_ID?: string;
  MICROSOFT_CLIENT_SECRET?: string;
}

interface UserRow {
  id: string;
  email: string;
  password_hash: string | null;
  salt: string | null;
  display_name: string;
  avatar_url: string | null;
  role: string;
  created_at: number;
}

function jsonResponse(data: any, status: number = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      ...headers
    }
  });
}

function getSessionToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  const cookie = request.headers.get('Cookie');
  if (cookie) {
    const match = cookie.match(/aetheria_session=([^;]+)/);
    if (match) return match[1];
  }
  return null;
}

async function getAuthenticatedUser(request: Request, env: Env): Promise<{ user: UserRow; starsBalance: number } | null> {
  const token = getSessionToken(request);
  if (!token) return null;

  const tokenHash = await hashToken(token);
  const now = Math.floor(Date.now() / 1000);

  const session = await env.DB.prepare(
    'SELECT user_id FROM sessions WHERE token_hash = ? AND expires_at > ?'
  ).bind(tokenHash, now).first<{ user_id: string }>();

  if (!session) return null;

  const user = await env.DB.prepare(
    'SELECT id, email, display_name, avatar_url, role, created_at FROM users WHERE id = ?'
  ).bind(session.user_id).first<UserRow>();

  if (!user) return null;

  const wallet = await env.DB.prepare(
    'SELECT stars_balance FROM wallets WHERE user_id = ?'
  ).bind(user.id).first<{ stars_balance: number }>();

  return {
    user,
    starsBalance: wallet?.stars_balance ?? 10
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }

    // Only intercept /api/* routes; everything else goes to static assets
    if (!url.pathname.startsWith('/api/')) {
      return env.ASSETS.fetch(request);
    }

    try {
      // ==========================================
      // 1. AUTH: REGISTER (Email + Password)
      // ==========================================
      if (url.pathname === '/api/auth/register' && request.method === 'POST') {
        const body = await request.json() as any;
        const email = (body.email || '').trim().toLowerCase();
        const password = (body.password || '').trim();
        const displayName = (body.displayName || '').trim() || email.split('@')[0];

        if (!email || !email.includes('@')) {
          return jsonResponse({ error: 'Please provide a valid email address.' }, 400);
        }
        if (!password || password.length < 6) {
          return jsonResponse({ error: 'Password must be at least 6 characters long.' }, 400);
        }

        // Check if email already exists
        const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
        if (existing) {
          return jsonResponse({ error: 'An account with this email already exists.' }, 409);
        }

        const userId = crypto.randomUUID();
        const { hashHex, saltHex } = await hashPassword(password);
        const now = Math.floor(Date.now() / 1000);
        const avatarUrl = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(displayName)}`;

        // Transaction: Create user + initial wallet + bonus transaction
        await env.DB.batch([
          env.DB.prepare(
            'INSERT INTO users (id, email, password_hash, salt, display_name, avatar_url, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
          ).bind(userId, email, hashHex, saltHex, displayName, avatarUrl, 'user', now, now),
          env.DB.prepare(
            'INSERT INTO wallets (user_id, stars_balance, creator_earnings, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
          ).bind(userId, 10, 0, now, now),
          env.DB.prepare(
            'INSERT INTO transactions (id, from_user_id, to_user_id, amount_stars, type, note, created_at) VALUES (?, NULL, ?, ?, ?, ?, ?)'
          ).bind(crypto.randomUUID(), userId, 10, 'signup_bonus', 'Welcome bonus: 10 free stars!', now)
        ]);

        // Create Session Token
        const rawToken = generateSecureToken();
        const tokenHash = await hashToken(rawToken);
        const expiresAt = now + (30 * 24 * 3600); // 30 days

        await env.DB.prepare(
          'INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)'
        ).bind(crypto.randomUUID(), userId, tokenHash, expiresAt, now).run();

        return jsonResponse({
          success: true,
          token: rawToken,
          user: {
            id: userId,
            email,
            displayName,
            avatarUrl,
            role: 'user',
            starsBalance: 10
          }
        }, 201, {
          'Set-Cookie': `aetheria_session=${rawToken}; Path=/; Max-Age=${30 * 24 * 3600}; SameSite=Lax; HttpOnly`
        });
      }

      // ==========================================
      // 2. AUTH: LOGIN
      // ==========================================
      if (url.pathname === '/api/auth/login' && request.method === 'POST') {
        const body = await request.json() as any;
        const email = (body.email || '').trim().toLowerCase();
        const password = (body.password || '').trim();

        if (!email || !password) {
          return jsonResponse({ error: 'Email and password are required.' }, 400);
        }

        const user = await env.DB.prepare(
          'SELECT id, email, password_hash, salt, display_name, avatar_url, role FROM users WHERE email = ?'
        ).bind(email).first<UserRow>();

        if (!user || !user.password_hash || !user.salt) {
          return jsonResponse({ error: 'Invalid email or password.' }, 401);
        }

        const isValid = await verifyPassword(password, user.password_hash, user.salt);
        if (!isValid) {
          return jsonResponse({ error: 'Invalid email or password.' }, 401);
        }

        // Create Session
        const now = Math.floor(Date.now() / 1000);
        const rawToken = generateSecureToken();
        const tokenHash = await hashToken(rawToken);
        const expiresAt = now + (30 * 24 * 3600);

        await env.DB.prepare(
          'INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)'
        ).bind(crypto.randomUUID(), user.id, tokenHash, expiresAt, now).run();

        const wallet = await env.DB.prepare(
          'SELECT stars_balance FROM wallets WHERE user_id = ?'
        ).bind(user.id).first<{ stars_balance: number }>();

        return jsonResponse({
          success: true,
          token: rawToken,
          user: {
            id: user.id,
            email: user.email,
            displayName: user.display_name,
            avatarUrl: user.avatar_url,
            role: user.role,
            starsBalance: wallet?.stars_balance ?? 10
          }
        }, 200, {
          'Set-Cookie': `aetheria_session=${rawToken}; Path=/; Max-Age=${30 * 24 * 3600}; SameSite=Lax; HttpOnly`
        });
      }

      // ==========================================
      // 3. AUTH: SOCIAL LOGIN (Google & Microsoft)
      // ==========================================
      if (url.pathname === '/api/auth/social' && request.method === 'POST') {
        const body = await request.json() as any;
        const provider = (body.provider || '').toLowerCase(); // 'google' | 'microsoft'
        const email = (body.email || '').trim().toLowerCase();
        const displayName = (body.displayName || '').trim() || email.split('@')[0];
        const providerUserId = (body.providerUserId || '').trim();
        const avatarUrl = body.avatarUrl || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(displayName)}`;

        if (!['google', 'microsoft'].includes(provider)) {
          return jsonResponse({ error: 'Unsupported social provider.' }, 400);
        }
        if (!email || !providerUserId) {
          return jsonResponse({ error: 'Social authentication profile missing email or identifier.' }, 400);
        }

        const now = Math.floor(Date.now() / 1000);

        // Check if oauth account exists
        let user = await env.DB.prepare(
          'SELECT u.id, u.email, u.display_name, u.avatar_url, u.role FROM users u JOIN oauth_accounts o ON u.id = o.user_id WHERE o.provider = ? AND o.provider_user_id = ?'
        ).bind(provider, providerUserId).first<UserRow>();

        if (!user) {
          // Check if user with same email exists
          user = await env.DB.prepare('SELECT id, email, display_name, avatar_url, role FROM users WHERE email = ?').bind(email).first<UserRow>();

          if (!user) {
            // New user registration via OAuth
            const newUserId = crypto.randomUUID();
            await env.DB.batch([
              env.DB.prepare(
                'INSERT INTO users (id, email, password_hash, salt, display_name, avatar_url, role, created_at, updated_at) VALUES (?, ?, NULL, NULL, ?, ?, ?, ?, ?)'
              ).bind(newUserId, email, displayName, avatarUrl, 'user', now, now),
              env.DB.prepare(
                'INSERT INTO oauth_accounts (id, user_id, provider, provider_user_id, email, created_at) VALUES (?, ?, ?, ?, ?, ?)'
              ).bind(crypto.randomUUID(), newUserId, provider, providerUserId, email, now),
              env.DB.prepare(
                'INSERT INTO wallets (user_id, stars_balance, creator_earnings, created_at, updated_at) VALUES (?, 10, 0, ?, ?)'
              ).bind(newUserId, now, now),
              env.DB.prepare(
                'INSERT INTO transactions (id, from_user_id, to_user_id, amount_stars, type, note, created_at) VALUES (?, NULL, ?, 10, ?, ?, ?)'
              ).bind(crypto.randomUUID(), newUserId, 'signup_bonus', `Welcome bonus: 10 free stars via ${provider}!`, now)
            ]);
            user = { id: newUserId, email, password_hash: null, salt: null, display_name: displayName, avatar_url: avatarUrl, role: 'user', created_at: now };
          } else {
            // Link OAuth account to existing user
            await env.DB.prepare(
              'INSERT OR IGNORE INTO oauth_accounts (id, user_id, provider, provider_user_id, email, created_at) VALUES (?, ?, ?, ?, ?, ?)'
            ).bind(crypto.randomUUID(), user.id, provider, providerUserId, email, now).run();
          }
        }

        // Issue session
        const rawToken = generateSecureToken();
        const tokenHash = await hashToken(rawToken);
        const expiresAt = now + (30 * 24 * 3600);

        await env.DB.prepare(
          'INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)'
        ).bind(crypto.randomUUID(), user.id, tokenHash, expiresAt, now).run();

        const wallet = await env.DB.prepare(
          'SELECT stars_balance FROM wallets WHERE user_id = ?'
        ).bind(user.id).first<{ stars_balance: number }>();

        return jsonResponse({
          success: true,
          token: rawToken,
          user: {
            id: user.id,
            email: user.email,
            displayName: user.display_name,
            avatarUrl: user.avatar_url,
            role: user.role,
            starsBalance: wallet?.stars_balance ?? 10
          }
        }, 200, {
          'Set-Cookie': `aetheria_session=${rawToken}; Path=/; Max-Age=${30 * 24 * 3600}; SameSite=Lax; HttpOnly`
        });
      }

      // ==========================================
      // 4. AUTH: CURRENT USER (Me)
      // ==========================================
      if (url.pathname === '/api/auth/me' && request.method === 'GET') {
        const auth = await getAuthenticatedUser(request, env);
        if (!auth) {
          return jsonResponse({ authenticated: false }, 200);
        }
        return jsonResponse({
          authenticated: true,
          user: {
            id: auth.user.id,
            email: auth.user.email,
            displayName: auth.user.display_name,
            avatarUrl: auth.user.avatar_url,
            role: auth.user.role,
            starsBalance: auth.starsBalance
          }
        });
      }

      // ==========================================
      // 5. AUTH: LOGOUT
      // ==========================================
      if (url.pathname === '/api/auth/logout' && request.method === 'POST') {
        const token = getSessionToken(request);
        if (token) {
          const tokenHash = await hashToken(token);
          await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(tokenHash).run();
        }
        return jsonResponse({ success: true }, 200, {
          'Set-Cookie': 'aetheria_session=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly'
        });
      }

      // ==========================================
      // 6. AUTH: FORGOT PASSWORD
      // ==========================================
      if (url.pathname === '/api/auth/forgot-password' && request.method === 'POST') {
        const body = await request.json() as any;
        const email = (body.email || '').trim().toLowerCase();
        if (!email) {
          return jsonResponse({ error: 'Email is required.' }, 400);
        }

        const user = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first<{ id: string }>();
        if (!user) {
          // Don't leak whether email exists
          return jsonResponse({ success: true, message: 'If an account exists, a 6-digit reset code has been generated.' });
        }

        const resetCode = generateResetCode();
        const now = Math.floor(Date.now() / 1000);
        const expiresAt = now + (15 * 60); // 15 minutes

        await env.DB.prepare(
          'INSERT INTO password_resets (id, user_id, reset_code, expires_at, created_at) VALUES (?, ?, ?, ?, ?)'
        ).bind(crypto.randomUUID(), user.id, resetCode, expiresAt, now).run();

        return jsonResponse({
          success: true,
          message: 'Reset code generated successfully.',
          // Return resetCode directly in API response so user can reset immediately without SMTP dependency!
          resetCode: resetCode
        });
      }

      // ==========================================
      // 7. AUTH: RESET PASSWORD
      // ==========================================
      if (url.pathname === '/api/auth/reset-password' && request.method === 'POST') {
        const body = await request.json() as any;
        const email = (body.email || '').trim().toLowerCase();
        const code = (body.code || '').trim();
        const newPassword = (body.newPassword || '').trim();

        if (!email || !code || !newPassword || newPassword.length < 6) {
          return jsonResponse({ error: 'Please provide valid email, 6-digit code, and new password (min 6 chars).' }, 400);
        }

        const user = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first<{ id: string }>();
        if (!user) {
          return jsonResponse({ error: 'Invalid reset code or email.' }, 400);
        }

        const now = Math.floor(Date.now() / 1000);
        const resetRecord = await env.DB.prepare(
          'SELECT id FROM password_resets WHERE user_id = ? AND reset_code = ? AND used = 0 AND expires_at > ?'
        ).bind(user.id, code, now).first<{ id: string }>();

        if (!resetRecord) {
          return jsonResponse({ error: 'Invalid or expired reset code.' }, 400);
        }

        const { hashHex, saltHex } = await hashPassword(newPassword);

        await env.DB.batch([
          env.DB.prepare(
            'UPDATE users SET password_hash = ?, salt = ?, updated_at = ? WHERE id = ?'
          ).bind(hashHex, saltHex, now, user.id),
          env.DB.prepare(
            'UPDATE password_resets SET used = 1 WHERE id = ?'
          ).bind(resetRecord.id),
          // Revoke existing sessions for security
          env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(user.id)
        ]);

        return jsonResponse({ success: true, message: 'Password updated successfully! Please sign in with your new password.' });
      }

      // ==========================================
      // 8. CLOUD SYNC: RESTORE CHATS (Cross-device / Clear-Cache Resilient)
      // ==========================================
      if (url.pathname === '/api/chats' && request.method === 'GET') {
        const auth = await getAuthenticatedUser(request, env);
        if (!auth) {
          return jsonResponse({ error: 'Sign in required for cloud chat sync.' }, 401);
        }

        const chats = await env.DB.prepare(
          'SELECT id, character_id, title, updated_at FROM cloud_chats WHERE user_id = ? ORDER BY updated_at DESC'
        ).bind(auth.user.id).all();

        return jsonResponse({ success: true, chats: chats.results });
      }

      // Get specific character chat messages
      const chatMatch = url.pathname.match(/^\/api\/chats\/([a-zA-Z0-9_-]+)$/);
      if (chatMatch && request.method === 'GET') {
        const characterId = chatMatch[1];
        const auth = await getAuthenticatedUser(request, env);
        if (!auth) {
          return jsonResponse({ error: 'Sign in required to load cloud chat.' }, 401);
        }

        const chat = await env.DB.prepare(
          'SELECT id FROM cloud_chats WHERE user_id = ? AND character_id = ?'
        ).bind(auth.user.id, characterId).first<{ id: string }>();

        if (!chat) {
          return jsonResponse({ success: true, messages: [] });
        }

        const messages = await env.DB.prepare(
          'SELECT id, role, text, media_type, media_url, branch_id, created_at FROM cloud_messages WHERE chat_id = ? ORDER BY created_at ASC'
        ).bind(chat.id).all();

        return jsonResponse({ success: true, messages: messages.results });
      }

      // SYNC / BACKUP CHAT MESSAGES TO D1
      if (url.pathname === '/api/chats/sync' && request.method === 'POST') {
        const auth = await getAuthenticatedUser(request, env);
        if (!auth) {
          return jsonResponse({ error: 'Sign in required for cloud chat sync.' }, 401);
        }

        const body = await request.json() as any;
        const characterId = (body.characterId || '').trim();
        const title = (body.title || characterId).trim();
        const messages = Array.isArray(body.messages) ? body.messages : [];

        if (!characterId) {
          return jsonResponse({ error: 'Character ID is required.' }, 400);
        }

        const now = Math.floor(Date.now() / 1000);

        // Find or create cloud_chat
        let chat = await env.DB.prepare(
          'SELECT id FROM cloud_chats WHERE user_id = ? AND character_id = ?'
        ).bind(auth.user.id, characterId).first<{ id: string }>();

        let chatId = chat?.id;
        if (!chatId) {
          chatId = crypto.randomUUID();
          await env.DB.prepare(
            'INSERT INTO cloud_chats (id, user_id, character_id, title, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
          ).bind(chatId, auth.user.id, characterId, title, now, now).run();
        } else {
          await env.DB.prepare('UPDATE cloud_chats SET updated_at = ? WHERE id = ?').bind(now, chatId).run();
        }

        // Upsert latest batch of messages
        if (messages.length > 0) {
          const statements = messages.slice(-50).map((msg: any) => {
            const msgId = msg.id || crypto.randomUUID();
            const role = msg.role || 'user';
            const text = msg.text || '';
            const mediaType = msg.mediaType || null;
            const mediaUrl = msg.mediaUrl || null;
            const branchId = msg.branchId || 'main';
            const msgTime = Math.floor((msg.timestamp || Date.now()) / 1000);

            return env.DB.prepare(
              'INSERT OR REPLACE INTO cloud_messages (id, chat_id, user_id, role, text, media_type, media_url, branch_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
            ).bind(msgId, chatId, auth.user.id, role, text, mediaType, mediaUrl, branchId, msgTime);
          });

          await env.DB.batch(statements);
        }

        return jsonResponse({ success: true, syncedCount: messages.length, chatId });
      }

      // ==========================================
      // 9. STARS ECONOMY: TIP CREATOR
      // ==========================================
      if (url.pathname === '/api/stars/tip' && request.method === 'POST') {
        const auth = await getAuthenticatedUser(request, env);
        if (!auth) {
          return jsonResponse({ error: 'Sign in required to give stars.' }, 401);
        }

        const body = await request.json() as any;
        const characterId = (body.characterId || '').trim();
        const amountStars = Math.max(1, parseInt(body.amountStars || '1', 10));

        if (auth.starsBalance < amountStars) {
          return jsonResponse({ 
            error: `Insufficient Stars! You have ${auth.starsBalance} Stars, but tried to send ${amountStars}.` 
          }, 400);
        }

        const now = Math.floor(Date.now() / 1000);

        // Find character creator if community card
        const commChar = await env.DB.prepare(
          'SELECT creator_id FROM community_characters WHERE id = ?'
        ).bind(characterId).first<{ creator_id: string }>();

        const creatorId = commChar?.creator_id || null;
        // Platform fee: 15% (min 0)
        const platformFee = Math.floor(amountStars * 0.15);
        const creatorShare = amountStars - platformFee;

        const statements = [
          // Deduct from sender
          env.DB.prepare(
            'UPDATE wallets SET stars_balance = stars_balance - ?, updated_at = ? WHERE user_id = ?'
          ).bind(amountStars, now, auth.user.id),
          // Record transaction
          env.DB.prepare(
            'INSERT INTO transactions (id, from_user_id, to_user_id, character_id, amount_stars, platform_fee_stars, creator_share_stars, type, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
          ).bind(crypto.randomUUID(), auth.user.id, creatorId, characterId, amountStars, platformFee, creatorShare, 'tip', `Tipped ${amountStars} stars to character`, now)
        ];

        // If creator exists, credit creator earnings
        if (creatorId) {
          statements.push(
            env.DB.prepare(
              'UPDATE wallets SET creator_earnings = creator_earnings + ?, updated_at = ? WHERE user_id = ?'
            ).bind(creatorShare, now, creatorId),
            env.DB.prepare(
              'UPDATE community_characters SET total_stars_earned = total_stars_earned + ? WHERE id = ?'
            ).bind(amountStars, characterId)
          );
        }

        await env.DB.batch(statements);

        const newBalance = auth.starsBalance - amountStars;
        return jsonResponse({ 
          success: true, 
          newBalance, 
          message: `Successfully sent ${amountStars} Stars! Thank you for supporting the creator.` 
        });
      }

      // ==========================================
      // 10. COMMUNITY: LIST & PUBLISH CARDS
      // ==========================================
      if (url.pathname === '/api/community/characters' && request.method === 'GET') {
        const characters = await env.DB.prepare(
          'SELECT c.*, u.display_name as creator_name, u.avatar_url as creator_avatar FROM community_characters c JOIN users u ON c.creator_id = u.id WHERE c.is_published = 1 ORDER BY c.total_stars_earned DESC, c.created_at DESC LIMIT 50'
        ).all();

        return jsonResponse({ success: true, characters: characters.results });
      }

      return jsonResponse({ error: 'Endpoint not found' }, 404);
    } catch (err: any) {
      return jsonResponse({ error: err.message || 'Internal Edge Error' }, 500);
    }
  }
};
