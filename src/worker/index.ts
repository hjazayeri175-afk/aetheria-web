import { 
  hashPassword, 
  verifyPassword, 
  hashToken, 
  generateSecureToken, 
  generateResetCode 
} from './crypto';

export interface Env {
  DB: D1Database;
  AI?: any;
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
      const assetRes = await env.ASSETS.fetch(request);
      const newHeaders = new Headers(assetRes.headers);
      newHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      newHeaders.set('Pragma', 'no-cache');
      newHeaders.set('Expires', '0');
      return new Response(assetRes.body, {
        status: assetRes.status,
        statusText: assetRes.statusText,
        headers: newHeaders
      });
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

      // ==========================================
      // 10.5 CROWDSOURCED MODERATION & ISSUE REPORTING
      // ==========================================
      if (url.pathname === '/api/reports' && request.method === 'POST') {
        try {
          const auth = await getAuthenticatedUser(request, env);
          const body = await request.json() as any;

          const category = (body.category || 'other').trim();
          const targetType = (body.targetType || 'message').trim();
          const targetId = (body.targetId || '').trim();
          const targetName = (body.targetName || '').trim();
          const details = (body.details || '').trim();
          const snippet = (body.snippet || '').trim().slice(0, 4000);
          const metadata = typeof body.metadata === 'object' ? JSON.stringify(body.metadata) : (body.metadata || '');

          if (!targetId && !details && !snippet) {
            return jsonResponse({ error: 'Report details or target are required' }, 400);
          }

          const reportId = crypto.randomUUID();
          const now = Math.floor(Date.now() / 1000);
          const reporterId = auth ? auth.user.id : (body.guestId || 'guest');
          const reporterEmail = auth ? auth.user.email : (body.contactEmail || null);

          await env.DB.prepare(`
            INSERT INTO reports (
              id, reporter_id, reporter_email, target_type, target_id, 
              target_name, category, details, snippet, metadata, 
              status, stars_rewarded, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0, ?, ?)
          `).bind(
            reportId,
            reporterId,
            reporterEmail,
            targetType,
            targetId,
            targetName,
            category,
            details,
            snippet,
            metadata,
            now,
            now
          ).run();

          return jsonResponse({
            success: true,
            reportId,
            message: 'Report submitted successfully. Our safety and moderation team will review it.'
          });
        } catch (err: any) {
          return jsonResponse({ error: 'Failed to record report: ' + (err.message || 'Database error') }, 500);
        }
      }

      if (url.pathname === '/api/reports/my' && request.method === 'GET') {
        const auth = await getAuthenticatedUser(request, env);
        if (!auth) {
          return jsonResponse({ error: 'Authentication required' }, 401);
        }

        const reports = await env.DB.prepare(`
          SELECT id, target_type, target_name, category, details, status, stars_rewarded, created_at 
          FROM reports 
          WHERE reporter_id = ? 
          ORDER BY created_at DESC LIMIT 30
        `).bind(auth.user.id).all();

        return jsonResponse({ success: true, reports: reports.results });
      }

      // ==========================================
      // 11. CORS-FREE EDGE PROXY: MODELS & CHAT
      // ==========================================
      if (url.pathname === '/api/proxy/fetch-models' && request.method === 'POST') {
        const payload = await request.json() as any;
        const targetUrl = payload.endpoint;
        const apiKey = payload.apiKey;
        const customHeaders = payload.headers || {};

        if (!targetUrl) {
          return jsonResponse({ error: 'Endpoint URL is required' }, 400);
        }

        const fetchHeaders: Record<string, string> = {
          // Do not inject custom user agent to avoid upstream bot triggers
          'Accept': 'application/json',
          ...customHeaders
        };

        if (apiKey) {
          if (targetUrl.includes('anthropic.com')) {
            fetchHeaders['x-api-key'] = apiKey;
            fetchHeaders['anthropic-version'] = '2023-06-01';
          } else if (targetUrl.includes('elevenlabs.io')) {
            fetchHeaders['xi-api-key'] = apiKey;
          } else if (targetUrl.includes('deepgram.com')) {
            fetchHeaders['Authorization'] = `Token ${apiKey}`;
          } else if (targetUrl.includes('cartesia.ai')) {
            fetchHeaders['X-API-Key'] = apiKey;
            fetchHeaders['Cartesia-Version'] = '2024-06-10';
          } else if (targetUrl.includes('googleapis.com')) {
            fetchHeaders['x-goog-api-key'] = apiKey;
            if (targetUrl.includes('/openai/')) {
              fetchHeaders['Authorization'] = `Bearer ${apiKey}`;
            }
          } else {
            fetchHeaders['Authorization'] = `Bearer ${apiKey}`;
          }
        }

        let finalUrl = targetUrl;
        if (apiKey && targetUrl.includes('googleapis.com') && !targetUrl.includes('key=')) {
          finalUrl += (targetUrl.includes('?') ? '&' : '?') + `key=${encodeURIComponent(apiKey)}`;
        }

        try {
          const apiRes = await fetch(finalUrl, {
            method: 'GET',
            headers: fetchHeaders
          });
          const data = await apiRes.json();
          return jsonResponse({ success: apiRes.ok, status: apiRes.status, data }, apiRes.status);
        } catch (fetchErr: any) {
          return jsonResponse({ success: false, error: fetchErr.message || 'Failed to reach endpoint' }, 502);
        }
      }

