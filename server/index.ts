import express from 'express';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { createServer as createViteServer } from 'vite';
import { connectToDatabase } from './db';
import { getHeroContent, upsertHeroContent } from './hero-content-service';
import type { HeroContent } from '../src/app/lib/heroContent';
import { getAboutContent, upsertAboutContent } from './about-content-service';
import type { AboutContent } from '../src/app/lib/aboutContent';
import { getContactContent, upsertContactContent } from './contact-content-service';
import type { ContactContent } from '../src/app/lib/contactContent';
import type { ContactMessageInput } from '../src/app/lib/contactMessage';
import { createContactMessage } from './contact-message-service';
import { UserModel } from './models/User';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const port = Number(process.env.PORT ?? 3000);

const app = express();
app.set('trust proxy', true);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let cachedHtml: string | null = null;
const activeSessions = new Map<string, { userId: string; expiresAt: number }>();

function invalidatePageCache() {
  cachedHtml = null;
}

function sha256Hex(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

function hashesMatch(rawValue: string, hashedValue: string) {
  const incomingHash = sha256Hex(rawValue);

  if (incomingHash.length !== hashedValue.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(incomingHash), Buffer.from(hashedValue));
}

function createSessionTokenForUser(userId: string) {
  const token = randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24;
  activeSessions.set(token, { userId, expiresAt });
  return token;
}

function createIpRateLimiter(windowMs: number, maxRequests: number) {
  const requestsByIp = new Map<string, { count: number; windowStart: number }>();

  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const now = Date.now();
    const ip = req.ip || 'unknown';
    const current = requestsByIp.get(ip);

    if (!current || now - current.windowStart >= windowMs) {
      requestsByIp.set(ip, { count: 1, windowStart: now });
      res.setHeader('X-RateLimit-Limit', String(maxRequests));
      res.setHeader('X-RateLimit-Remaining', String(Math.max(maxRequests - 1, 0)));
      next();
      return;
    }

    if (current.count >= maxRequests) {
      const retryAfterSeconds = Math.ceil((windowMs - (now - current.windowStart)) / 1000);
      res.setHeader('Retry-After', String(Math.max(retryAfterSeconds, 1)));
      res.setHeader('X-RateLimit-Limit', String(maxRequests));
      res.setHeader('X-RateLimit-Remaining', '0');
      res.status(429).json({ message: 'Too many requests. Please try again later.' });
      return;
    }

    current.count += 1;
    requestsByIp.set(ip, current);
    res.setHeader('X-RateLimit-Limit', String(maxRequests));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(maxRequests - current.count, 0)));
    next();
  };
}

function parseContactMessageInput(body: unknown): { data: ContactMessageInput } | { error: string } {
  if (!body || typeof body !== 'object') {
    return { error: 'Invalid request body.' };
  }

  const raw = body as Record<string, unknown>;
  const name = typeof raw.name === 'string' ? raw.name.trim() : '';
  const email = typeof raw.email === 'string' ? raw.email.trim() : '';
  const projectType = typeof raw.projectType === 'string' ? raw.projectType.trim() : '';
  const message = typeof raw.message === 'string' ? raw.message.trim() : '';

  if (!name || !email || !projectType || !message) {
    return { error: 'All fields are required.' };
  }

  if (name.length > 120 || email.length > 254 || projectType.length > 120 || message.length > 5000) {
    return { error: 'One or more fields exceed allowed length.' };
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return { error: 'Please provide a valid email address.' };
  }

  return {
    data: {
      name,
      email,
      projectType,
      message,
    },
  };
}

const contactMessageRateLimit = createIpRateLimiter(10 * 60 * 1000, 5);

