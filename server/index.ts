import express from 'express';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import { connectToDatabase } from './db';
import { getHeroContent, upsertHeroContent } from './hero-content-service';
import type { HeroContent } from '../src/app/lib/heroContent';
import { getAboutContent, upsertAboutContent } from './about-content-service';
import type { AboutContent } from '../src/app/lib/aboutContent';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const port = Number(process.env.PORT ?? 3000);

const app = express();
app.use(express.json());

let cachedHtml: string | null = null;

function invalidatePageCache() {
  cachedHtml = null;
}

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

app.get('/api/about', async (_req, res, next) => {
  try {
    const about = await getAboutContent();
    res.json(about);
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
    const appHtml = render(heroContent, aboutContent);

    const initialDataScript = `<script>window.__INITIAL_HERO__=${serializeForScript(heroContent)};window.__INITIAL_ABOUT__=${serializeForScript(aboutContent)}</script>`;
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