      if (url.pathname === '/api/proxy/chat' && request.method === 'POST') {
        const payload = await request.json() as any;
        const targetUrl = payload.endpoint;
        const apiKey = payload.apiKey;
        const requestBody = payload.body;
        const customHeaders = payload.headers || {};

        if (!targetUrl || !requestBody) {
          return jsonResponse({ error: 'Endpoint and request body are required' }, 400);
        }

        // Sanitize conflicting token parameters across providers
        if (requestBody && typeof requestBody === 'object') {
          if (requestBody.max_tokens !== undefined && requestBody.max_completion_tokens !== undefined) {
            const isOModel = typeof requestBody.model === 'string' && /^o[13](-mini)?/i.test(requestBody.model);
            if (isOModel) {
              delete requestBody.max_tokens;
            } else {
              delete requestBody.max_completion_tokens;
            }
          }
        }

        console.log('[PROXY_CHAT]', JSON.stringify({
          targetUrl,
          model: requestBody?.model,
          stream: requestBody?.stream,
          messagesCount: requestBody?.messages?.length,
          lastMsg: requestBody?.messages?.[requestBody?.messages?.length - 1]?.content?.slice(0, 100)
        }));

        const fetchHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/event-stream, */*',
          ...customHeaders
        };

        if (apiKey) {
          if (targetUrl.includes('anthropic.com')) {
            fetchHeaders['x-api-key'] = apiKey;
            fetchHeaders['anthropic-version'] = '2023-06-01';
          } else if (targetUrl.includes('elevenlabs.io')) {
            fetchHeaders['xi-api-key'] = apiKey;
          } else if (targetUrl.includes('deepgram.com')) {
            fetchHeaders['Authorization'] = `Token ${apiKey}`;
          } else if (targetUrl.includes('cartesia.ai')) {
            fetchHeaders['X-API-Key'] = apiKey;
            fetchHeaders['Cartesia-Version'] = '2024-06-10';
          } else if (targetUrl.includes('googleapis.com')) {
            fetchHeaders['x-goog-api-key'] = apiKey;
            if (targetUrl.includes('/openai/')) {
              fetchHeaders['Authorization'] = `Bearer ${apiKey}`;
            }
          } else {
            fetchHeaders['Authorization'] = `Bearer ${apiKey}`;
          }
        }

        let finalUrl = targetUrl;
        if (apiKey && targetUrl.includes('googleapis.com') && !targetUrl.includes('key=')) {
          finalUrl += (targetUrl.includes('?') ? '&' : '?') + `key=${encodeURIComponent(apiKey)}`;
        }

        try {
          const apiRes = await fetch(finalUrl, {
            method: 'POST',
            headers: fetchHeaders,
            body: JSON.stringify(requestBody)
          });

          const upstreamContentType = apiRes.headers.get('Content-Type') || (requestBody?.stream ? 'text/event-stream; charset=utf-8' : 'application/json');
          return new Response(apiRes.body, {
            status: apiRes.status,
            headers: {
              'Content-Type': upstreamContentType,
              'Cache-Control': 'no-cache, no-transform',
              'Connection': 'keep-alive',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
              'Access-Control-Allow-Headers': '*'
            }
          });
        } catch (fetchErr: any) {
          return jsonResponse({ error: fetchErr.message || 'Failed to reach AI endpoint' }, 502);
        }
      }

      // ==========================================
      // 12. FREE CLOUD AI ROUTE (CLOUDFLARE WORKERS AI + FALLBACK)
      // ==========================================
      if (url.pathname === '/api/chat/demo' && request.method === 'POST') {
        const payload = await request.json() as any;
        const messages = (payload.messages || []).filter((m: any) => {
          if (!m || !m.content) return false;
          const text = String(m.content);
          return !text.includes('你好') &&
                 !text.includes('无法给到相关内容') &&
                 !text.includes('considered high risk') &&
                 !text.startsWith('⚠️');
        });
        const stream = Boolean(payload.stream);

        // Tier 1: Cloudflare Native Workers AI (Llama 3.1 8B Instruct FP8)
        if (env.AI) {
          try {
            const aiModel = '@cf/meta/llama-3.1-8b-instruct-fp8';
            const runOptions: Record<string, any> = {
              messages,
              stream: stream,
              max_tokens: typeof payload.max_tokens === 'number' ? Math.min(2048, Math.max(64, payload.max_tokens)) : 600,
              temperature: typeof payload.temperature === 'number' ? payload.temperature : 0.85,
              top_p: typeof payload.top_p === 'number' ? payload.top_p : 0.95
            };
            if (typeof payload.repetition_penalty === 'number') {
              runOptions.repetition_penalty = payload.repetition_penalty;
            }
            if (typeof payload.frequency_penalty === 'number') {
              runOptions.frequency_penalty = payload.frequency_penalty;
            }
            if (typeof payload.presence_penalty === 'number') {
              runOptions.presence_penalty = payload.presence_penalty;
            }

            if (stream) {
              const aiStream = await env.AI.run(aiModel, runOptions);
              return new Response(aiStream, {
                headers: {
                  'Content-Type': 'text/event-stream; charset=utf-8',
                  'Cache-Control': 'no-cache, no-transform',
                  'Connection': 'keep-alive',
                  'Access-Control-Allow-Origin': '*',
                  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                  'Access-Control-Allow-Headers': '*'
                }
              });
            } else {
              const result = await env.AI.run(aiModel, runOptions);
              const reply = result?.response || '';
              return jsonResponse({
                choices: [{
                  message: { role: 'assistant', content: reply },
                  finish_reason: 'stop'
                }]
              });
            }
          } catch (aiErr: any) {
            console.error('Workers AI execution failed, falling back:', aiErr);
          }
        }

        // Tier 2: Resilient Pollinations AI with anonymous fast tier
        try {
          const pollRes = await fetch('https://text.pollinations.ai/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages,
              model: 'openai-fast',
              temperature: payload.temperature || 0.85
            }),
            signal: AbortSignal.timeout(10000)
          });
          if (pollRes.ok) {
            const text = await pollRes.text();
            if (text && !text.includes('"error"') && !text.includes('你好') && !text.includes('无法给到相关内容') && text.length > 5) {
              if (stream) {
                // Return synthetic SSE stream so client stream reader works seamlessly
                const sseBody = `data: ${JSON.stringify({ choices: [{ delta: { content: text.trim() } }] })}\n\ndata: [DONE]\n\n`;
                return new Response(sseBody, {
                  headers: {
                    'Content-Type': 'text/event-stream; charset=utf-8',
                    'Cache-Control': 'no-cache, no-transform',
                    'Access-Control-Allow-Origin': '*'
                  }
                });
              } else {
                return jsonResponse({
                  choices: [{
                    message: { role: 'assistant', content: text.trim() },
                    finish_reason: 'stop'
                  }]
                });
              }
            }
          }
        } catch (pollErr: any) {
          console.error('Pollinations fallback failed:', pollErr);
        }

        // Tier 3: In-character warm fallback
        const safeFallback = '*Offers a warm, reassuring smile and gently touches your hand.* "I understand. Sometimes things get overwhelming, but you are not alone. We will take it one step at a time."';
        if (stream) {
          const sseBody = `data: ${JSON.stringify({ choices: [{ delta: { content: safeFallback } }] })}\n\ndata: [DONE]\n\n`;
          return new Response(sseBody, {
            headers: {
              'Content-Type': 'text/event-stream; charset=utf-8',
              'Cache-Control': 'no-cache, no-transform',
              'Access-Control-Allow-Origin': '*'
            }
          });
        } else {
          return jsonResponse({
            choices: [{
              message: { role: 'assistant', content: safeFallback },
              finish_reason: 'stop'
            }]
          });
        }
      }

      // Edge AI Image Generation (Free Tier / Keyless Selfie Engine)
      if (url.pathname === '/api/image/generate' && request.method === 'POST') {
        const body = await request.json().catch(() => ({})) as any;
        const prompt = body?.prompt;
        if (!prompt || typeof prompt !== 'string') {
          return jsonResponse({ error: 'Prompt is required' }, 400);
        }

        if (!env.AI) {
          return jsonResponse({ error: 'Workers AI binding is not configured' }, 503);
        }

        const cleanPrompt = prompt.trim().slice(0, 1000);
        let imageBase64: string | null = null;
        let usedModel = '';

        function bytesToBase64(bytes: Uint8Array): string {
          let binary = '';
          const len = bytes.byteLength;
          const chunkSize = 8192;
          for (let i = 0; i < len; i += chunkSize) {
            const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
            binary += String.fromCharCode.apply(null, chunk as any);
          }
          return btoa(binary);
        }

        // 1. Primary: Flux 1 Schnell
        try {
          const aiResult: any = await env.AI.run('@cf/black-forest-labs/flux-1-schnell', {
            prompt: cleanPrompt,
            steps: 4
          });
          if (aiResult?.image) {
            imageBase64 = `data:image/jpeg;base64,${aiResult.image}`;
            usedModel = 'flux-1-schnell';
          } else if (aiResult) {
            const buf = await new Response(aiResult).arrayBuffer();
            if (buf.byteLength > 0) {
              imageBase64 = `data:image/jpeg;base64,${bytesToBase64(new Uint8Array(buf))}`;
              usedModel = 'flux-1-schnell';
            }
          }
        } catch (fluxErr: any) {
          console.warn('Edge AI flux-1-schnell failed, trying fallback:', fluxErr?.message || fluxErr);
        }

        // 2. Secondary: SDXL Lightning (High speed)
        if (!imageBase64) {
          try {
            const aiResult: any = await env.AI.run('@cf/bytedance/stable-diffusion-xl-lightning', {
              prompt: cleanPrompt
            });
            if (aiResult?.image) {
              imageBase64 = `data:image/jpeg;base64,${aiResult.image}`;
              usedModel = 'sdxl-lightning';
            } else if (aiResult) {
              const buf = await new Response(aiResult).arrayBuffer();
              if (buf.byteLength > 0) {
                imageBase64 = `data:image/jpeg;base64,${bytesToBase64(new Uint8Array(buf))}`;
                usedModel = 'sdxl-lightning';
              }
            }
          } catch (sdErr: any) {
            console.warn('Edge AI sdxl-lightning failed, trying fallback:', sdErr?.message || sdErr);
          }
        }

        // 3. Tertiary: Stable Diffusion XL Base 1.0
        if (!imageBase64) {
          try {
            const aiResult: any = await env.AI.run('@cf/stabilityai/stable-diffusion-xl-base-1.0', {
              prompt: cleanPrompt
            });
            if (aiResult?.image) {
              imageBase64 = `data:image/jpeg;base64,${aiResult.image}`;
              usedModel = 'sdxl-base';
            } else if (aiResult) {
              const buf = await new Response(aiResult).arrayBuffer();
              if (buf.byteLength > 0) {
                imageBase64 = `data:image/jpeg;base64,${bytesToBase64(new Uint8Array(buf))}`;
                usedModel = 'sdxl-base';
              }
            }
          } catch (baseErr: any) {
            console.warn('Edge AI sdxl-base failed:', baseErr?.message || baseErr);
          }
        }

        if (imageBase64) {
          return jsonResponse({
            success: true,
            url: imageBase64,
            model: usedModel
          });
        }

        return jsonResponse({
          error: 'Free Edge Image Generation is temporarily congested. Please retry in a few moments.'
        }, 503);
      }

      return jsonResponse({ error: 'Endpoint not found' }, 404);
    } catch (err: any) {
      return jsonResponse({ error: err.message || 'Internal Edge Error' }, 500);
    }
  }
};