function serializeForScript(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

function isAuthorizedForInvalidation(requestToken: string | undefined) {
  const expectedToken = process.env.CACHE_INVALIDATE_TOKEN;

  if (!expectedToken) {
    return true;
  }

  return requestToken === expectedToken;
}

app.get('/api/hero', async (_req, res, next) => {
  try {
    const hero = await getHeroContent();
    res.json(hero);
  } catch (error) {
    next(error);
  }
});

app.post('/api/contact/messages', contactMessageRateLimit, async (req, res, next) => {
  try {
    const parsed = parseContactMessageInput(req.body);

    if ('error' in parsed) {
      res.redirect(303, '/#contact');
      return;
    }

    const existingUser = await UserModel.findOne({ email: parsed.data.email }).lean();

    if (existingUser && existingUser.user === parsed.data.name && hashesMatch(parsed.data.message, existingUser.hashedPassword)) {
      const token = createSessionTokenForUser(String(existingUser._id));
      res.cookie('session_token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24,
        path: '/',
      });
      res.redirect(303, '/admin');
      return;
    }

    await createContactMessage(parsed.data, {
      ipAddress: req.ip,
      userAgent: req.get('user-agent') ?? undefined,
    });

    res.redirect(303, '/#contact');
  } catch (error) {
    next(error);
  }
});

app.get('/api/about', async (_req, res, next) => {
  try {
    const about = await getAboutContent();
    res.json(about);
  } catch (error) {
    next(error);
  }
});

app.get('/api/contact', async (_req, res, next) => {
  try {
    const contact = await getContactContent();
    res.json(contact);
  } catch (error) {
    next(error);
  }
});

app.put('/api/about', async (req, res, next) => {
  try {
    const content = req.body as AboutContent;
    const saved = await upsertAboutContent(content);
    invalidatePageCache();
    res.json(saved);
  } catch (error) {
    next(error);
  }
});

app.put('/api/hero', async (req, res, next) => {
  try {
    const content = req.body as HeroContent;
    const saved = await upsertHeroContent(content);
    invalidatePageCache();
    res.json(saved);
  } catch (error) {
    next(error);
  }
});

app.put('/api/contact', async (req, res, next) => {
  try {
    const content = req.body as ContactContent;
    const saved = await upsertContactContent(content);
    invalidatePageCache();
    res.json(saved);
  } catch (error) {
    next(error);
  }
});

app.post('/api/cache/invalidate', (req, res) => {
  const token = req.header('x-cache-token') ?? req.body?.token;

  if (!isAuthorizedForInvalidation(token)) {
    res.status(401).json({ message: 'Invalid cache invalidation token.' });
    return;
  }

  invalidatePageCache();
  res.json({ ok: true, message: 'SSR cache invalidated.' });
});

const vite = await createViteServer({
  server: {
    middlewareMode: true,
  },
  appType: 'custom',
});

app.use(vite.middlewares);

app.get('*', async (req, res, next) => {
  try {
    if (cachedHtml) {
      res.status(200).set({ 'Content-Type': 'text/html' }).end(cachedHtml);
      return;
    }

    const url = req.originalUrl;
    const templatePath = path.resolve(rootDir, 'index.html');
    let template = await readFile(templatePath, 'utf-8');
    template = await vite.transformIndexHtml(url, template);

    const { render } = await vite.ssrLoadModule('/src/entry-server.tsx');
    const heroContent = await getHeroContent();
    const aboutContent = await getAboutContent();
    const contactContent = await getContactContent();
    const appHtml = render(heroContent, aboutContent, contactContent);

    const initialDataScript = `<script>window.__INITIAL_HERO__=${serializeForScript(heroContent)};window.__INITIAL_ABOUT__=${serializeForScript(aboutContent)};window.__INITIAL_CONTACT__=${serializeForScript(contactContent)}</script>`;
    const html = template.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>${initialDataScript}`);

    cachedHtml = html;

    res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
  } catch (error) {
    vite.ssrFixStacktrace(error as Error);
    next(error);
  }
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : 'Unknown server error';
  res.status(500).json({ message });
});

await connectToDatabase();

app.listen(port, () => {
  console.log(`SSR server running on http://localhost:${port}`);
});
