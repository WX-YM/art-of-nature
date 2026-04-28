import express from 'express';
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { createServer as createViteServer } from 'vite';
import { connectToDatabase } from './db';
import { getHeroContent, upsertHeroContent } from './hero-content-service';
import { getGalleryContent, normalizeGalleryContent, upsertGalleryContent } from './gallery-content-service';
import { getJournalContent, normalizeJournalContent, upsertJournalContent } from './journal-content-service';
import { render as renderApp } from '../src/entry-server';
import { type GalleryContent, type GalleryPiece } from '../src/app/lib/gallery';
import type { GalleryPreviewContent, GalleryShellContent } from '../src/app/lib/gallery-public';
import { defaultHeroContent, type HeroContent } from '../src/app/lib/heroContent';
import { getAboutContent, upsertAboutContent } from './about-content-service';
import { defaultAboutContent, type AboutContent } from '../src/app/lib/aboutContent';
import { getContactContent, upsertContactContent } from './contact-content-service';
import { defaultContactContent, type ContactContent } from '../src/app/lib/contactContent';
import { getCraftsmanshipContent, upsertCraftsmanshipContent } from './craftsmanship-content-service';
import { defaultCraftsmanshipContent, type CraftsmanshipContent } from '../src/app/lib/craftsmanshipContent';
import {
  getJournalPostBySlug,
  getPublishedJournalPosts,
  slugifyJournalValue,
  type JournalContent,
  type JournalPost,
} from '../src/app/lib/journal';
import { createContactMessage } from './contact-message-service';
import { getVisitCount, incrementVisitCount } from './site-visit-service';
import { ContactMessageModel } from './models/ContactMessage';
import { UserModel } from './models/User';
import { ForwardingSettingsModel } from './models/ForwardingSettings';
import {
  createIpRateLimiter,
  escapeHtml,
  getCookieValue,
  hashesMatch,
  isAuthorizedForInvalidation,
  parseContactMessageInput,
  serializeForScript,
} from './http-utils';
import {
  uploadsDir,
  saveUploadedImage,
  listUploadEntries,
  createUploadFolder,
  getUploadFile,
  deleteUpload,
  deleteUploadFolder,
} from './upload-service';
import { MemoryCache } from './memory-cache';
import { cacheDurations, setImmutableImageCache, setNoStore, setPublicJsonCache, setPublicSsrCache } from './cache-policy';
import {
  buildGalleryPreviewContent,
  buildGalleryShellContent,
  buildPublicGalleryPieceDetail,
  buildPublicGallerySummary,
} from './gallery-public-service';
import { clearPublicImageVariantCache, parsePublicImageVariantRequest, resolvePublicImageVariant } from './public-image-service';
import { galleryPieceDetailRateLimit, gallerySummaryRateLimit, publicImageVariantRateLimit } from './public-rate-limiters';

const downloadsDir = path.resolve(uploadsDir, 'downloads');
import {
  deleteGalleryCategoryRecord,
  getRankedGalleryCategories,
  seedStructuredContent,
  upsertGalleryCategoryStructure,
  upsertGalleryCategoryRecord,
} from './structured-content-service';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const port = Number(process.env.PORT ?? 3000);

const app = express();
app.set('trust proxy', true);
app.use(express.json({ limit: '32mb' }));
app.use(express.urlencoded({ extended: true, limit: '32mb' }));
app.use('/uploads', express.static(uploadsDir));
app.use('/downloads', express.static(downloadsDir));
app.use('/api', (req, res, next) => {
  setNoStore(res);
  next();
});
app.use('/admin', (req, res, next) => {
  setNoStore(res);
  next();
});

const ssrHtmlCache = new MemoryCache<string>(cacheDurations.pageShell * 1000);
const gallerySummaryCache = new MemoryCache<ReturnType<typeof buildPublicGallerySummary>>(cacheDurations.gallerySummary * 1000);
const galleryPieceDetailCache = new MemoryCache<NonNullable<ReturnType<typeof buildPublicGalleryPieceDetail>>>(
  cacheDurations.galleryPieceDetail * 1000
);
const activeSessions = new Map<string, { userId: string; expiresAt: number }>();
const contactRequestsByIp = new Map<string, { count: number; windowStart: number }>();
const pendingGoogleOAuthStates = new Map<string, {
  userId: string;
  expiresAt: number;
  forwardToEmail: string;
  gmailAddress: string;
  googleClientId: string;
  googleClientSecret: string;
}>();

function invalidatePageCache() {
  ssrHtmlCache.clear();
}

async function invalidatePublicGalleryCaches() {
  ssrHtmlCache.clear();
  gallerySummaryCache.clear();
  galleryPieceDetailCache.clear();
  await clearPublicImageVariantCache();
}

function createSessionTokenForUser(userId: string) {
  const token = randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24;
  activeSessions.set(token, { userId, expiresAt });
  return token;
}

function getActiveSessionFromRequest(req: express.Request) {
  const sessionToken = getCookieValue(req.header('cookie'), 'session_token');
  if (!sessionToken) {
    return null;
  }

  const session = activeSessions.get(sessionToken);
  if (!session) {
    return null;
  }

  if (session.expiresAt <= Date.now()) {
    activeSessions.delete(sessionToken);
    return null;
  }

  return session;
}

function respondHiddenNotFound(res: express.Response) {
  res.status(404).set({ 'Content-Type': 'text/plain; charset=utf-8' }).send('Not Found');
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getContactRedirectUrl(status: 'success' | 'error' | 'rate-limit') {
  return `/?contact=${status}#contact`;
}

function shouldUseSecureCookies(req: express.Request) {
  const host = (req.get('host') ?? '').toLowerCase();
  const forwardedProto = (req.get('x-forwarded-proto') ?? '').split(',')[0]?.trim().toLowerCase();
  const isLocalHost =
    host.startsWith('localhost') ||
    host.startsWith('127.0.0.1') ||
    host.startsWith('[::1]');

  if (isLocalHost) {
    return false;
  }

  return req.secure || forwardedProto === 'https';
}

function isMessageStatus(value: unknown): value is 'new' | 'seen' {
  return value === 'new' || value === 'seen';
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getGoogleOAuthRedirectUri(req: express.Request) {
  return `${req.protocol}://${req.get('host')}/admin/email/google/callback`;
}

function slugifyEditorValue(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

type PublicRouteMatch =
  | { kind: 'home' }
  | { kind: 'gallery' }
  | { kind: 'journal-index' }
  | { kind: 'journal-article'; slug: string };

function matchPublicRoute(pathname: string): PublicRouteMatch {
  if (pathname === '/gallery') {
    return { kind: 'gallery' };
  }

  if (pathname === '/journal') {
    return { kind: 'journal-index' };
  }

  if (pathname.startsWith('/journal/')) {
    return {
      kind: 'journal-article',
      slug: pathname.slice('/journal/'.length).trim(),
    };
  }

  return { kind: 'home' };
}

function parseIntegerField(body: unknown, fieldName: string, fallback: number = 0) {
  if (!body || typeof body !== 'object') {
    return fallback;
  }

  const raw = (body as Record<string, unknown>)[fieldName];
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return Math.trunc(raw);
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) {
      return fallback;
    }

    const parsed = Number(trimmed);
    if (Number.isFinite(parsed)) {
      return Math.trunc(parsed);
    }
  }

  return fallback;
}

function isUploadClientErrorMessage(message: string) {
  return (
    message.startsWith('Invalid') ||
    message.startsWith('Missing') ||
    message === 'File not found.' ||
    message === 'Folder not found.'
  );
}

type SeoMetadata = {
  title: string;
  description: string;
  canonicalPath: string;
  imageUrl: string;
  ogType: 'website' | 'article';
  robots: string;
  articlePublishedTime?: string;
  jsonLd: Record<string, unknown>[];
};

function normalizeSeoText(value: string | undefined, fallback: string) {
  if (!value) {
    return fallback;
  }

  const normalized = value.replace(/\s+/g, ' ').trim();
  return normalized || fallback;
}

function resolveSiteOrigin(req: express.Request) {
  const configuredOrigin = process.env.PUBLIC_SITE_URL ?? process.env.SITE_URL;

  if (configuredOrigin) {
    try {
      return new URL(configuredOrigin).origin;
    } catch {
      // Ignore invalid URL values and fall back to request origin.
    }
  }

  const forwardedProto = (req.get('x-forwarded-proto') ?? '').split(',')[0]?.trim();
  const protocol = forwardedProto || req.protocol || 'https';
  return `${protocol}://${req.get('host')}`;
}

function toAbsoluteUrl(origin: string, value: string) {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const normalizedPath = value.startsWith('/') ? value : `/${value}`;
  return `${origin}${normalizedPath}`;
}

function injectSeoTags(template: string, seoTags: string) {
  const withoutTitle = template.replace(/<title>[\s\S]*?<\/title>\s*/i, '');
  const withoutDescription = withoutTitle.replace(/<meta\s+name=("|')description\1[^>]*>\s*/i, '');
  const withoutCanonical = withoutDescription.replace(/<link\s+rel=("|')canonical\1[^>]*>\s*/i, '');
  const withoutRobots = withoutCanonical.replace(/<meta\s+name=("|')robots\1[^>]*>\s*/i, '');

  return withoutRobots.replace('</head>', `    ${seoTags}\n  </head>`);
}

function getSeoMetadata(
  pathname: string,
  origin: string,
  heroContent: HeroContent,
  galleryContent: GalleryContent | null,
  journalContent: JournalContent | null
): SeoMetadata {
  const defaultImage = toAbsoluteUrl(origin, heroContent.backgroundImageUrl);
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Art of Nature',
    url: origin,
  };
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Art of Nature',
    url: origin,
    logo: defaultImage,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+20 103 042 2422',
        contactType: 'customer service',
        availableLanguage: ['English', 'Arabic'],
      },
    ],
  };

  if (pathname === '/gallery') {
    return {
      title: 'Gallery | Art of Nature',
      description: normalizeSeoText(
        galleryContent?.pageDescription,
        'Browse bespoke handcrafted furniture and interior craftsmanship from Art of Nature.'
      ),
      canonicalPath: '/gallery',
      imageUrl: defaultImage,
      ogType: 'website',
      robots: 'index, follow, max-image-preview:large',
      jsonLd: [websiteJsonLd, organizationJsonLd],
    };
  }

  if (pathname === '/journal') {
    return {
      title: 'Journal | Art of Nature',
      description: normalizeSeoText(
        journalContent?.pageDescription,
        'Read material notes and studio insights from Art of Nature craftsmanship.'
      ),
      canonicalPath: '/journal',
      imageUrl: defaultImage,
      ogType: 'website',
      robots: 'index, follow, max-image-preview:large',
      jsonLd: [websiteJsonLd, organizationJsonLd],
    };
  }

  if (pathname.startsWith('/journal/')) {
    const slug = pathname.slice('/journal/'.length);
    const post = journalContent ? getJournalPostBySlug(journalContent, slug) : null;

    if (post) {
      return {
        title: `${normalizeSeoText(post.title, 'Journal Article')} | Art of Nature`,
        description: normalizeSeoText(
          post.excerpt,
          'Studio journal entry from Art of Nature on design and craftsmanship.'
        ),
        canonicalPath: `/journal/${post.slug}`,
        imageUrl: toAbsoluteUrl(origin, post.coverImageUrl),
        ogType: 'article',
        robots: 'index, follow, max-image-preview:large',
        articlePublishedTime: post.publishedAt,
        jsonLd: [
          websiteJsonLd,
          organizationJsonLd,
          {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt,
            image: [toAbsoluteUrl(origin, post.coverImageUrl)],
            datePublished: post.publishedAt,
            dateModified: post.publishedAt,
            mainEntityOfPage: `${origin}/journal/${post.slug}`,
            publisher: {
              '@type': 'Organization',
              name: 'Art of Nature',
              logo: {
                '@type': 'ImageObject',
                url: defaultImage,
              },
            },
          },
        ],
      };
    }

    return {
      title: 'Article not found | Art of Nature',
      description: 'The requested journal article could not be found.',
      canonicalPath: pathname,
      imageUrl: defaultImage,
      ogType: 'website',
      robots: 'noindex, nofollow',
      jsonLd: [websiteJsonLd, organizationJsonLd],
    };
  }

  return {
    title: 'Art of Nature | Bespoke Gallery',
    description: normalizeSeoText(
      heroContent.description,
      'Art of Nature showcases bespoke handcrafted furniture and interiors with quiet craftsmanship.'
    ),
    canonicalPath: '/',
    imageUrl: defaultImage,
    ogType: 'website',
    robots: 'index, follow, max-image-preview:large',
    jsonLd: [websiteJsonLd, organizationJsonLd],
  };
}

function renderSeoTags(origin: string, metadata: SeoMetadata) {
  const canonicalUrl = `${origin}${metadata.canonicalPath === '/' ? '/' : metadata.canonicalPath}`;
  const jsonLdMarkup = metadata.jsonLd
    .map((value) => `<script type="application/ld+json">${JSON.stringify(value)}</script>`)
    .join('\n    ');

  const tags = [
    `<title>${escapeHtml(metadata.title)}</title>`,
    `<meta name="description" content="${escapeHtml(metadata.description)}" />`,
    `<meta name="robots" content="${escapeHtml(metadata.robots)}" />`,
    `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`,
    '<meta property="og:site_name" content="Art of Nature" />',
    '<meta property="og:locale" content="en_US" />',
    `<meta property="og:type" content="${metadata.ogType}" />`,
    `<meta property="og:title" content="${escapeHtml(metadata.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(metadata.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`,
    `<meta property="og:image" content="${escapeHtml(metadata.imageUrl)}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${escapeHtml(metadata.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(metadata.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(metadata.imageUrl)}" />`,
    '<meta name="theme-color" content="#1f1a17" />',
  ];

  if (metadata.articlePublishedTime) {
    tags.push(`<meta property="article:published_time" content="${escapeHtml(metadata.articlePublishedTime)}" />`);
  }

  if (jsonLdMarkup) {
    tags.push(jsonLdMarkup);
  }

  return tags.join('\n    ');
}

function parseGalleryPiecesJson(body: unknown): GalleryPiece[] {
  if (!body || typeof body !== 'object') {
    throw new Error('Invalid gallery pieces.');
  }

  const raw = (body as Record<string, unknown>).galleryPiecesJson;
  if (typeof raw !== 'string' || raw.length > 2_000_000) {
    throw new Error('Invalid gallery pieces.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Invalid gallery pieces.');
  }

  if (!Array.isArray(parsed)) {
    throw new Error('Invalid gallery pieces.');
  }

  return parsed
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }

      const rawPiece = entry as Record<string, unknown>;
      const title = typeof rawPiece.title === 'string' ? rawPiece.title.trim() : '';
      const material = typeof rawPiece.material === 'string' ? rawPiece.material.trim() : '';
      const note = typeof rawPiece.note === 'string' ? rawPiece.note.trim() : '';
      const category = typeof rawPiece.category === 'string' ? rawPiece.category.trim() : '';
      const subcategory = typeof rawPiece.subcategory === 'string' ? rawPiece.subcategory.trim() : '';
      const featured = rawPiece.featured === true;
      const imageUrls = Array.isArray(rawPiece.imageUrls)
        ? rawPiece.imageUrls
            .map((item) => (typeof item === 'string' ? item.trim() : ''))
            .filter(Boolean)
        : [];
      const coverImageUrl =
        typeof rawPiece.coverImageUrl === 'string' ? rawPiece.coverImageUrl.trim() : '';

      if (!title || !material || !note || !category || !subcategory || imageUrls.length === 0) {
        return null;
      }

      const images = imageUrls.map((src, index) => ({
        src,
        alt: `${title} image ${index + 1}`,
      }));
      const coverImage = images.find((image) => image.src === coverImageUrl) ?? images[0];

      const idSource =
        typeof rawPiece.id === 'string' && rawPiece.id.trim()
          ? rawPiece.id.trim()
          : title;

      return {
        id: slugifyEditorValue(idSource),
        title,
        category,
        subcategory,
        material,
        note,
        archiveCount: images.length,
        featured,
        image: coverImage,
        images,
      } as GalleryPiece;
    })
    .filter((piece): piece is GalleryPiece => piece !== null);
}

function parseJournalPostsJson(body: unknown): JournalPost[] {
  if (!body || typeof body !== 'object') {
    throw new Error('Invalid journal posts.');
  }

  const raw = (body as Record<string, unknown>).journalPostsJson;
  if (typeof raw !== 'string' || raw.length > 2_000_000) {
    throw new Error('Invalid journal posts.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Invalid journal posts.');
  }

  if (!Array.isArray(parsed)) {
    throw new Error('Invalid journal posts.');
  }

  return parsed
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }

      const rawPost = entry as Record<string, unknown>;
      const title = typeof rawPost.title === 'string' ? rawPost.title.trim() : '';
      const excerpt = typeof rawPost.excerpt === 'string' ? rawPost.excerpt.trim() : '';
      const category = typeof rawPost.category === 'string' ? rawPost.category.trim() : '';
      const publishedAt = typeof rawPost.publishedAt === 'string' ? rawPost.publishedAt.trim() : '';
      const coverImageUrl =
        typeof rawPost.coverImageUrl === 'string' ? rawPost.coverImageUrl.trim() : '';
      const coverImageAlt =
        typeof rawPost.coverImageAlt === 'string' ? rawPost.coverImageAlt.trim() : '';
      const bodyText = typeof rawPost.body === 'string' ? rawPost.body.trim() : '';
      const published = rawPost.published !== false;
      const featured = rawPost.featured === true;
      const galleryImageUrls = Array.isArray(rawPost.galleryImageUrls)
        ? rawPost.galleryImageUrls
            .map((item) => (typeof item === 'string' ? item.trim() : ''))
            .filter(Boolean)
        : [];

      if (!title || !excerpt || !category || !publishedAt || !coverImageUrl || !bodyText) {
        return null;
      }

      const idSource =
        typeof rawPost.id === 'string' && rawPost.id.trim()
          ? rawPost.id.trim()
          : typeof rawPost.slug === 'string' && rawPost.slug.trim()
            ? rawPost.slug.trim()
            : title;
      const slugSource =
        typeof rawPost.slug === 'string' && rawPost.slug.trim()
          ? rawPost.slug.trim()
          : title;

      const id = slugifyEditorValue(idSource);
      const slug = slugifyJournalValue(slugSource);

      if (!id || !slug) {
        return null;
      }

      return {
        id,
        slug,
        title,
        excerpt,
        category,
        publishedAt,
        featured,
        published,
        coverImageUrl,
        coverImageAlt: coverImageAlt || `${title} cover image`,
        galleryImageUrls: Array.from(new Set([coverImageUrl, ...galleryImageUrls])),
        body: bodyText,
      } as JournalPost;
    })
    .filter((post): post is JournalPost => post !== null);
}

import {
  parseRequiredStringField,
  parseMultilineField,
  toContactLinksText,
  toCraftsmanshipItemsText,
  parseDirectContacts,
  parseCraftsmanshipItems
} from './admin-utils';

async function getAuthenticatedUser(req: express.Request) {
  const session = getActiveSessionFromRequest(req);

  if (!session) {
    return null;
  }

  const user = await UserModel.findById(session.userId).lean();
  if (!user) {
    return null;
  }

  return user;
}

const contactMessageRateLimit = createIpRateLimiter(10 * 60 * 1000, 5);
const siteVisitTrackRateLimit = createIpRateLimiter(60 * 60 * 1000, 1);

const contactRateLimitWindowMs = 10 * 60 * 1000;
const contactRateLimitCleanupTimer = setInterval(() => {
  const now = Date.now();

  for (const [ipAddress, current] of contactRequestsByIp.entries()) {
    if (now - current.windowStart >= contactRateLimitWindowMs) {
      contactRequestsByIp.delete(ipAddress);
    }
  }
}, Math.max(contactRateLimitWindowMs, 60000));
contactRateLimitCleanupTimer.unref();

function isContactSubmissionRateLimited(ipAddress: string, now: number) {
  const windowMs = contactRateLimitWindowMs;
  const maxRequests = 5;
  const current = contactRequestsByIp.get(ipAddress);

  if (!current || now - current.windowStart >= windowMs) {
    contactRequestsByIp.set(ipAddress, { count: 1, windowStart: now });
    return false;
  }

  if (current.count >= maxRequests) {
    return true;
  }

  current.count += 1;
  contactRequestsByIp.set(ipAddress, current);
  return false;
}

app.get('/api/hero', async (_req, res, next) => {
  try {
    const hero = await getHeroContent();
    res.json(hero);
  } catch (error) {
    next(error);
  }
});

app.get('/admin', async (req, res, next) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      respondHiddenNotFound(res);
      return;
    }

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');

    const adminUrl = new URL(req.originalUrl, 'http://localhost');
    const requestedTab = adminUrl.searchParams.get('tab');
    const activeTab =
      requestedTab === 'messages' || requestedTab === 'gallery' || requestedTab === 'journal'
        ? requestedTab
        : 'content';
    const searchQuery = adminUrl.searchParams.get('q')?.trim() ?? '';
    const messageStatusFilter = adminUrl.searchParams.get('messageStatus');
    const statusFilter = isMessageStatus(messageStatusFilter) ? messageStatusFilter : 'all';

    const messageQuery: Record<string, unknown> = {};
    if (statusFilter !== 'all') {
      messageQuery.status = statusFilter;
    }

    if (searchQuery) {
      const searchPattern = new RegExp(escapeRegex(searchQuery), 'i');
      messageQuery.$or = [
        { name: searchPattern },
        { email: searchPattern },
        { phone: searchPattern },
        { projectType: searchPattern },
        { message: searchPattern },
      ];
    }

    const [totalVisits, totalContactMessages, hero, about, gallery, journal, contact, craftsmanship, contactMessages, forwardingSettingsDoc] = await Promise.all([
      getVisitCount(),
      ContactMessageModel.countDocuments(),
      getHeroContent(),
      getAboutContent(),
      getGalleryContent(),
      getJournalContent(),
      getContactContent(),
      getCraftsmanshipContent(),
      activeTab === 'messages'
        ? ContactMessageModel.find(messageQuery).sort({ createdAt: -1 }).limit(200).lean()
        : Promise.resolve([]),
      ForwardingSettingsModel.findOne<{
        enabled?: boolean;
        forwardToEmail?: string;
        gmailAddress?: string;
        googleClientId?: string;
        googleClientSecret?: string;
        googleRefreshToken?: string;
      }>({ key: 'contact-forwarding' }).lean(),
    ]);
    const forwardingSettings = {
      enabled: forwardingSettingsDoc?.enabled === true,
      forwardToEmail: forwardingSettingsDoc?.forwardToEmail ?? '',
      gmailAddress: forwardingSettingsDoc?.gmailAddress ?? '',
      googleClientId: forwardingSettingsDoc?.googleClientId ?? '',
      googleClientSecret: forwardingSettingsDoc?.googleClientSecret ?? '',
      connected: Boolean(forwardingSettingsDoc?.googleRefreshToken),
    };
    const safeUserName = escapeHtml(user.user);
    const status = adminUrl.searchParams.get('status');
    const statusMessage =
      status === 'saved'
        ? 'Content saved.'
        : status === 'reset'
          ? 'Content reset to defaults.'
          : status === 'invalid'
            ? 'Invalid form values.'
            : status === 'message-updated'
              ? 'Message status updated.'
              : status === 'message-deleted'
                ? 'Message deleted.'
                : status === 'gmail-connected'
                  ? 'Gmail forwarding connected successfully.'
                  : status === 'gmail-disconnected'
                    ? 'Gmail forwarding disconnected.'
                    : status === 'gmail-invalid'
                        ? 'Invalid Gmail forwarding values.'
                      : status === 'gmail-failed'
                        ? 'Could not complete Gmail OAuth. Please try again.'
            : '';

    const galleryEditorState = {
      pieces: gallery.pieces.map((piece) => ({
        id: piece.id,
        title: piece.title,
        category: piece.category,
        subcategory: piece.subcategory,
        material: piece.material,
        note: piece.note,
        featured: piece.featured === true,
        coverImageUrl: piece.image.src,
        imageUrls: piece.images.map((image) => image.src),
      })),
      categories: gallery.categories,
    };

    const journalEditorState = {
      posts: journal.posts.map((post) => ({
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        category: post.category,
        publishedAt: post.publishedAt,
        featured: post.featured === true,
        published: post.published !== false,
        coverImageUrl: post.coverImageUrl,
        coverImageAlt: post.coverImageAlt,
        galleryImageUrls: post.galleryImageUrls,
        body: post.body,
      })),
    };

    const messageRowsHtml =
      activeTab !== 'messages'
        ? ''
        : contactMessages.length === 0
          ? '<tr><td colspan="8" style="padding:0.9rem; text-align:center; color:#6b7280;">No messages found.</td></tr>'
          : contactMessages
              .map((entry) => {
                const id = String((entry as { _id?: unknown })._id ?? '');
                const name = escapeHtml(String((entry as { name?: unknown }).name ?? ''));
                const email = escapeHtml(String((entry as { email?: unknown }).email ?? ''));
                const phone = escapeHtml(String((entry as { phone?: unknown }).phone ?? ''));
                const projectType = escapeHtml(String((entry as { projectType?: unknown }).projectType ?? ''));
                const message = escapeHtml(String((entry as { message?: unknown }).message ?? '')).replaceAll('\n', '<br />');
                const statusValue = isMessageStatus((entry as { status?: unknown }).status)
                  ? (entry as { status: 'new' | 'seen' }).status
                  : 'new';
                const createdAtRaw = (entry as { createdAt?: unknown }).createdAt;
                const createdAt = createdAtRaw ? escapeHtml(new Date(String(createdAtRaw)).toLocaleString()) : '—';
                const statusLabel = statusValue === 'seen' ? 'Seen' : 'New';
                const statusColor = statusValue === 'seen' ? '#2563eb' : '#059669';
                const nextStatus = statusValue === 'seen' ? 'new' : 'seen';
                const nextStatusButton = statusValue === 'seen' ? 'Mark New' : 'Mark Seen';

                return `<tr>
                  <td>${name}</td>
                  <td>${email}</td>
                  <td>${phone || '—'}</td>
                  <td>${projectType}</td>
                  <td style="max-width:300px;">${message}</td>
                  <td>${createdAt}</td>
                  <td><span style="display:inline-block; padding:0.2rem 0.55rem; border-radius:999px; font-size:0.75rem; color:#fff; background:${statusColor};">${statusLabel}</span></td>
                  <td class="message-actions">
                    <form method="post" action="/admin/messages/${id}/status">
                      <input type="hidden" name="status" value="${nextStatus}" />
                      <input type="hidden" name="q" value="${escapeHtml(searchQuery)}" />
                      <input type="hidden" name="messageStatus" value="${statusFilter}" />
                      <button type="submit" class="button-dark">${nextStatusButton}</button>
                    </form>
                    <form method="post" action="/admin/messages/${id}/delete" onsubmit="return confirm('Delete this contact message?');">
                      <input type="hidden" name="q" value="${escapeHtml(searchQuery)}" />
                      <input type="hidden" name="messageStatus" value="${statusFilter}" />
                      <button type="submit" class="button-danger">Delete</button>
                    </form>
                  </td>
                </tr>`;
              })
              .join('');

    res
      .status(200)
      .set({ 'Content-Type': 'text/html; charset=utf-8' })
      .send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Dashboard</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&display=swap"
    />
    <style>
      :root {
        color-scheme: light;
        --admin-bg: #faf8f5;
        --admin-surface: rgba(255, 252, 247, 0.88);
        --admin-card: rgba(255, 255, 255, 0.88);
        --admin-border: rgba(45, 41, 38, 0.1);
        --admin-border-strong: rgba(45, 41, 38, 0.18);
        --admin-text: #2d2926;
        --admin-muted: #6b635a;
        --admin-accent: #8b8070;
        --admin-accent-dark: #2d2926;
        --admin-shadow: 0 24px 70px rgba(45, 41, 38, 0.08);
        --admin-serif: "Cormorant Garamond", serif;
        --admin-sans: "Manrope", sans-serif;
      }
      * { box-sizing: border-box; }
      body {
        font-family: var(--admin-sans);
        margin: 0;
        background:
          radial-gradient(circle at top, rgba(168, 153, 110, 0.18), transparent 34rem),
          linear-gradient(180deg, rgba(255,255,255,0.42), rgba(255,255,255,0)),
          var(--admin-bg);
        color: var(--admin-text);
      }
      main {
        max-width: 1220px;
        margin: 2rem auto;
        background: var(--admin-surface);
        border: 1px solid var(--admin-border);
        border-radius: 0;
        padding: 1.75rem;
        box-shadow: var(--admin-shadow);
        backdrop-filter: blur(18px);
      }
      section {
        border: 1px solid var(--admin-border);
        border-radius: 0;
        padding: 1.2rem;
        background: var(--admin-card);
        margin-top: 1rem;
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.7);
      }
      h1, h2, h3, summary strong {
        font-family: var(--admin-serif);
        letter-spacing: -0.02em;
      }
      h1 { font-weight: 500; }
      h2 { margin-top: 0; font-size: 1.65rem; font-weight: 500; }
      h3 { color: var(--admin-accent-dark); }
      form p { margin: 0.75rem 0; }
      label { display: block; font-size: 0.92rem; color: var(--admin-muted); }
      input, textarea, select {
        width: 100%;
        margin-top: 0.35rem;
        border: 1px solid var(--admin-border-strong);
        border-radius: 0;
        padding: 0.72rem 0.85rem;
        font: inherit;
        background: rgba(255, 255, 255, 0.9);
        color: var(--admin-text);
      }
      textarea { min-height: 80px; resize: vertical; }
      input:focus, textarea:focus, select:focus {
        outline: 2px solid rgba(154, 106, 83, 0.18);
        border-color: rgba(154, 106, 83, 0.42);
      }
      button {
        border: 1px solid var(--admin-accent-dark);
        background: var(--admin-accent-dark);
        color: #fff;
        border-radius: 0;
        padding: 0.72rem 1.15rem;
        cursor: pointer;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        font-size: 0.78rem;
      }
      button:hover { background: var(--admin-accent); border-color: var(--admin-accent); opacity: 1; }
      .upload-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 0.55rem; align-items: end; }
      .upload-inline-status {
        grid-column: 1 / -1;
        margin: 0;
        color: var(--admin-muted);
        font-size: 0.76rem;
        line-height: 1.5;
      }
      .upload-inline-status.is-error { color: #b91c1c; }
      .upload-inline-status.is-success { color: #17603c; }
      .upload-help { margin-top: -0.3rem; color: var(--admin-muted); font-size: 0.82rem; line-height: 1.6; }
      .uploads-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 0.65rem; }
      .uploads-pathbar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.5rem;
        margin: 0 0 0.85rem 0;
      }
      .uploads-current-path {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        min-height: 2.6rem;
        padding: 0.55rem 0.8rem;
        border: 1px solid var(--admin-border);
        background: rgba(255,255,255,0.74);
        color: var(--admin-muted);
        font-size: 0.8rem;
      }
      .uploads-breadcrumb {
        border: none;
        background: transparent;
        color: var(--admin-accent-dark);
        padding: 0;
        font: inherit;
        text-transform: none;
        letter-spacing: 0.02em;
      }
      .uploads-breadcrumb.is-current { color: var(--admin-muted); cursor: default; }
      .uploads-breadcrumb-separator { color: var(--admin-muted); opacity: 0.65; }
      .upload-card {
        border: 1px solid var(--admin-border);
        border-radius: 16px;
        padding: 0.75rem;
        background: #fff;
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
      }
      .upload-card img {
        width: 100%;
        height: 120px;
        object-fit: cover;
        border-radius: 8px;
        background: #f3f4f6;
      }
      .upload-card a { display: block; margin-top: 0.15rem; color: var(--admin-accent-dark); font-size: 0.8rem; word-break: break-all; text-decoration: none; }
      .upload-card-folder {
        color: var(--admin-muted);
        font-size: 0.72rem;
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }
      .upload-card-title {
        color: var(--admin-accent-dark);
        font-size: 0.92rem;
        line-height: 1.45;
        word-break: break-word;
      }
      .upload-card-meta {
        color: var(--admin-muted);
        font-size: 0.74rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .upload-folder-card {
        justify-content: space-between;
        min-height: 12rem;
        background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(247,239,228,0.92));
      }
      .upload-folder-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 3rem;
        height: 3rem;
        border: 1px solid var(--admin-border);
        border-radius: 12px;
        background: rgba(255,255,255,0.92);
        color: var(--admin-accent-dark);
        font-size: 1.1rem;
      }
      .stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.65rem; }
      .stat-card { border: 1px solid var(--admin-border); border-radius: 18px; padding: 1rem; background: rgba(255,255,255,0.78); }
      .status-message { padding: 0.85rem 1rem; border-radius: 0; background: #f3f9f5; color: #17603c; border: 1px solid rgba(23,96,60,0.16); }
      .tab-row { display: flex; gap: 0.55rem; margin-bottom: 1rem; flex-wrap: wrap; }
      .tab-link {
        display: inline-flex;
        align-items: center;
        text-decoration: none;
        border: 1px solid var(--admin-border-strong);
        border-radius: 0;
        padding: 0.58rem 0.92rem;
        color: var(--admin-muted);
        background: rgba(255,255,255,0.72);
        letter-spacing: 0.14em;
        text-transform: uppercase;
        font-size: 0.76rem;
      }
      .tab-link.active { background: var(--admin-accent-dark); border-color: var(--admin-accent-dark); color: #fff; }
      .messages-toolbar { display: grid; grid-template-columns: 1fr auto auto; gap: 0.65rem; align-items: end; }
      .messages-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 16px; overflow: hidden; }
      .messages-table th, .messages-table td { border: 1px solid var(--admin-border); padding: 0.65rem; vertical-align: top; text-align: left; font-size: 0.86rem; }
      .messages-table th {
        background: #f7efe4;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        font-size: 0.72rem;
        color: var(--admin-muted);
      }
      .admin-hero { display: flex; flex-wrap: wrap; align-items: end; justify-content: space-between; gap: 1rem; margin-bottom: 1.4rem; }
      .admin-eyebrow { margin: 0 0 0.35rem 0; font-size: 0.76rem; letter-spacing: 0.32em; text-transform: uppercase; color: var(--admin-muted); }
      .admin-intro { max-width: 40rem; color: var(--admin-muted); line-height: 1.8; }
      .admin-shell-note {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.55rem 0.85rem;
        border: 1px solid var(--admin-border);
        background: rgba(255,255,255,0.74);
        color: var(--admin-muted);
        letter-spacing: 0.08em;
        text-transform: uppercase;
        font-size: 0.76rem;
      }
      .section-intro {
        margin: 0 0 1rem 0;
        color: var(--admin-muted);
        line-height: 1.75;
        max-width: 44rem;
      }
      section > h2 {
        margin-bottom: 0.35rem;
        font-size: 1.7rem;
      }
      section > form,
      section > .table-wrap,
      section > .upload-library-toolbar,
      section > .uploads-list {
        margin-top: 0.9rem;
      }
      label {
        letter-spacing: 0.08em;
        text-transform: uppercase;
        font-size: 0.74rem;
      }
      input::placeholder,
      textarea::placeholder {
        color: rgba(107, 99, 90, 0.72);
      }
      .stat-card strong {
        display: block;
        margin-bottom: 0.4rem;
        color: var(--admin-muted);
        letter-spacing: 0.14em;
        text-transform: uppercase;
        font-size: 0.72rem;
      }
      .section-grid { display: grid; gap: 1rem; }
      .section-grid.two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .gallery-category-grid { display: grid; gap: 0.9rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
      .gallery-category-card { border: 1px solid var(--admin-border); border-radius: 18px; padding: 1rem; background: rgba(255,255,255,0.74); }
      .gallery-category-card-header { display: flex; align-items: start; justify-content: space-between; gap: 0.8rem; }
      .gallery-category-card-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 0.45rem; }
      .gallery-management-bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.8rem; margin-top: 1rem; }
      .gallery-management-note { max-width: 40rem; margin: 0; color: var(--admin-muted); line-height: 1.7; }
      .gallery-upload-builder { display: grid; gap: 0.9rem; margin: 1rem 0 0.9rem; padding: 1rem 1.1rem; border: 1px solid var(--admin-border); border-radius: 18px; background: rgba(255,255,255,0.74); }
      .gallery-upload-grid { display: grid; gap: 0.75rem; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); align-items: end; }
      .gallery-editor-toolbar { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; justify-content: space-between; margin: 1rem 0; }
      .gallery-toolbar-main { display: grid; gap: 0.8rem; flex: 1 1 34rem; }
      .gallery-toolbar-filters { display: grid; gap: 0.75rem; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
      .toolbar-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 0.55rem; }
      .count-chip {
        display: inline-flex;
        align-items: center;
        padding: 0.62rem 0.85rem;
        border-radius: 999px;
        border: 1px solid var(--admin-border);
        background: rgba(255,255,255,0.74);
        color: var(--admin-muted);
        font-size: 0.8rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .gallery-piece-editor { display: grid; gap: 0.9rem; }
      .gallery-piece-card { border: 1px solid var(--admin-border); border-radius: 18px; background: rgba(255,255,255,0.76); overflow: hidden; }
      .gallery-piece-card summary { list-style: none; cursor: pointer; padding: 1rem 1.1rem; display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
      .gallery-piece-card summary::-webkit-details-marker { display: none; }
      .gallery-piece-meta { color: var(--admin-muted); font-size: 0.82rem; letter-spacing: 0.08em; text-transform: uppercase; }
      .gallery-piece-body { border-top: 1px solid var(--admin-border); padding: 1rem 1.1rem 1.2rem; }
      .piece-grid { display: grid; gap: 0.85rem; grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .piece-grid .full { grid-column: 1 / -1; }
      .gallery-piece-preview-strip { display: grid; gap: 0.9rem; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); align-items: start; }
      .gallery-piece-preview {
        border: 1px solid var(--admin-border);
        border-radius: 14px;
        overflow: hidden;
        background: rgba(255,255,255,0.9);
        min-width: 0;
      }
      .gallery-piece-preview.is-cover {
        border-color: var(--admin-accent-dark);
        box-shadow: 0 0 0 1px rgba(45, 41, 38, 0.16);
      }
      .gallery-piece-preview img { display: block; width: 100%; height: 132px; object-fit: cover; background: #f3f4f6; }
      .gallery-piece-preview-actions {
        display: grid;
        gap: 0.45rem;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        border-top: 1px solid var(--admin-border);
        padding: 0.7rem;
      }
      .gallery-piece-preview-label {
        grid-column: 1 / -1;
        color: var(--admin-muted);
        font-size: 0.68rem;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        line-height: 1.5;
      }
      .gallery-piece-preview-button {
        width: 100%;
        min-height: 2.4rem;
        padding: 0.55rem 0.65rem;
        font-size: 0.64rem;
        letter-spacing: 0.12em;
        line-height: 1.35;
        white-space: normal;
        text-align: center;
      }
      .gallery-piece-preview-count,
      .gallery-piece-preview-empty {
        border: 1px dashed var(--admin-border-strong);
        border-radius: 14px;
        padding: 1rem;
        color: var(--admin-muted);
        font-size: 0.8rem;
        text-align: center;
        background: rgba(255,255,255,0.55);
      }
      .journal-editor-lead {
        display: grid;
        gap: 1rem;
        grid-template-columns: minmax(0, 1.2fr) minmax(18rem, 0.8fr);
        align-items: start;
        margin: 1rem 0 1.15rem;
      }
      .journal-workflow-card,
      .journal-builder-card,
      .journal-preview-card {
        border: 1px solid var(--admin-border);
        border-radius: 18px;
        background: rgba(255,255,255,0.76);
        padding: 1rem;
      }
      .journal-workflow-card strong,
      .journal-builder-card strong {
        display: block;
        margin-bottom: 0.35rem;
        color: var(--admin-accent-dark);
      }
      .journal-workflow-list {
        margin: 0.75rem 0 0 0;
        padding-left: 1rem;
        color: var(--admin-muted);
        display: grid;
        gap: 0.5rem;
        line-height: 1.6;
      }
      .journal-builder-grid {
        display: grid;
        gap: 0.75rem;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        align-items: end;
      }
      .journal-inline-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      .journal-summary-actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: flex-end;
        gap: 0.45rem;
      }
      .journal-preview-card {
        display: grid;
        gap: 0.85rem;
        grid-template-columns: minmax(110px, 0.9fr) minmax(0, 1.1fr);
      }
      .journal-preview-card img {
        width: 100%;
        height: 100%;
        min-height: 9rem;
        object-fit: cover;
        border-radius: 12px;
        background: #f3f4f6;
      }
      .journal-preview-kicker {
        color: var(--admin-muted);
        font-size: 0.7rem;
        letter-spacing: 0.24em;
        text-transform: uppercase;
      }
      .journal-preview-title {
        font-family: var(--admin-serif);
        font-size: 1.45rem;
        line-height: 1.05;
        color: var(--admin-accent-dark);
      }
      .journal-preview-copy {
        color: var(--admin-muted);
        font-size: 0.88rem;
        line-height: 1.7;
      }
      .journal-field-stack {
        display: grid;
        gap: 0.75rem;
      }
      .journal-upload-row {
        display: grid;
        gap: 0.6rem;
        grid-template-columns: minmax(0, 1fr) auto auto;
        align-items: end;
      }
      .body-tools {
        display: flex;
        flex-wrap: wrap;
        gap: 0.45rem;
        margin: 0.5rem 0 0.7rem;
      }
      .body-tools button,
      .journal-inline-actions button,
      .journal-summary-actions button {
        padding: 0.58rem 0.8rem;
        font-size: 0.68rem;
      }
      .journal-preview-link {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        color: var(--admin-accent-dark);
        font-size: 0.8rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        text-decoration: none;
      }
      .checkbox-row { display: flex; align-items: center; gap: 0.55rem; color: var(--admin-text); }
      .checkbox-row input { width: auto; margin: 0; }
      .ghost-button { background: rgba(255,255,255,0.88); color: var(--admin-accent-dark); border: 1px solid var(--admin-border-strong); }
      .danger-button { background: #b0423d; }
      .empty-editor-state {
        border: 1px dashed var(--admin-border-strong);
        border-radius: 18px;
        padding: 1rem 1.1rem;
        color: var(--admin-muted);
        background: rgba(255,255,255,0.6);
      }
      .upload-library-toolbar { display: grid; gap: 0.75rem; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); align-items: end; margin-bottom: 0.9rem; }
      .upload-card-actions { display: flex; gap: 0.45rem; margin-top: 0.55rem; }
      .upload-card-actions button { flex: 1; padding: 0.58rem 0.8rem; font-size: 0.78rem; }
      .admin-divider { margin: 1.25rem 0; border: none; border-top: 1px solid var(--admin-border); }
      .button-dark { background: #1f2937; }
      .button-danger { background: #b91c1c; }
      .inline-badge {
        display: inline-flex;
        align-items: center;
        padding: 0.32rem 0.7rem;
        border-radius: 999px;
        font-size: 0.78rem;
        border: 1px solid var(--admin-border);
        background: rgba(255,255,255,0.75);
        color: var(--admin-muted);
      }
      .inline-badge.success {
        border-color: rgba(22,101,52,0.15);
        background: #eff8f1;
        color: #166534;
      }
      .oauth-card {
        margin-bottom: 1rem;
        border: 1px solid var(--admin-border);
        border-radius: 18px;
        padding: 1rem;
        background: rgba(255,255,255,0.88);
      }
      .oauth-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.65rem; }
      .oauth-actions { margin: 0.9rem 0 0 0; display: flex; gap: 0.55rem; flex-wrap: wrap; align-items: center; }
      .table-wrap {
        overflow: auto;
        margin-top: 1rem;
        border: 1px solid var(--admin-border);
        border-radius: 18px;
        background: rgba(255,255,255,0.76);
      }
      .message-actions { display: flex; flex-wrap: wrap; gap: 0.45rem; }
      .message-actions form { margin: 0; }
      .subtle-divider { margin: 1.25rem 0; border: none; border-top: 1px solid var(--admin-border); }
      @media (max-width: 900px) {
        main { margin: 1rem; padding: 1rem; border-radius: 22px; }
        .section-grid.two, .piece-grid, .messages-toolbar, .upload-library-toolbar { grid-template-columns: 1fr; }
        .upload-row { grid-template-columns: 1fr; }
        .journal-editor-lead,
        .journal-preview-card,
        .journal-upload-row { grid-template-columns: 1fr; }
      }
    </style>
  </head>
  <body>
    <main>
      <div class="admin-hero">
        <div>
          <p class="admin-eyebrow">Art Of Nature</p>
          <h1 style="margin: 0;">Studio Dashboard</h1>
          <p class="admin-intro">Manage the public-facing story, gallery archive, and incoming messages from one place without changing the site’s underlying functionality.</p>
        </div>
        <div style="display:grid; gap:0.6rem; justify-items:end;">
          <span class="admin-shell-note">Bespoke Content Editor</span>
          <p style="margin: 0; color: var(--admin-muted);">Signed in as <strong>${safeUserName}</strong></p>
        </div>
      </div>
      <nav class="tab-row">
        <a class="tab-link ${activeTab === 'content' ? 'active' : ''}" href="/admin?tab=content">Content</a>
        <a class="tab-link ${activeTab === 'gallery' ? 'active' : ''}" href="/admin?tab=gallery">Gallery</a>
        <a class="tab-link ${activeTab === 'journal' ? 'active' : ''}" href="/admin?tab=journal">Journal</a>
        <a class="tab-link ${activeTab === 'messages' ? 'active' : ''}" href="/admin?tab=messages">Contact Messages</a>
      </nav>
      ${
        statusMessage
          ? `<p class="status-message">${escapeHtml(statusMessage)}</p>`
          : ''
      }
      ${activeTab === 'content' ? `
      <section class="stats">
        <div class="stat-card"><strong>Total visits:</strong> ${totalVisits}</div>
        <div class="stat-card"><strong>Total contact messages:</strong> ${totalContactMessages}</div>
      </section>
      <section>
        <h2>Hero Content</h2>
        <p class="section-intro">Shape the first impression of the site with the opening lines, call to action, and full-bleed hero image.</p>
        <form method="post" action="/admin/content/hero" data-image-upload-form data-image-upload-target="backgroundImageUrl">
          <p><label>Eyebrow<br /><input name="eyebrow" required style="width:100%;" value="${escapeHtml(hero.eyebrow)}" /></label></p>
          <p><label>Heading Line 1<br /><input name="headingLine1" required style="width:100%;" value="${escapeHtml(hero.headingLine1)}" /></label></p>
          <p><label>Heading Line 2<br /><input name="headingLine2" required style="width:100%;" value="${escapeHtml(hero.headingLine2)}" /></label></p>
          <p><label>Description<br /><textarea name="description" required style="width:100%; min-height: 70px;">${escapeHtml(hero.description)}</textarea></label></p>
          <p><label>CTA Text<br /><input name="ctaText" required style="width:100%;" value="${escapeHtml(hero.ctaText)}" /></label></p>
          <p><label>CTA Href<br /><input name="ctaHref" required style="width:100%;" value="${escapeHtml(hero.ctaHref)}" /></label></p>
          <p><label>Background Image URL<br /><input name="backgroundImageUrl" required style="width:100%;" value="${escapeHtml(hero.backgroundImageUrl)}" /></label></p>
          <p class="upload-help">Upload an image to auto-fill Background Image URL.</p>
          <p class="upload-row"><input type="file" class="image-file-input" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" data-target-field="backgroundImageUrl" /><button type="button" class="image-upload-button" data-target-field="backgroundImageUrl">Upload Image</button><span class="upload-inline-status" data-upload-status-for="backgroundImageUrl"></span></p>
          <p><label>Background Image Alt<br /><input name="backgroundImageAlt" required style="width:100%;" value="${escapeHtml(hero.backgroundImageAlt)}" /></label></p>
          <p><button type="submit">Save Hero</button></p>
        </form>
      </section>
      <hr class="admin-divider" />
      <section>
        <h2>About Content</h2>
        <p class="section-intro">Refine the studio story, process notes, and portrait image without touching the layout itself.</p>
        <form method="post" action="/admin/content/about" data-image-upload-form data-image-upload-target="imageUrl">
          <p><label>Eyebrow<br /><input name="eyebrow" required style="width:100%;" value="${escapeHtml(about.eyebrow)}" /></label></p>
          <p><label>Heading<br /><input name="heading" required style="width:100%;" value="${escapeHtml(about.heading)}" /></label></p>
          <p><label>Paragraph 1<br /><textarea name="paragraph1" required style="width:100%; min-height: 70px;">${escapeHtml(about.paragraph1)}</textarea></label></p>
          <p><label>Paragraph 2<br /><textarea name="paragraph2" required style="width:100%; min-height: 70px;">${escapeHtml(about.paragraph2)}</textarea></label></p>
          <p><label>Paragraph 3<br /><textarea name="paragraph3" required style="width:100%; min-height: 70px;">${escapeHtml(about.paragraph3)}</textarea></label></p>
          <p><label>Focus Boxes (one per line)<br /><textarea name="focusPoints" required style="width:100%; min-height: 90px;">${escapeHtml(about.focusPoints.join('\n'))}</textarea></label></p>
          <p><label>Process Kicker<br /><input name="processEyebrow" required style="width:100%;" value="${escapeHtml(about.processEyebrow)}" /></label></p>
          <p><label>Process Description<br /><textarea name="processDescription" required style="width:100%; min-height: 70px;">${escapeHtml(about.processDescription)}</textarea></label></p>
          <p><label>Image URL<br /><input name="imageUrl" required style="width:100%;" value="${escapeHtml(about.imageUrl)}" /></label></p>
          <p class="upload-help">Upload an image to auto-fill About Image URL.</p>
          <p class="upload-row"><input type="file" class="image-file-input" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" data-target-field="imageUrl" /><button type="button" class="image-upload-button" data-target-field="imageUrl">Upload Image</button><span class="upload-inline-status" data-upload-status-for="imageUrl"></span></p>
          <p><label>Image Alt<br /><input name="imageAlt" required style="width:100%;" value="${escapeHtml(about.imageAlt)}" /></label></p>
          <p><button type="submit">Save About</button></p>
        </form>
      </section>
      <hr class="admin-divider" />
      <section>
        <h2>Contact Content</h2>
        <p class="section-intro">Control the language, labels, and direct contact links that shape the inquiry experience on the public site.</p>
        <form method="post" action="/admin/content/contact">
          <p><label>Eyebrow<br /><input name="eyebrow" required style="width:100%;" value="${escapeHtml(contact.eyebrow)}" /></label></p>
          <p><label>Heading<br /><input name="heading" required style="width:100%;" value="${escapeHtml(contact.heading)}" /></label></p>
          <p><label>Description<br /><textarea name="description" required style="width:100%; min-height: 70px;">${escapeHtml(contact.description)}</textarea></label></p>
          <p><label>Name Label<br /><input name="nameLabel" required style="width:100%;" value="${escapeHtml(contact.nameLabel)}" /></label></p>
          <p><label>Name Placeholder<br /><input name="namePlaceholder" required style="width:100%;" value="${escapeHtml(contact.namePlaceholder)}" /></label></p>
          <p><label>Email Label<br /><input name="emailLabel" required style="width:100%;" value="${escapeHtml(contact.emailLabel)}" /></label></p>
          <p><label>Email Placeholder<br /><input name="emailPlaceholder" required style="width:100%;" value="${escapeHtml(contact.emailPlaceholder)}" /></label></p>
          <p><label>Project Type Label<br /><input name="projectTypeLabel" required style="width:100%;" value="${escapeHtml(contact.projectTypeLabel)}" /></label></p>
          <p><label>Project Default Option<br /><input name="projectDefaultOption" required style="width:100%;" value="${escapeHtml(contact.projectDefaultOption)}" /></label></p>
          <p><label>Project Options (one per line)<br /><textarea name="projectOptions" required style="width:100%; min-height: 90px;">${escapeHtml(contact.projectOptions.join('\n'))}</textarea></label></p>
          <p><label>Message Label<br /><input name="messageLabel" required style="width:100%;" value="${escapeHtml(contact.messageLabel)}" /></label></p>
          <p><label>Message Placeholder<br /><textarea name="messagePlaceholder" required style="width:100%; min-height: 70px;">${escapeHtml(contact.messagePlaceholder)}</textarea></label></p>
          <p><label>Submit Text<br /><input name="submitText" required style="width:100%;" value="${escapeHtml(contact.submitText)}" /></label></p>
          <p><label>Direct Contact Label<br /><input name="directContactLabel" required style="width:100%;" value="${escapeHtml(contact.directContactLabel)}" /></label></p>
          <p><label>Direct Contacts (href | label, one per line)<br /><textarea name="directContacts" required style="width:100%; min-height: 90px;">${escapeHtml(toContactLinksText(contact.directContacts))}</textarea></label></p>
          <p><button type="submit">Save Contact</button></p>
        </form>
      </section>
      <section>
        <h2>Craftsmanship Content</h2>
        <p class="section-intro">Update the supporting craftsmanship section that frames the studio’s approach without turning it commercial.</p>
        <form method="post" action="/admin/content/craftsmanship">
          <p><label>Eyebrow<br /><input name="eyebrow" required style="width:100%;" value="${escapeHtml(craftsmanship.eyebrow)}" /></label></p>
          <p><label>Heading<br /><input name="heading" required style="width:100%;" value="${escapeHtml(craftsmanship.heading)}" /></label></p>
          <p><label>Description<br /><textarea name="description" required style="width:100%; min-height: 70px;">${escapeHtml(craftsmanship.description)}</textarea></label></p>
          <p><label>Cards (title | description, one per line)<br /><textarea name="items" required style="width:100%; min-height: 110px;">${escapeHtml(toCraftsmanshipItemsText(craftsmanship.items))}</textarea></label></p>
          <p><button type="submit">Save Craftsmanship</button></p>
        </form>
      </section>
      <section>
        <h2>Image Library</h2>
        <p class="section-intro">Browse uploaded assets, copy their live URLs, and reuse them across hero, about, contact, and gallery content.</p>
        <div class="upload-library-toolbar">
          <p style="margin:0;"><label>Search Archive<br /><input type="search" id="uploads-search" placeholder="Filename, folder, or URL" /></label></p>
          <p style="margin:0;"><label>Target Folder<br /><input type="text" id="uploads-folder" placeholder="e.g. hero/background" /></label></p>
          <p style="margin:0;"><button type="button" id="create-upload-folder" class="ghost-button">Create Folder</button></p>
          <p style="margin:0;"><button type="button" id="uploads-go-root" class="ghost-button">Open Root</button></p>
          <p style="margin:0;"><button type="button" id="uploads-go-parent" class="ghost-button">Up One Level</button></p>
          <p class="upload-help" style="margin:0;">Upload images from the content forms above, then reuse those URLs anywhere across the website.</p>
        </div>
        <p class="upload-help" id="upload-status">Upload images from Hero/About forms above. Reuse URLs here later across the homepage and gallery.</p>
        <div id="uploads-pathbar" class="uploads-pathbar"></div>
        <div id="uploads-list" class="uploads-list"></div>
      </section>
      <section>
        <h2>Reset</h2>
        <form method="post" action="/admin/content/reset" onsubmit="return confirm('Reset all website content to defaults?');">
          <button type="submit" class="button-danger">Reset all content</button>
        </form>
      </section>
      ` : ''}
      ${activeTab === 'gallery' ? `
      <section>
        <p class="admin-eyebrow" style="margin-top:0;">Gallery</p>
        <h2>Gallery Editor</h2>
        <p class="section-intro">Edit the homepage portfolio preview, the dedicated gallery page, and each archived piece from one form. Images are saved as live URLs, so the public site updates without code changes.</p>
        <form id="gallery-content-form" method="post" action="/admin/content/gallery">
          <div class="section-grid two">
            <p><label>Homepage Eyebrow<br /><input name="previewEyebrow" required value="${escapeHtml(gallery.previewEyebrow)}" /></label></p>
            <p><label>Homepage Heading<br /><input name="previewHeading" required value="${escapeHtml(gallery.previewHeading)}" /></label></p>
            <p class="full" style="grid-column:1 / -1;"><label>Homepage Description<br /><textarea name="previewDescription" required style="min-height:90px;">${escapeHtml(gallery.previewDescription)}</textarea></label></p>
            <p><label>Gallery Page Eyebrow<br /><input name="pageEyebrow" required value="${escapeHtml(gallery.pageEyebrow)}" /></label></p>
            <p><label>Gallery Page Heading<br /><input name="pageHeading" required value="${escapeHtml(gallery.pageHeading)}" /></label></p>
            <p class="full" style="grid-column:1 / -1;"><label>Gallery Page Description<br /><textarea name="pageDescription" required style="min-height:100px;">${escapeHtml(gallery.pageDescription)}</textarea></label></p>
          </div>

          <div class="gallery-category-grid" style="margin-top:1rem;">
            ${gallery.categories
              .map(
                (category) => {
                  const categoryPieceCount = gallery.pieces.filter((piece) => piece.category === category.name).length;
                  return `<div class="gallery-category-card">
                  <div class="gallery-category-card-header">
                    <div>
                      <p class="admin-eyebrow" style="margin-top:0;">${escapeHtml(category.name)}</p>
                      <p class="upload-help" style="margin:0.2rem 0 0;">${escapeHtml(String(categoryPieceCount))} piece${categoryPieceCount === 1 ? '' : 's'} / ${escapeHtml(String(category.subcategories.length))} section${category.subcategories.length === 1 ? '' : 's'}</p>
                    </div>
                    <div class="gallery-category-card-actions">
                      <button type="button" class="ghost-button" data-set-gallery-folder="${escapeHtml(category.name)}">Use Folder</button>
                      <button type="button" class="button-danger" data-delete-gallery-category="${escapeHtml(category.name)}">Delete</button>
                    </div>
                  </div>
                  <p><label>Rank<br /><input type="number" name="galleryRank:${escapeHtml(category.name)}" value="${escapeHtml(String(category.rank ?? 0))}" /></label></p>
                  <p><label>Eyebrow (for room header / future use)<br /><input name="galleryEyebrow:${escapeHtml(category.name)}" required value="${escapeHtml(category.eyebrow)}" /></label></p>
                  <p><label>Description<br /><textarea name="galleryDescription:${escapeHtml(category.name)}" required style="min-height:110px;">${escapeHtml(category.description)}</textarea></label></p>
                </div>`;
                }
              )
              .join('')}
          </div>

          <div class="gallery-management-bar">
            <p class="gallery-management-note">Use this section to reorder, edit, add, or remove categories. Category changes are saved with the same Gallery save action, and deleting a category also removes its subcategories and pieces.</p>
            <div class="toolbar-actions">
              <span class="count-chip">${gallery.categories.length} categories</span>
              <button type="submit">Save Category Changes</button>
            </div>
          </div>

          <div class="panel-surface" style="margin-top:1.2rem; padding:1rem 1.1rem;">
            <p class="admin-eyebrow" style="margin-top:0;">Add Category</p>
            <p class="section-intro" style="margin-top:0.35rem;">Create a new gallery room/category and set its display rank. Subcategories are optional now and can be refined afterward.</p>
            <div class="section-grid two">
              <p><label>Name<br /><input name="newGalleryCategoryName" placeholder="e.g. Studio Pieces" /></label></p>
              <p><label>Rank<br /><input type="number" name="newGalleryCategoryRank" value="${escapeHtml(String(gallery.categories.length))}" /></label></p>
              <p><label>Eyebrow (for room header / future use)<br /><input name="newGalleryCategoryEyebrow" placeholder="e.g. Gallery VII" /></label></p>
              <p><label>Subcategories<br /><textarea name="newGalleryCategorySubcategories" placeholder="One subcategory per line" style="min-height:110px;"></textarea></label></p>
              <p class="full" style="grid-column:1 / -1;"><label>Description<br /><textarea name="newGalleryCategoryDescription" placeholder="Describe the mood and purpose of this category." style="min-height:110px;"></textarea></label></p>
            </div>
            <p class="upload-help" style="margin:0.65rem 0 0;">Leave the fields empty if you are only editing the existing categories above. Fill them in to add a new category during this save.</p>
          </div>

          <div class="gallery-editor-toolbar">
            <div class="gallery-toolbar-main">
              <div>
                <strong style="display:block; margin-bottom:0.2rem;">Piece Archive</strong>
                <span class="upload-help">Search, filter, and edit the archive without losing the existing gallery structure. Each piece still accepts one image URL per line.</span>
              </div>
              <div class="gallery-toolbar-filters">
                <p style="margin:0;"><label>Search Pieces<br /><input type="search" id="gallery-piece-search" placeholder="Title, material, note, room" /></label></p>
                <p style="margin:0;"><label>Room Filter<br />
                  <select id="gallery-piece-category-filter">
                    <option value="all">All rooms</option>
                    ${gallery.categories
                      .map((category) => `<option value="${escapeHtml(category.name)}">${escapeHtml(category.name)}</option>`)
                      .join('')}
                  </select>
                </label></p>
              </div>
            </div>
            <div class="toolbar-actions">
              <span id="gallery-piece-count" class="count-chip">${gallery.pieces.length} pieces</span>
              <button type="button" id="gallery-expand-all" class="ghost-button">Expand</button>
              <button type="button" id="gallery-collapse-all" class="ghost-button">Collapse</button>
              <button type="button" id="gallery-add-piece" class="ghost-button">Add Piece</button>
            </div>
          </div>

          <textarea id="gallery-pieces-json" name="galleryPiecesJson" hidden></textarea>
          <div id="gallery-piece-editor" class="gallery-piece-editor"></div>

          <p style="margin-top:1rem;"><button type="submit">Save Gallery</button></p>
        </form>
      </section>
      <section>
        <h2>Image Library</h2>
        <p class="section-intro">Select an Image URLs field in a piece, then copy or insert assets from the archive directly into that item.</p>
        <div class="gallery-upload-builder">
          <div>
            <strong style="display:block; margin-bottom:0.25rem;">Upload Into A Category Folder</strong>
            <p class="upload-help" style="margin:0;">Choose a category and subcategory, then upload images straight into that archive path. If a gallery image field is selected, uploaded URLs can be inserted automatically there too.</p>
          </div>
          <div class="gallery-upload-grid">
            <p style="margin:0;"><label>Category<br />
              <select id="gallery-upload-category">
                ${gallery.categories
                  .map((category) => `<option value="${escapeHtml(category.name)}">${escapeHtml(category.name)}</option>`)
                  .join('')}
              </select>
            </label></p>
            <p style="margin:0;"><label>Subcategory<br />
              <select id="gallery-upload-subcategory"></select>
            </label></p>
            <p style="margin:0;"><label>Image Files<br /><input type="file" id="gallery-device-upload" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" multiple /></label></p>
            <div class="toolbar-actions" style="align-self:end;">
              <button type="button" id="gallery-sync-folder" class="ghost-button">Set Target Folder</button>
              <button type="button" id="gallery-open-folder" class="ghost-button">Open Folder</button>
              <button type="button" id="gallery-upload-files" class="ghost-button">Upload Files</button>
            </div>
          </div>
        </div>
        <div class="upload-library-toolbar">
          <p style="margin:0;"><label>Search Archive<br /><input type="search" id="uploads-search" placeholder="Filename, folder, or URL" /></label></p>
          <p style="margin:0;"><label>Target Folder<br /><input type="text" id="uploads-folder" placeholder="e.g. gallery/living-room" /></label></p>
          <p style="margin:0;"><button type="button" id="create-upload-folder" class="ghost-button">Create Folder</button></p>
          <p style="margin:0;"><button type="button" id="uploads-go-root" class="ghost-button">Open Root</button></p>
          <p style="margin:0;"><button type="button" id="uploads-go-parent" class="ghost-button">Up One Level</button></p>
          <p class="upload-help" style="margin:0;">Select an Add Image URL or Image URLs field in a piece, then use Insert to place a URL without editing the full list manually.</p>
        </div>
        <p class="upload-help" id="upload-status">Upload a new image or reuse an existing URL from the archive below when editing a gallery piece.</p>
        <div id="uploads-pathbar" class="uploads-pathbar"></div>
        <div id="uploads-list" class="uploads-list"></div>
      </section>
      ` : ''}
      ${activeTab === 'journal' ? `
      <section>
        <p class="admin-eyebrow" style="margin-top:0;">Journal</p>
        <h2>Journal Editor</h2>
        <p class="section-intro">Manage the homepage journal preview, the full journal page, and individual article entries from one editor. Posts can be drafted, published, featured, reordered, edited, or removed without code changes.</p>
        <form id="journal-content-form" method="post" action="/admin/content/journal">
          <div class="section-grid two">
            <p><label>Homepage Eyebrow<br /><input name="journalPreviewEyebrow" required value="${escapeHtml(journal.previewEyebrow)}" /></label></p>
            <p><label>Homepage Heading<br /><input name="journalPreviewHeading" required value="${escapeHtml(journal.previewHeading)}" /></label></p>
            <p class="full" style="grid-column:1 / -1;"><label>Homepage Description<br /><textarea name="journalPreviewDescription" required style="min-height:90px;">${escapeHtml(journal.previewDescription)}</textarea></label></p>
            <p><label>Journal Page Eyebrow<br /><input name="journalPageEyebrow" required value="${escapeHtml(journal.pageEyebrow)}" /></label></p>
            <p><label>Journal Page Heading<br /><input name="journalPageHeading" required value="${escapeHtml(journal.pageHeading)}" /></label></p>
            <p class="full" style="grid-column:1 / -1;"><label>Journal Page Description<br /><textarea name="journalPageDescription" required style="min-height:100px;">${escapeHtml(journal.pageDescription)}</textarea></label></p>
          </div>

          <div class="journal-editor-lead">
            <div class="journal-workflow-card">
              <strong>Build The Article Like A Story</strong>
              <p class="upload-help" style="margin:0;">Each journal entry supports a lead image, supporting archive frames, publishing controls, and a body with elegant markdown-like structure.</p>
              <ul class="journal-workflow-list">
                <li>Use <code>## Heading</code> for section titles.</li>
                <li>Use <code>&gt; Quote</code> for pull quotes.</li>
                <li>Use <code>- Item</code> for clean editorial lists.</li>
                <li>Draft privately first, then publish when ready.</li>
              </ul>
            </div>
            <div class="journal-builder-card">
              <strong>Upload From This Device</strong>
              <p class="upload-help" style="margin:0 0 0.75rem 0;">Choose an image from a laptop, phone, or tablet, then send it directly into the selected journal field and store it in the shared uploads archive.</p>
              <div class="journal-builder-grid">
                <p style="margin:0;"><label>Image File<br /><input type="file" id="journal-device-upload" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" /></label></p>
                <div class="journal-inline-actions">
                  <button type="button" id="journal-upload-to-selected" class="ghost-button">Upload To Selected Field</button>
                  <button type="button" id="journal-upload-to-cover" class="ghost-button">Upload As Cover</button>
                  <button type="button" id="journal-upload-to-gallery" class="ghost-button">Upload To Gallery</button>
                </div>
              </div>
            </div>
          </div>

          <div class="gallery-editor-toolbar">
            <div class="gallery-toolbar-main">
              <div>
                <strong style="display:block; margin-bottom:0.2rem;">Article Archive</strong>
                <span class="upload-help">Search, filter, and shape each article without touching the layout. Use the body field with simple markdown-like syntax: <code>## heading</code>, <code>&gt; quote</code>, and <code>- list item</code>.</span>
              </div>
              <div class="gallery-toolbar-filters">
                <p style="margin:0;"><label>Search Posts<br /><input type="search" id="journal-post-search" placeholder="Title, category, slug, excerpt" /></label></p>
                <p style="margin:0;"><label>Status Filter<br />
                  <select id="journal-post-status-filter">
                    <option value="all">All posts</option>
                    <option value="published">Published</option>
                    <option value="draft">Drafts</option>
                  </select>
                </label></p>
              </div>
            </div>
            <div class="toolbar-actions">
              <span id="journal-post-count" class="count-chip">${journal.posts.length} posts</span>
              <button type="button" id="journal-expand-all" class="ghost-button">Expand</button>
              <button type="button" id="journal-collapse-all" class="ghost-button">Collapse</button>
              <button type="button" id="journal-add-post" class="ghost-button">Add Article</button>
            </div>
          </div>

          <textarea id="journal-posts-json" name="journalPostsJson" hidden></textarea>
          <div id="journal-post-editor" class="gallery-piece-editor"></div>

          <p style="margin-top:1rem;"><button type="submit">Save Journal</button></p>
        </form>
      </section>
      <section>
        <h2>Image Library</h2>
        <p class="section-intro">Select a cover image field or article gallery field, then reuse assets from the archive directly inside the journal editor.</p>
        <div class="upload-library-toolbar">
          <p style="margin:0;"><label>Search Archive<br /><input type="search" id="uploads-search" placeholder="Filename, folder, or URL" /></label></p>
          <p style="margin:0;"><label>Target Folder<br /><input type="text" id="uploads-folder" placeholder="e.g. journal/covers" /></label></p>
          <p style="margin:0;"><button type="button" id="create-upload-folder" class="ghost-button">Create Folder</button></p>
          <p style="margin:0;"><button type="button" id="uploads-go-root" class="ghost-button">Open Root</button></p>
          <p style="margin:0;"><button type="button" id="uploads-go-parent" class="ghost-button">Up One Level</button></p>
          <p class="upload-help" style="margin:0;">Click into an Add Image URL, cover image, or Gallery Images field first, then use Insert.</p>
        </div>
        <p class="upload-help" id="upload-status">Upload a new image or reuse existing archive URLs while editing journal entries.</p>
        <div id="uploads-pathbar" class="uploads-pathbar"></div>
        <div id="uploads-list" class="uploads-list"></div>
      </section>
      ` : ''}
      ${activeTab === 'messages' ? `
      <section>
        <h2>Contact Messages</h2>
        <p class="section-intro">Review inquiries, search the archive, and keep forwarding settings aligned with the live contact flow.</p>
        <form method="post" action="/admin/email/google/connect" class="oauth-card">
          <h3 style="margin-top:0; margin-bottom:0.7rem; font-size:0.98rem;">Auto-forward using Gmail OAuth</h3>
          <p class="upload-help" style="margin-top:0; margin-bottom:0.8rem;">Connect a Gmail account once, then contact messages are auto-forwarded without server SMTP config changes.</p>
          <div class="oauth-grid">
            <p style="margin:0;"><label>Forward To Email<br /><input name="forwardToEmail" required value="${escapeHtml(forwardingSettings.forwardToEmail)}" placeholder="inbox@example.com" /></label></p>
            <p style="margin:0;"><label>Gmail Address<br /><input name="gmailAddress" required value="${escapeHtml(forwardingSettings.gmailAddress)}" placeholder="your@gmail.com" /></label></p>
            <p style="margin:0;"><label>Google OAuth Client ID<br /><input name="googleClientId" required value="${escapeHtml(forwardingSettings.googleClientId)}" placeholder="...apps.googleusercontent.com" /></label></p>
            <p style="margin:0;"><label>Google OAuth Client Secret<br /><input name="googleClientSecret" required value="${escapeHtml(forwardingSettings.googleClientSecret)}" placeholder="GOCSPX-..." /></label></p>
          </div>
          <p class="oauth-actions">
            <button type="submit" class="button-dark">${forwardingSettings.connected ? 'Reconnect Gmail' : 'Connect Gmail'}</button>
            <span class="inline-badge ${forwardingSettings.connected ? 'success' : ''}">${forwardingSettings.connected ? 'Connected' : 'Not connected'}</span>
          </p>
        </form>
        <form method="post" action="/admin/email/google/disconnect" style="margin-bottom:1rem;">
          <button type="submit" class="button-danger" ${forwardingSettings.connected ? '' : 'disabled'}>Disconnect Gmail Forwarding</button>
        </form>
        <form method="get" action="/admin" class="messages-toolbar">
          <input type="hidden" name="tab" value="messages" />
          <p style="margin:0;"><label>Search<br /><input type="search" name="q" value="${escapeHtml(searchQuery)}" placeholder="Name, email, phone, project, message" /></label></p>
          <p style="margin:0;"><label>Status<br />
            <select name="messageStatus">
              <option value="all" ${statusFilter === 'all' ? 'selected' : ''}>All</option>
              <option value="new" ${statusFilter === 'new' ? 'selected' : ''}>New</option>
              <option value="seen" ${statusFilter === 'seen' ? 'selected' : ''}>Seen</option>
            </select>
          </label></p>
          <p style="margin:0;"><button type="submit">Search</button></p>
        </form>
        <div class="table-wrap">
          <table class="messages-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Project</th>
                <th>Message</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>${messageRowsHtml}</tbody>
          </table>
        </div>
      </section>
      ` : ''}
    </main>
    <script>
      (function () {
        const statusEl = document.getElementById('upload-status');
        const uploadsListEl = document.getElementById('uploads-list');
        const uploadsSearchInput = document.getElementById('uploads-search');
        const uploadsFolderInput = document.getElementById('uploads-folder');
        const uploadsPathbarEl = document.getElementById('uploads-pathbar');
        const createUploadFolderButton = document.getElementById('create-upload-folder');
        const uploadsGoRootButton = document.getElementById('uploads-go-root');
        const uploadsGoParentButton = document.getElementById('uploads-go-parent');
        const galleryUploadCategorySelect = document.getElementById('gallery-upload-category');
        const galleryUploadSubcategorySelect = document.getElementById('gallery-upload-subcategory');
        const galleryDeviceUploadInput = document.getElementById('gallery-device-upload');
        const gallerySyncFolderButton = document.getElementById('gallery-sync-folder');
        const galleryOpenFolderButton = document.getElementById('gallery-open-folder');
        const galleryUploadFilesButton = document.getElementById('gallery-upload-files');
        const galleryEditorData = ${serializeForScript(galleryEditorState)};
        const galleryEditorEl = document.getElementById('gallery-piece-editor');
        const galleryAddPieceButton = document.getElementById('gallery-add-piece');
        const galleryExpandAllButton = document.getElementById('gallery-expand-all');
        const galleryCollapseAllButton = document.getElementById('gallery-collapse-all');
        const galleryPieceSearchInput = document.getElementById('gallery-piece-search');
        const galleryPieceCategoryFilter = document.getElementById('gallery-piece-category-filter');
        const galleryPieceCountEl = document.getElementById('gallery-piece-count');
        const galleryForm = document.getElementById('gallery-content-form');
        const galleryPiecesJsonField = document.getElementById('gallery-pieces-json');
        const journalEditorData = ${serializeForScript(journalEditorState)};
        const journalEditorEl = document.getElementById('journal-post-editor');
        const journalAddPostButton = document.getElementById('journal-add-post');
        const journalExpandAllButton = document.getElementById('journal-expand-all');
        const journalCollapseAllButton = document.getElementById('journal-collapse-all');
        const journalPostSearchInput = document.getElementById('journal-post-search');
        const journalPostStatusFilter = document.getElementById('journal-post-status-filter');
        const journalPostCountEl = document.getElementById('journal-post-count');
        const journalForm = document.getElementById('journal-content-form');
        const journalPostsJsonField = document.getElementById('journal-posts-json');
        const journalDeviceUploadInput = document.getElementById('journal-device-upload');
        const journalUploadToSelectedButton = document.getElementById('journal-upload-to-selected');
        const journalUploadToCoverButton = document.getElementById('journal-upload-to-cover');
        const journalUploadToGalleryButton = document.getElementById('journal-upload-to-gallery');
        const galleryCategories = Array.isArray(galleryEditorData && galleryEditorData.categories)
          ? galleryEditorData.categories
          : [];
        let galleryPiecesState = Array.isArray(galleryEditorData && galleryEditorData.pieces)
          ? galleryEditorData.pieces.map(normalizeEditorPiece)
          : [];
        let journalPostsState = Array.isArray(journalEditorData && journalEditorData.posts)
          ? journalEditorData.posts.map(normalizeJournalEditorPost)
          : [];
        let cachedUploadEntries = [];
        let currentUploadsPath = '';
        let lastFocusedUploadField = null;
        let pendingGalleryImageEdit = null;
        let pendingJournalImageEdit = null;

        function escapeHtmlValue(value) {
          return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
        }

        function slugifyPieceId(value) {
          return String(value || '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        }

        function slugifyUploadsSegment(value) {
          return String(value || '')
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        }

        function getCategoryConfig(categoryName) {
          return galleryCategories.find(function (category) {
            return category && category.name === categoryName;
          }) || galleryCategories[0] || null;
        }

        function updateGalleryUploadSubcategoryOptions(selectedValue) {
          if (!(galleryUploadCategorySelect instanceof HTMLSelectElement) || !(galleryUploadSubcategorySelect instanceof HTMLSelectElement)) {
            return;
          }

          const category = getCategoryConfig(galleryUploadCategorySelect.value);
          const subcategories = category && Array.isArray(category.subcategories) ? category.subcategories : [];
          const nextValue = typeof selectedValue === 'string' && subcategories.includes(selectedValue)
            ? selectedValue
            : (subcategories[0] || '');

          galleryUploadSubcategorySelect.innerHTML = subcategories
            .map(function (subcategory) {
              const selected = subcategory === nextValue ? 'selected' : '';
              return '<option value="' + escapeHtmlValue(subcategory) + '" ' + selected + '>' + escapeHtmlValue(subcategory) + '</option>';
            })
            .join('');
        }

        function getSelectedGalleryUploadFolder() {
          if (!(galleryUploadCategorySelect instanceof HTMLSelectElement)) {
            return normalizeUploadsPath(currentUploadsPath);
          }

          const categorySegment = slugifyUploadsSegment(galleryUploadCategorySelect.value);
          const subcategoryValue =
            galleryUploadSubcategorySelect instanceof HTMLSelectElement
              ? galleryUploadSubcategorySelect.value
              : '';
          const subcategorySegment = slugifyUploadsSegment(subcategoryValue);

          return normalizeUploadsPath(['gallery', categorySegment, subcategorySegment].filter(Boolean).join('/'));
        }

        function applyGalleryUploadFolder(options) {
          const opts = options || {};
          const nextFolder = getSelectedGalleryUploadFolder();
          currentUploadsPath = nextFolder;
          syncUploadsFolderInput();
          renderUploadsPathbar();

          if (opts.openFolder === true) {
            refreshUploads(nextFolder);
          }

          return nextFolder;
        }

        function syncGalleryFolderFromFocusedPiece() {
          if (
            !(lastFocusedUploadField instanceof HTMLTextAreaElement || lastFocusedUploadField instanceof HTMLInputElement) ||
            !galleryEditorEl ||
            !galleryEditorEl.contains(lastFocusedUploadField)
          ) {
            return false;
          }

          const card = lastFocusedUploadField.closest('[data-piece-card]');
          const categoryField = card && card.querySelector('[data-field="category"]');
          const subcategoryField = card && card.querySelector('[data-field="subcategory"]');

          if (!(galleryUploadCategorySelect instanceof HTMLSelectElement) || !(categoryField instanceof HTMLSelectElement)) {
            return false;
          }

          galleryUploadCategorySelect.value = categoryField.value;
          updateGalleryUploadSubcategoryOptions(subcategoryField instanceof HTMLSelectElement ? subcategoryField.value : '');
          applyGalleryUploadFolder({ openFolder: false });
          return true;
        }

        function getSubcategoryOptions(categoryName, selectedValue) {
          const category = getCategoryConfig(categoryName);
          const subcategories = category && Array.isArray(category.subcategories) ? category.subcategories : [];

          return subcategories
            .map(function (subcategory) {
              const selected = subcategory === selectedValue ? 'selected' : '';
              return '<option value="' + escapeHtmlValue(subcategory) + '" ' + selected + '>' + escapeHtmlValue(subcategory) + '</option>';
            })
            .join('');
        }

        function categoryOptionsMarkup(selectedValue) {
          return galleryCategories
            .map(function (category) {
              const selected = category.name === selectedValue ? 'selected' : '';
              return '<option value="' + escapeHtmlValue(category.name) + '" ' + selected + '>' + escapeHtmlValue(category.name) + '</option>';
            })
            .join('');
        }

        function normalizeEditorPiece(piece) {
          const fallbackCategory = galleryCategories[0] || { name: 'Living Room', subcategories: ['Tables'] };
          const category = getCategoryConfig(piece && piece.category) || fallbackCategory;
          const imageUrls = Array.isArray(piece && piece.imageUrls)
            ? piece.imageUrls.map(function (url) { return String(url || '').trim(); }).filter(Boolean)
            : [];
          const requestedCoverImageUrl =
            piece && typeof piece.coverImageUrl === 'string'
              ? piece.coverImageUrl.trim()
              : '';
          const coverImageUrl =
            imageUrls.includes(requestedCoverImageUrl)
              ? requestedCoverImageUrl
              : (imageUrls[0] || '');

          return {
            id: typeof (piece && piece.id) === 'string' ? piece.id.trim() : '',
            title: typeof (piece && piece.title) === 'string' ? piece.title.trim() : '',
            category: category.name,
            subcategory:
              typeof (piece && piece.subcategory) === 'string' && category.subcategories.includes(piece.subcategory)
                ? piece.subcategory
                : category.subcategories[0],
            material: typeof (piece && piece.material) === 'string' ? piece.material.trim() : '',
            note: typeof (piece && piece.note) === 'string' ? piece.note.trim() : '',
            featured: piece && piece.featured === true,
            coverImageUrl: coverImageUrl,
            imageUrls: imageUrls,
          };
        }

        function isMeaningfulPiece(piece) {
          return Boolean(piece && (piece.title || piece.material || piece.note || (Array.isArray(piece.imageUrls) && piece.imageUrls.length > 0)));
        }

        function getGalleryFilterState() {
          const searchValue =
            galleryPieceSearchInput && typeof galleryPieceSearchInput.value === 'string'
              ? galleryPieceSearchInput.value.trim().toLowerCase()
              : '';
          const categoryValue =
            galleryPieceCategoryFilter && typeof galleryPieceCategoryFilter.value === 'string'
              ? galleryPieceCategoryFilter.value
              : 'all';

          return {
            searchValue: searchValue,
            categoryValue: categoryValue,
          };
        }

        function pieceMatchesFilters(piece, filters) {
          if (filters.categoryValue && filters.categoryValue !== 'all' && piece.category !== filters.categoryValue) {
            return false;
          }

          if (!filters.searchValue) {
            return true;
          }

          const haystack = [
            piece.title,
            piece.material,
            piece.note,
            piece.category,
            piece.subcategory,
          ]
            .join(' ')
            .toLowerCase();

          return haystack.includes(filters.searchValue);
        }

        function buildPiecePreviewMarkup(imageUrls, coverImageUrl) {
          if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
            return '<div class="gallery-piece-preview-empty">No images linked yet.</div>';
          }

          return imageUrls
            .map(function (url, index) {
              const safeUrl = escapeHtmlValue(url);
              const isCover = url === coverImageUrl;
              const moveLeftDisabled = index === 0 ? 'disabled' : '';
              const moveRightDisabled = index === imageUrls.length - 1 ? 'disabled' : '';
              return '<div class="gallery-piece-preview' + (isCover ? ' is-cover' : '') + '">' +
                '<img src="' + safeUrl + '" alt="Preview image ' + (index + 1) + '" loading="lazy" />' +
                '<div class="gallery-piece-preview-actions">' +
                  '<span class="gallery-piece-preview-label">' + (isCover ? 'Cover frame' : 'Frame ' + (index + 1)) + '</span>' +
                  '<button type="button" class="ghost-button gallery-piece-preview-button" data-set-cover="' + safeUrl + '">' + (isCover ? 'Selected' : 'Use as cover') + '</button>' +
                  '<button type="button" class="ghost-button gallery-piece-preview-button" data-edit-gallery-image="' + index + '">Edit frame</button>' +
                  '<button type="button" class="ghost-button gallery-piece-preview-button" data-move-gallery-image="' + index + '" data-move-gallery-image-direction="-1" ' + moveLeftDisabled + '>Move left</button>' +
                  '<button type="button" class="ghost-button gallery-piece-preview-button" data-move-gallery-image="' + index + '" data-move-gallery-image-direction="1" ' + moveRightDisabled + '>Move right</button>' +
                  '<button type="button" class="ghost-button gallery-piece-preview-button" data-remove-gallery-image="' + index + '">Remove image</button>' +
                '</div>' +
              '</div>';
            })
            .join('');
        }

        function readUrlListValue(field, options) {
          if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) {
            return [];
          }

          const dedupe = options && options.dedupe === true;
          const seen = new Set();
          return String(field.value || '')
            .split(/\\r?\\n/)
            .map(function (line) { return line.trim(); })
            .filter(Boolean)
            .filter(function (url) {
              if (!dedupe) {
                return true;
              }

              if (seen.has(url)) {
                return false;
              }

              seen.add(url);
              return true;
            });
        }

        function writeUrlListValue(field, urls, options) {
          if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) {
            return [];
          }

          const dedupe = options && options.dedupe === true;
          const nextUrls = [];
          const seen = new Set();

          (Array.isArray(urls) ? urls : []).forEach(function (url) {
            const normalized = String(url || '').trim();
            if (!normalized) {
              return;
            }

            if (dedupe) {
              if (seen.has(normalized)) {
                return;
              }

              seen.add(normalized);
            }

            nextUrls.push(normalized);
          });

          field.value = nextUrls.join('\\n');
          return nextUrls;
        }

        function getCoverAfterRemovingImage(imageUrls, currentCoverUrl, removedIndex) {
          if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
            return '';
          }

          const normalizedRemovedIndex = Number.isInteger(removedIndex) ? removedIndex : -1;
          const removedUrl = normalizedRemovedIndex >= 0 ? imageUrls[normalizedRemovedIndex] : '';
          const nextUrls = imageUrls.filter(function (_url, index) {
            return index !== normalizedRemovedIndex;
          });

          if (nextUrls.length === 0) {
            return '';
          }

          if (currentCoverUrl && currentCoverUrl !== removedUrl && nextUrls.includes(currentCoverUrl)) {
            return currentCoverUrl;
          }

          return nextUrls[normalizedRemovedIndex] || nextUrls[normalizedRemovedIndex - 1] || nextUrls[0] || '';
        }

        function moveImageInList(imageUrls, index, direction) {
          if (!Array.isArray(imageUrls)) {
            return [];
          }

          const currentIndex = Number(index);
          const nextIndex = currentIndex + Number(direction);
          if (
            !Number.isInteger(currentIndex) ||
            !Number.isInteger(nextIndex) ||
            currentIndex < 0 ||
            nextIndex < 0 ||
            currentIndex >= imageUrls.length ||
            nextIndex >= imageUrls.length
          ) {
            return imageUrls.slice();
          }

          const nextUrls = imageUrls.slice();
          const movedImage = nextUrls[currentIndex];
          nextUrls[currentIndex] = nextUrls[nextIndex];
          nextUrls[nextIndex] = movedImage;
          return nextUrls;
        }

        function getGalleryCardImageFields(card) {
          if (!(card instanceof HTMLElement)) {
            return null;
          }

          const coverImageUrlField = card.querySelector('[data-field="coverImageUrl"]');
          const imageUrlsField = card.querySelector('[data-field="imageUrls"]');
          const newImageUrlField = card.querySelector('[data-field="newImageUrl"]');

          if (!(coverImageUrlField instanceof HTMLInputElement) || !(imageUrlsField instanceof HTMLTextAreaElement)) {
            return null;
          }

          return {
            coverImageUrlField: coverImageUrlField,
            imageUrlsField: imageUrlsField,
            newImageUrlField: newImageUrlField instanceof HTMLInputElement ? newImageUrlField : null,
          };
        }

        function getJournalCardImageFields(card) {
          if (!(card instanceof HTMLElement)) {
            return null;
          }

          const coverImageUrlField = card.querySelector('[data-field="coverImageUrl"]');
          const galleryImageUrlsField = card.querySelector('[data-field="galleryImageUrls"]');
          const newImageUrlField = card.querySelector('[data-field="newGalleryImageUrl"]');

          if (!(coverImageUrlField instanceof HTMLInputElement) || !(galleryImageUrlsField instanceof HTMLTextAreaElement)) {
            return null;
          }

          return {
            coverImageUrlField: coverImageUrlField,
            galleryImageUrlsField: galleryImageUrlsField,
            newImageUrlField: newImageUrlField instanceof HTMLInputElement ? newImageUrlField : null,
          };
        }

        function readPiecesFromDom() {
          if (!galleryEditorEl) return [];

          return Array.from(galleryEditorEl.querySelectorAll('[data-piece-card]'))
            .map(function (card) {
              const pieceIndex = Number(card.getAttribute('data-piece-index'));
              const title = card.querySelector('[data-field="title"]');
              const category = card.querySelector('[data-field="category"]');
              const subcategory = card.querySelector('[data-field="subcategory"]');
              const material = card.querySelector('[data-field="material"]');
              const note = card.querySelector('[data-field="note"]');
              const featured = card.querySelector('[data-field="featured"]');
              const coverImageUrl = card.querySelector('[data-field="coverImageUrl"]');
              const imageUrls = card.querySelector('[data-field="imageUrls"]');
              const idInput = card.querySelector('[data-field="id"]');

              const normalized = normalizeEditorPiece({
                id: idInput && typeof idInput.value === 'string' ? idInput.value.trim() : '',
                title: title && typeof title.value === 'string' ? title.value.trim() : '',
                category: category && typeof category.value === 'string' ? category.value.trim() : '',
                subcategory: subcategory && typeof subcategory.value === 'string' ? subcategory.value.trim() : '',
                material: material && typeof material.value === 'string' ? material.value.trim() : '',
                note: note && typeof note.value === 'string' ? note.value.trim() : '',
                featured: Boolean(featured && featured.checked),
                coverImageUrl:
                  coverImageUrl && typeof coverImageUrl.value === 'string'
                    ? coverImageUrl.value.trim()
                    : '',
                imageUrls:
                  imageUrls && typeof imageUrls.value === 'string'
                    ? imageUrls.value.split(/\\r?\\n/).map(function (line) { return line.trim(); }).filter(Boolean)
                    : [],
              });

              normalized.id = normalized.id || slugifyPieceId(normalized.title);
              return {
                pieceIndex: pieceIndex,
                piece: normalized,
              };
            })
            .filter(function (entry) {
              return Number.isInteger(entry.pieceIndex) && entry.pieceIndex >= 0;
            });
        }

        function syncVisiblePiecesIntoState() {
          readPiecesFromDom().forEach(function (entry) {
            galleryPiecesState[entry.pieceIndex] = entry.piece;
          });
        }

        function updateGalleryPieceCount(visibleCount) {
          if (!galleryPieceCountEl) {
            return;
          }

          const totalCount = galleryPiecesState.length;
          galleryPieceCountEl.textContent =
            visibleCount === totalCount
              ? totalCount + ' piece' + (totalCount === 1 ? '' : 's')
              : visibleCount + ' of ' + totalCount + ' pieces';
        }

        function renderGalleryEditor() {
          if (!galleryEditorEl) return;

          const filters = getGalleryFilterState();
          const visiblePieces = galleryPiecesState
            .map(function (piece, pieceIndex) {
              return {
                pieceIndex: pieceIndex,
                piece: normalizeEditorPiece(piece),
              };
            })
            .filter(function (entry) {
              return pieceMatchesFilters(entry.piece, filters);
            });

          updateGalleryPieceCount(visiblePieces.length);

          if (visiblePieces.length === 0) {
            galleryEditorEl.innerHTML = '<div class="empty-editor-state">No pieces match the current search or room filter.</div>';
            return;
          }

          galleryEditorEl.innerHTML = visiblePieces
            .map(function (entry, visibleIndex) {
              const normalized = normalizeEditorPiece(entry.piece);
              const imageCount = normalized.imageUrls.length;
              const summaryTitle = normalized.title || 'Untitled piece';
              const summaryMeta = normalized.category + ' / ' + normalized.subcategory + ' / ' + imageCount + ' image' + (imageCount === 1 ? '' : 's');
              const previewMarkup = buildPiecePreviewMarkup(normalized.imageUrls, normalized.coverImageUrl);
              const hasPendingImageEdit = pendingGalleryImageEdit && pendingGalleryImageEdit.pieceIndex === entry.pieceIndex;
              const pendingImageUrl = hasPendingImageEdit ? pendingGalleryImageEdit.url : '';
              const imageUrlButtonLabel = hasPendingImageEdit ? 'Replace frame' : 'Add URL';
              const imageUrlHelp = hasPendingImageEdit
                ? 'Editing frame ' + (pendingGalleryImageEdit.imageIndex + 1) + '. Paste a new URL or use the library, then press Replace frame.'
                : 'Paste one image URL or use the library to add another frame.';

              return '<details class="gallery-piece-card" data-piece-card data-piece-index="' + entry.pieceIndex + '" ' + (visibleIndex < 1 ? 'open' : '') + '>' +
                '<summary>' +
                  '<div>' +
                    '<strong>' + escapeHtmlValue(summaryTitle) + '</strong>' +
                    '<div class="gallery-piece-meta">' + escapeHtmlValue(summaryMeta) + (normalized.featured ? ' / featured' : '') + '</div>' +
                  '</div>' +
                  '<button type="button" class="danger-button" data-remove-piece="' + entry.pieceIndex + '">Remove</button>' +
                '</summary>' +
                '<div class="gallery-piece-body">' +
                  '<div class="piece-grid">' +
                    '<input type="hidden" data-field="id" value="' + escapeHtmlValue(normalized.id) + '" />' +
                    '<input type="hidden" data-field="coverImageUrl" value="' + escapeHtmlValue(normalized.coverImageUrl) + '" />' +
                    '<p><label>Title<br /><input data-field="title" value="' + escapeHtmlValue(normalized.title) + '" /></label></p>' +
                    '<p><label>Material<br /><input data-field="material" value="' + escapeHtmlValue(normalized.material) + '" /></label></p>' +
                    '<p><label>Category<br /><select data-field="category">' + categoryOptionsMarkup(normalized.category) + '</select></label></p>' +
                    '<p><label>Subcategory<br /><select data-field="subcategory">' + getSubcategoryOptions(normalized.category, normalized.subcategory) + '</select></label></p>' +
                    '<p class="full"><label>Note<br /><textarea data-field="note" style="min-height:120px;">' + escapeHtmlValue(normalized.note) + '</textarea></label></p>' +
                    '<div class="full"><label>Cover Image</label><p class="upload-help" style="margin:0 0 0.75rem 0;">Choose which frame leads on the homepage, room cards, and archive viewer entry point. You can also reorder frames or remove one image at a time here.</p><div class="gallery-piece-preview-strip">' + previewMarkup + '</div></div>' +
                    '<div class="full journal-field-stack"><label>Add Image URL<br /><input data-field="newImageUrl" data-upload-mode="replace" placeholder="' + escapeHtmlValue(imageUrlHelp) + '" value="' + escapeHtmlValue(pendingImageUrl) + '" /></label><div class="journal-upload-row"><button type="button" class="ghost-button" data-add-gallery-image-url>' + imageUrlButtonLabel + '</button><button type="button" class="ghost-button" data-focus-upload-field="newImageUrl">Use Library</button>' + (hasPendingImageEdit ? '<button type="button" class="ghost-button" data-clear-gallery-image-edit>Cancel edit</button>' : '') + '</div></div>' +
                    '<p class="full"><label>Image URLs (one per line)<br /><textarea data-field="imageUrls" data-upload-mode="append" style="min-height:150px;">' + escapeHtmlValue(normalized.imageUrls.join('\\n')) + '</textarea></label></p>' +
                    '<p class="full"><label class="checkbox-row"><input type="checkbox" data-field="featured" ' + (normalized.featured ? 'checked' : '') + ' /> Featured on homepage portfolio section</label></p>' +
                  '</div>' +
                '</div>' +
              '</details>';
            })
            .join('');

          lastFocusedUploadField = null;
        }

        function normalizeJournalEditorPost(post) {
          const title = post && typeof post.title === 'string' ? post.title.trim() : '';
          const slug = post && typeof post.slug === 'string' ? post.slug.trim() : '';
          const coverImageUrl =
            post && typeof post.coverImageUrl === 'string'
              ? post.coverImageUrl.trim()
              : '';
          const galleryImageUrls = Array.isArray(post && post.galleryImageUrls)
            ? post.galleryImageUrls.map(function (url) { return String(url || '').trim(); }).filter(Boolean)
            : [];

          return {
            id: post && typeof post.id === 'string' ? post.id.trim() : '',
            slug: slug || slugifyPieceId(title),
            title: title,
            excerpt: post && typeof post.excerpt === 'string' ? post.excerpt.trim() : '',
            category: post && typeof post.category === 'string' ? post.category.trim() : '',
            publishedAt: post && typeof post.publishedAt === 'string' ? post.publishedAt.trim() : new Date().toISOString().slice(0, 10),
            featured: post && post.featured === true,
            published: !post || post.published !== false,
            coverImageUrl: coverImageUrl,
            coverImageAlt: post && typeof post.coverImageAlt === 'string' ? post.coverImageAlt.trim() : '',
            galleryImageUrls: Array.from(new Set([coverImageUrl].concat(galleryImageUrls).filter(Boolean))),
            body: post && typeof post.body === 'string' ? post.body.trim() : '',
          };
        }

        function getJournalReadingTime(bodyText) {
          const wordCount = String(bodyText || '')
            .trim()
            .split(/\\s+/)
            .filter(Boolean)
            .length;

          return Math.max(2, Math.ceil(wordCount / 180));
        }

        function buildJournalPreviewCardMarkup(post) {
          const safeCover = escapeHtmlValue(post.coverImageUrl || '');
          const previewImageMarkup = safeCover
            ? '<img src="' + safeCover + '" alt="' + escapeHtmlValue(post.coverImageAlt || post.title || 'Preview image') + '" loading="lazy" />'
            : '<div class="gallery-piece-preview-empty" style="min-height:9rem; display:flex; align-items:center; justify-content:center;">No cover image yet.</div>';
          const previewHref = post.slug ? '/journal/' + encodeURIComponent(post.slug) : '';
          const previewMeta = [
            post.category || 'Uncategorized',
            post.publishedAt || 'Undated',
            getJournalReadingTime(post.body) + ' min read',
            post.published ? 'Published' : 'Draft'
          ].join(' / ');

          return '<div class="journal-preview-card">' +
            '<div>' + previewImageMarkup + '</div>' +
            '<div>' +
              '<div class="journal-preview-kicker">' + escapeHtmlValue(previewMeta) + (post.featured ? ' / featured' : '') + '</div>' +
              '<div class="journal-preview-title">' + escapeHtmlValue(post.title || 'Untitled article') + '</div>' +
              '<p class="journal-preview-copy">' + escapeHtmlValue(post.excerpt || 'Add a short excerpt to shape the preview card and article introduction.') + '</p>' +
              (previewHref
                ? '<a class="journal-preview-link" href="' + previewHref + '" target="_blank" rel="noopener">Open Preview</a>'
                : '<span class="journal-preview-link" style="opacity:0.52;">Add a slug to preview</span>') +
            '</div>' +
          '</div>';
        }

        function isMeaningfulJournalPost(post) {
          return Boolean(post && (post.title || post.excerpt || post.body || post.coverImageUrl));
        }

        function getJournalFilterState() {
          const searchValue =
            journalPostSearchInput && typeof journalPostSearchInput.value === 'string'
              ? journalPostSearchInput.value.trim().toLowerCase()
              : '';
          const statusValue =
            journalPostStatusFilter && typeof journalPostStatusFilter.value === 'string'
              ? journalPostStatusFilter.value
              : 'all';

          return {
            searchValue: searchValue,
            statusValue: statusValue,
          };
        }

        function journalPostMatchesFilters(post, filters) {
          if (filters.statusValue === 'published' && !post.published) {
            return false;
          }

          if (filters.statusValue === 'draft' && post.published) {
            return false;
          }

          if (!filters.searchValue) {
            return true;
          }

          const haystack = [
            post.title,
            post.category,
            post.slug,
            post.excerpt,
          ]
            .join(' ')
            .toLowerCase();

          return haystack.includes(filters.searchValue);
        }

        function buildJournalPreviewMarkup(post) {
          const images = Array.isArray(post.galleryImageUrls) ? post.galleryImageUrls.filter(Boolean) : [];
          if (images.length === 0) {
            return '<div class="gallery-piece-preview-empty">No images linked yet.</div>';
          }

          return images
            .map(function (url, index) {
              const safeUrl = escapeHtmlValue(url);
              const isCover = url === post.coverImageUrl;
              const moveLeftDisabled = index === 0 ? 'disabled' : '';
              const moveRightDisabled = index === images.length - 1 ? 'disabled' : '';
              return '<div class="gallery-piece-preview' + (isCover ? ' is-cover' : '') + '">' +
                '<img src="' + safeUrl + '" alt="Preview image ' + (index + 1) + '" loading="lazy" />' +
                '<div class="gallery-piece-preview-actions">' +
                  '<span class="gallery-piece-preview-label">' + (isCover ? 'Cover frame' : 'Frame ' + (index + 1)) + '</span>' +
                  '<button type="button" class="ghost-button gallery-piece-preview-button" data-set-journal-cover="' + safeUrl + '">' + (isCover ? 'Selected' : 'Use as cover') + '</button>' +
                  '<button type="button" class="ghost-button gallery-piece-preview-button" data-edit-journal-image="' + index + '">Edit frame</button>' +
                  '<button type="button" class="ghost-button gallery-piece-preview-button" data-move-journal-image="' + index + '" data-move-journal-image-direction="-1" ' + moveLeftDisabled + '>Move left</button>' +
                  '<button type="button" class="ghost-button gallery-piece-preview-button" data-move-journal-image="' + index + '" data-move-journal-image-direction="1" ' + moveRightDisabled + '>Move right</button>' +
                  '<button type="button" class="ghost-button gallery-piece-preview-button" data-remove-journal-image="' + index + '">Remove image</button>' +
                '</div>' +
              '</div>';
            })
            .join('');
        }

        function readJournalPostsFromDom() {
          if (!journalEditorEl) return [];

          return Array.from(journalEditorEl.querySelectorAll('[data-journal-card]'))
            .map(function (card) {
              const postIndex = Number(card.getAttribute('data-post-index'));
              const getFieldValue = function (field) {
                const input = card.querySelector('[data-field="' + field + '"]');
                return input && typeof input.value === 'string' ? input.value.trim() : '';
              };
              const galleryImageUrlsField = card.querySelector('[data-field="galleryImageUrls"]');
              const featuredField = card.querySelector('[data-field="featured"]');
              const publishedField = card.querySelector('[data-field="published"]');

              return {
                postIndex: postIndex,
                post: normalizeJournalEditorPost({
                  id: getFieldValue('id'),
                  slug: getFieldValue('slug'),
                  title: getFieldValue('title'),
                  excerpt: getFieldValue('excerpt'),
                  category: getFieldValue('category'),
                  publishedAt: getFieldValue('publishedAt'),
                  featured: Boolean(featuredField && featuredField.checked),
                  published: Boolean(publishedField && publishedField.checked),
                  coverImageUrl: getFieldValue('coverImageUrl'),
                  coverImageAlt: getFieldValue('coverImageAlt'),
                  galleryImageUrls:
                    galleryImageUrlsField && typeof galleryImageUrlsField.value === 'string'
                      ? galleryImageUrlsField.value.split(/\\r?\\n/).map(function (line) { return line.trim(); }).filter(Boolean)
                      : [],
                  body: getFieldValue('body'),
                }),
              };
            })
            .filter(function (entry) {
              return Number.isInteger(entry.postIndex) && entry.postIndex >= 0;
            });
        }

        function syncVisibleJournalPostsIntoState() {
          readJournalPostsFromDom().forEach(function (entry) {
            journalPostsState[entry.postIndex] = entry.post;
          });
        }

        function updateJournalPostCount(visibleCount) {
          if (!journalPostCountEl) {
            return;
          }

          const totalCount = journalPostsState.length;
          journalPostCountEl.textContent =
            visibleCount === totalCount
              ? totalCount + ' post' + (totalCount === 1 ? '' : 's')
              : visibleCount + ' of ' + totalCount + ' posts';
        }

        function renderJournalEditor() {
          if (!journalEditorEl) return;

          const filters = getJournalFilterState();
          const visiblePosts = journalPostsState
            .map(function (post, postIndex) {
              return {
                postIndex: postIndex,
                post: normalizeJournalEditorPost(post),
              };
            })
            .filter(function (entry) {
              return journalPostMatchesFilters(entry.post, filters);
            });

          updateJournalPostCount(visiblePosts.length);

          if (visiblePosts.length === 0) {
            journalEditorEl.innerHTML = '<div class="empty-editor-state">No journal posts match the current search or status filter.</div>';
            return;
          }

          journalEditorEl.innerHTML = visiblePosts
            .map(function (entry, visibleIndex) {
              const normalized = normalizeJournalEditorPost(entry.post);
              const summaryTitle = normalized.title || 'Untitled article';
              const summaryMeta =
                normalized.category + ' / ' + normalized.publishedAt + (normalized.published ? ' / published' : ' / draft');
              const previewMarkup = buildJournalPreviewMarkup(normalized);
              const previewCardMarkup = buildJournalPreviewCardMarkup(normalized);
              const hasPendingImageEdit = pendingJournalImageEdit && pendingJournalImageEdit.postIndex === entry.postIndex;
              const pendingImageUrl = hasPendingImageEdit ? pendingJournalImageEdit.url : '';
              const imageUrlButtonLabel = hasPendingImageEdit ? 'Replace frame' : 'Add URL';
              const imageUrlHelp = hasPendingImageEdit
                ? 'Editing frame ' + (pendingJournalImageEdit.imageIndex + 1) + '. Paste a new URL or use the library, then press Replace frame.'
                : 'Paste one image URL or use the library to add another frame.';

              return '<details class="gallery-piece-card" data-journal-card data-post-index="' + entry.postIndex + '" ' + (visibleIndex < 1 ? 'open' : '') + '>' +
                '<summary>' +
                  '<div>' +
                    '<strong>' + escapeHtmlValue(summaryTitle) + '</strong>' +
                    '<div class="gallery-piece-meta">' + escapeHtmlValue(summaryMeta) + (normalized.featured ? ' / featured' : '') + '</div>' +
                  '</div>' +
                  '<div class="journal-summary-actions">' +
                    '<button type="button" class="ghost-button" data-move-journal-post="' + entry.postIndex + '" data-direction="-1">Up</button>' +
                    '<button type="button" class="ghost-button" data-move-journal-post="' + entry.postIndex + '" data-direction="1">Down</button>' +
                    '<button type="button" class="ghost-button" data-duplicate-journal-post="' + entry.postIndex + '">Duplicate</button>' +
                    '<button type="button" class="danger-button" data-remove-journal-post="' + entry.postIndex + '">Remove</button>' +
                  '</div>' +
                '</summary>' +
                '<div class="gallery-piece-body">' +
                  '<div class="piece-grid">' +
                    '<input type="hidden" data-field="id" value="' + escapeHtmlValue(normalized.id) + '" />' +
                    '<p><label>Title<br /><input data-field="title" value="' + escapeHtmlValue(normalized.title) + '" /></label></p>' +
                    '<p><label>Slug<br /><input data-field="slug" value="' + escapeHtmlValue(normalized.slug) + '" /></label></p>' +
                    '<p><label>Category<br /><input data-field="category" value="' + escapeHtmlValue(normalized.category) + '" /></label></p>' +
                    '<p><label>Publish Date<br /><input type="date" data-field="publishedAt" value="' + escapeHtmlValue(normalized.publishedAt) + '" /></label></p>' +
                    '<div class="full">' + previewCardMarkup + '</div>' +
                    '<p class="full"><label>Excerpt<br /><textarea data-field="excerpt" style="min-height:110px;">' + escapeHtmlValue(normalized.excerpt) + '</textarea></label></p>' +
                    '<div class="journal-field-stack"><label>Cover Image URL<br /><input data-field="coverImageUrl" data-upload-mode="replace" value="' + escapeHtmlValue(normalized.coverImageUrl) + '" /></label><div class="journal-upload-row"><input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" data-journal-upload-file="cover" /><button type="button" class="ghost-button" data-upload-journal-field="cover">Upload Cover</button><button type="button" class="ghost-button" data-focus-upload-field="coverImageUrl">Use Library</button></div></div>' +
                    '<p><label>Cover Image Alt<br /><input data-field="coverImageAlt" value="' + escapeHtmlValue(normalized.coverImageAlt) + '" /></label></p>' +
                    '<div class="full"><label>Image Selection</label><p class="upload-help" style="margin:0 0 0.75rem 0;">Choose the frame that leads the article, cards, and journal preview. You can reorder frames or remove a single image here.</p><div class="gallery-piece-preview-strip">' + previewMarkup + '</div></div>' +
                    '<div class="full journal-field-stack"><label>Add Image URL<br /><input data-field="newGalleryImageUrl" data-upload-mode="replace" placeholder="' + escapeHtmlValue(imageUrlHelp) + '" value="' + escapeHtmlValue(pendingImageUrl) + '" /></label><div class="journal-upload-row"><button type="button" class="ghost-button" data-add-journal-image-url>' + imageUrlButtonLabel + '</button><button type="button" class="ghost-button" data-focus-upload-field="newGalleryImageUrl">Use Library</button>' + (hasPendingImageEdit ? '<button type="button" class="ghost-button" data-clear-journal-image-edit>Cancel edit</button>' : '') + '</div></div>' +
                    '<div class="full journal-field-stack"><label>Gallery Images (one per line)<br /><textarea data-field="galleryImageUrls" data-upload-mode="append" style="min-height:140px;">' + escapeHtmlValue(normalized.galleryImageUrls.join('\\n')) + '</textarea></label><div class="journal-upload-row"><input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" data-journal-upload-file="gallery" multiple /><button type="button" class="ghost-button" data-upload-journal-field="gallery">Upload To Gallery</button><button type="button" class="ghost-button" data-focus-upload-field="galleryImageUrls">Use Library</button></div></div>' +
                    '<div class="full"><label>Body</label><div class="body-tools"><button type="button" class="ghost-button" data-insert-body-snippet="heading">Heading</button><button type="button" class="ghost-button" data-insert-body-snippet="quote">Quote</button><button type="button" class="ghost-button" data-insert-body-snippet="list">List</button><button type="button" class="ghost-button" data-insert-body-snippet="break">Paragraph Break</button></div><textarea data-field="body" style="min-height:240px;">' + escapeHtmlValue(normalized.body) + '</textarea></div>' +
                    '<p><label class="checkbox-row"><input type="checkbox" data-field="published" ' + (normalized.published ? 'checked' : '') + ' /> Published on public site</label></p>' +
                    '<p><label class="checkbox-row"><input type="checkbox" data-field="featured" ' + (normalized.featured ? 'checked' : '') + ' /> Feature in homepage journal preview</label></p>' +
                  '</div>' +
                '</div>' +
              '</details>';
            })
            .join('');

          lastFocusedUploadField = null;
        }

        function setStatus(message, isError) {
          if (!statusEl) return;
          statusEl.textContent = message;
          statusEl.style.color = isError ? '#b91c1c' : '#6b7280';
        }

        function normalizeUploadsPath(value) {
          return String(value || '')
            .replace(/\\\\/g, '/')
            .split('/')
            .map(function (segment) { return segment.trim(); })
            .filter(Boolean)
            .join('/');
        }

        function getParentUploadsPath(value) {
          const normalized = normalizeUploadsPath(value);
          if (!normalized) {
            return '';
          }

          const segments = normalized.split('/');
          segments.pop();
          return segments.join('/');
        }

        function syncUploadsFolderInput() {
          if (uploadsFolderInput instanceof HTMLInputElement) {
            uploadsFolderInput.value = currentUploadsPath;
          }
        }

        function renderUploadsPathbar() {
          if (!uploadsPathbarEl) {
            return;
          }

          const normalized = normalizeUploadsPath(currentUploadsPath);
          const segments = normalized ? normalized.split('/') : [];
          let html = '<div class="uploads-current-path">';
          html += '<button type="button" class="uploads-breadcrumb' + (segments.length === 0 ? ' is-current' : '') + '" data-open-folder="">Root</button>';

          let runningPath = '';
          segments.forEach(function (segment, index) {
            runningPath = runningPath ? runningPath + '/' + segment : segment;
            html += '<span class="uploads-breadcrumb-separator">/</span>';
            html += '<button type="button" class="uploads-breadcrumb' + (index === segments.length - 1 ? ' is-current' : '') + '" data-open-folder="' + escapeHtmlValue(runningPath) + '">' + escapeHtmlValue(segment) + '</button>';
          });

          html += '</div>';
          uploadsPathbarEl.innerHTML = html;
        }

        function renderUploads() {
          if (!uploadsListEl) return;

          const searchTerm =
            uploadsSearchInput && typeof uploadsSearchInput.value === 'string'
              ? uploadsSearchInput.value.trim().toLowerCase()
              : '';

          const visibleUploads = cachedUploadEntries
            .filter(function (item) {
              if (!searchTerm) {
                return true;
              }

              const searchableText = [
                item && typeof item.name === 'string' ? item.name.toLowerCase() : '',
                item && typeof item.path === 'string' ? item.path.toLowerCase() : '',
                item && typeof item.folder === 'string' ? item.folder.toLowerCase() : '',
                item && typeof item.url === 'string' ? item.url.toLowerCase() : '',
              ].join(' ');

              return searchableText.includes(searchTerm);
            })
            .slice(0, 80);

          if (visibleUploads.length === 0) {
            uploadsListEl.innerHTML = searchTerm
              ? '<p class="upload-help">No files or folders match that search in this location.</p>'
              : '<p class="upload-help">This folder is empty.</p>';
            return;
          }

          uploadsListEl.innerHTML = visibleUploads
            .map(function (item) {
              if (item && item.type === 'directory') {
                const safePath = escapeHtmlValue(String(item.path || ''));
                const folderLabel = item.folder ? '<div class="upload-card-folder">' + escapeHtmlValue(item.folder) + '</div>' : '<div class="upload-card-folder">Root</div>';
                return '<div class="upload-card upload-folder-card">' +
                  '<div>' +
                    '<div class="upload-folder-icon">DIR</div>' +
                    folderLabel +
                    '<div class="upload-card-title">' + escapeHtmlValue(String(item.name || 'Untitled folder')) + '</div>' +
                    '<div class="upload-card-meta">' + escapeHtmlValue(String(item.itemCount || 0)) + ' item' + (Number(item.itemCount) === 1 ? '' : 's') + '</div>' +
                  '</div>' +
                  '<div class="upload-card-actions">' +
                    '<button type="button" class="ghost-button" data-open-folder="' + safePath + '">Open</button>' +
                    '<button type="button" class="ghost-button" data-delete-folder="' + safePath + '">Delete</button>' +
                  '</div>' +
                '</div>';
              }

              const safePath = escapeHtmlValue(String(item.path || ''));
              const safeUrl = escapeHtmlValue(String(item.url || ''));
              const previewSrc = '/api/uploads/image?path=' + encodeURIComponent(String(item.path || ''));
              const folderLabel = item.folder ? '<div class="upload-card-folder">' + escapeHtmlValue(item.folder) + '</div>' : '<div class="upload-card-folder">Root</div>';
              return '<div class="upload-card">' +
                '<img src="' + previewSrc + '" alt="Uploaded image" loading="lazy" />' +
                folderLabel +
                '<div class="upload-card-title">' + escapeHtmlValue(String(item.name || 'Untitled file')) + '</div>' +
                '<a href="' + safeUrl + '" target="_blank" rel="noopener">' + safeUrl + '</a>' +
                '<div class="upload-card-meta">' + escapeHtmlValue(String(item.mimeType || 'file')) + '</div>' +
                '<div class="upload-card-actions">' +
                  '<button type="button" class="ghost-button" data-copy-upload="' + safeUrl + '">Copy URL</button>' +
                  '<button type="button" class="ghost-button" data-insert-upload="' + safeUrl + '">Insert</button>' +
                  '<button type="button" class="ghost-button" data-delete-upload="' + safePath + '">Delete</button>' +
                '</div>' +
              '</div>';
            })
            .join('');
        }

        async function refreshUploads(nextPath) {
          if (!uploadsListEl) return;

          try {
            currentUploadsPath = normalizeUploadsPath(nextPath !== undefined ? nextPath : currentUploadsPath);
            syncUploadsFolderInput();
            renderUploadsPathbar();

            const query = currentUploadsPath
              ? '?path=' + encodeURIComponent(currentUploadsPath)
              : '';
            const response = await fetch('/api/uploads/tree' + query, {
              cache: 'no-store',
              credentials: 'same-origin',
            });
            if (!response.ok) {
              throw new Error('Failed to load uploads.');
            }

            const uploads = await response.json();
            cachedUploadEntries = Array.isArray(uploads) ? uploads : [];
            renderUploads();
          } catch {
            uploadsListEl.innerHTML = '<p class="upload-help">Failed to load uploaded images.</p>';
          }
        }

        async function fileToBase64(file) {
          return new Promise(function (resolve, reject) {
            const reader = new FileReader();
            reader.onload = function () {
              const result = typeof reader.result === 'string' ? reader.result : '';
              const commaIndex = result.indexOf(',');
              if (commaIndex < 0) {
                reject(new Error('Invalid image data.'));
                return;
              }

              resolve(result.slice(commaIndex + 1));
            };
            reader.onerror = function () {
              reject(new Error('Could not read file.'));
            };
            reader.readAsDataURL(file);
          });
        }

        function setInlineUploadStatus(targetField, message, state) {
          if (!targetField) {
            return;
          }

          const statusNode = document.querySelector('[data-upload-status-for="' + targetField + '"]');
          if (!(statusNode instanceof HTMLElement)) {
            return;
          }

          statusNode.textContent = message || '';
          statusNode.classList.remove('is-error', 'is-success');
          if (state === 'error') {
            statusNode.classList.add('is-error');
          } else if (state === 'success') {
            statusNode.classList.add('is-success');
          }
        }

        function triggerFieldChange(field) {
          field.dispatchEvent(new Event('input', { bubbles: true }));
          field.dispatchEvent(new Event('change', { bubbles: true }));
        }

        function insertUploadUrlIntoField(field, url, mode) {
          if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) {
            return;
          }

          const uploadMode = mode || field.getAttribute('data-upload-mode') || 'append';
          const currentValue = String(field.value || '').trim();
          field.value = uploadMode === 'replace'
            ? url
            : currentValue ? currentValue + '\\n' + url : url;
          triggerFieldChange(field);
          field.focus();
        }

        async function uploadSingleImage(file) {
          const base64Data = await fileToBase64(file);
          const targetFolder = normalizeUploadsPath(uploadsFolderInput && uploadsFolderInput instanceof HTMLInputElement ? uploadsFolderInput.value.trim() : currentUploadsPath);
          const response = await fetch('/api/uploads/files', {
            method: 'POST',
            cache: 'no-store',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: file.name,
              folder: targetFolder || undefined,
              mimeType: file.type,
              base64Data: base64Data,
            }),
          });

          const payload = await response.json();
          if (!response.ok || !payload || typeof payload.url !== 'string') {
            throw new Error(payload && payload.message ? payload.message : 'Upload failed.');
          }

          return payload.url;
        }

        async function uploadMultipleImages(files) {
          const uploadedUrls = [];

          for (const file of files) {
            uploadedUrls.push(await uploadSingleImage(file));
          }

          return uploadedUrls;
        }

        async function uploadGalleryDeviceFiles() {
          if (!(galleryDeviceUploadInput instanceof HTMLInputElement)) {
            return;
          }

          const files = galleryDeviceUploadInput.files ? Array.from(galleryDeviceUploadInput.files) : [];
          if (files.length === 0) {
            setStatus('Select one or more gallery images first.', true);
            return;
          }

          const folderPath = applyGalleryUploadFolder({ openFolder: false });
          const shouldInsertIntoFocusedField =
            lastFocusedUploadField instanceof HTMLTextAreaElement &&
            document.contains(lastFocusedUploadField) &&
            galleryEditorEl &&
            galleryEditorEl.contains(lastFocusedUploadField);

          try {
            if (galleryUploadFilesButton instanceof HTMLButtonElement) {
              galleryUploadFilesButton.disabled = true;
              galleryUploadFilesButton.textContent = 'Uploading...';
            }

            setStatus('Uploading gallery image' + (files.length === 1 ? '' : 's') + ' to ' + folderPath + '...', false);
            const uploadedUrls = await uploadMultipleImages(files);
            if (shouldInsertIntoFocusedField) {
              uploadedUrls.forEach(function (url) {
                insertUploadUrlIntoField(lastFocusedUploadField, url, 'append');
              });
              syncVisiblePiecesIntoState();
              renderGalleryEditor();
            }

            galleryDeviceUploadInput.value = '';
            await refreshUploads(folderPath);
            setStatus(
              shouldInsertIntoFocusedField
                ? 'Uploaded ' + uploadedUrls.length + ' image' + (uploadedUrls.length === 1 ? '' : 's') + ' and inserted the URLs into the selected gallery field.'
                : 'Uploaded ' + uploadedUrls.length + ' image' + (uploadedUrls.length === 1 ? '' : 's') + ' to ' + folderPath + '.',
              false
            );
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Upload failed.';
            setStatus(message, true);
          } finally {
            if (galleryUploadFilesButton instanceof HTMLButtonElement) {
              galleryUploadFilesButton.disabled = false;
              galleryUploadFilesButton.textContent = 'Upload Files';
            }
          }
        }

        function getContentImageUploadElements(form, targetField) {
          if (!(form instanceof HTMLFormElement) || !targetField) {
            return null;
          }

          const row = form.querySelector('.upload-row');
          const fileInput = row ? row.querySelector('input.image-file-input[data-target-field="' + targetField + '"]') : null;
          const targetInput = form.elements.namedItem(targetField);
          const uploadButton = row ? row.querySelector('.image-upload-button[data-target-field="' + targetField + '"]') : null;

          return {
            row: row,
            fileInput: fileInput,
            targetInput: targetInput,
            uploadButton: uploadButton,
          };
        }

        async function uploadContentImageForField(form, targetField, options) {
          const elements = getContentImageUploadElements(form, targetField);
          const fileInput = elements && elements.fileInput;
          const targetInput = elements && elements.targetInput;
          const uploadButton = elements && elements.uploadButton;
          const selectedFile =
            fileInput instanceof HTMLInputElement && fileInput.files
              ? fileInput.files[0]
              : null;

          if (!selectedFile || !(targetInput instanceof HTMLInputElement || targetInput instanceof HTMLTextAreaElement)) {
            setInlineUploadStatus(targetField, 'Select an image first.', 'error');
            throw new Error('Select an image first.');
          }

          const buttonWasDisabled = uploadButton instanceof HTMLButtonElement ? uploadButton.disabled : false;
          const originalButtonLabel =
            uploadButton instanceof HTMLButtonElement
              ? uploadButton.textContent
              : null;

          try {
            if (uploadButton instanceof HTMLButtonElement) {
              uploadButton.disabled = true;
              uploadButton.textContent = 'Uploading...';
            }

            setInlineUploadStatus(targetField, 'Uploading image...', 'pending');
            setStatus('Uploading image...', false);

            const uploadedUrl = await uploadSingleImage(selectedFile);
            targetInput.value = uploadedUrl;
            triggerFieldChange(targetInput);
            targetInput.focus();

            if (fileInput instanceof HTMLInputElement && options && options.clearSelection !== false) {
              fileInput.value = '';
            }

            setInlineUploadStatus(targetField, 'Image uploaded. Save this section to publish it.', 'success');
            setStatus('Image uploaded. URL inserted into field.', false);
            await refreshUploads(normalizeUploadsPath(uploadsFolderInput && uploadsFolderInput instanceof HTMLInputElement ? uploadsFolderInput.value : currentUploadsPath));
            return uploadedUrl;
          } finally {
            if (uploadButton instanceof HTMLButtonElement) {
              uploadButton.disabled = buttonWasDisabled;
              uploadButton.textContent = originalButtonLabel || 'Upload Image';
            }
          }
        }

        document.querySelectorAll('.image-upload-button').forEach(function (button) {
          button.addEventListener('click', async function (event) {
            event.preventDefault();
            const targetField = button.getAttribute('data-target-field');
            if (!targetField) return;

            const form = button.closest('form');
            if (!(form instanceof HTMLFormElement)) {
              return;
            }

            try {
              await uploadContentImageForField(form, targetField, { clearSelection: true });
            } catch (error) {
              const message = error instanceof Error ? error.message : 'Upload failed.';
              setInlineUploadStatus(targetField, message, 'error');
              setStatus(message, true);
            }
          });
        });

        document.querySelectorAll('.image-file-input').forEach(function (input) {
          input.addEventListener('change', function () {
            if (!(input instanceof HTMLInputElement)) {
              return;
            }

            const targetField = input.getAttribute('data-target-field');
            if (!targetField) {
              return;
            }

            const hasSelection = Boolean(input.files && input.files.length);
            setInlineUploadStatus(
              targetField,
              hasSelection ? 'Image selected. Press Upload Image to insert it.' : '',
              hasSelection ? 'success' : 'pending',
            );
          });
        });

        document.querySelectorAll('[data-journal-upload-file]').forEach(function (input) {
          input.addEventListener('change', function () {
            if (!(input instanceof HTMLInputElement)) {
              return;
            }

            const selectedCount = input.files ? input.files.length : 0;
            if (selectedCount === 0) {
              return;
            }

            setStatus(
              'Selected ' + selectedCount + ' image' + (selectedCount === 1 ? '' : 's') + ' for journal upload.',
              false
            );
          });
        });

        document.querySelectorAll('form[data-image-upload-form]').forEach(function (formNode) {
          formNode.addEventListener('submit', async function (event) {
            if (!(formNode instanceof HTMLFormElement)) {
              return;
            }

            if (formNode.dataset.uploadingBeforeSubmit === 'true') {
              return;
            }

            const targetField = formNode.getAttribute('data-image-upload-target');
            if (!targetField) {
              return;
            }

            const elements = getContentImageUploadElements(formNode, targetField);
            const fileInput = elements && elements.fileInput;
            const hasPendingFile =
              fileInput instanceof HTMLInputElement &&
              Boolean(fileInput.files && fileInput.files.length);

            if (!hasPendingFile) {
              return;
            }

            event.preventDefault();

            try {
              await uploadContentImageForField(formNode, targetField, { clearSelection: true });
              formNode.dataset.uploadingBeforeSubmit = 'true';
              formNode.submit();
            } catch (error) {
              const message = error instanceof Error ? error.message : 'Upload failed.';
              setInlineUploadStatus(targetField, message, 'error');
              setStatus(message, true);
            } finally {
              delete formNode.dataset.uploadingBeforeSubmit;
            }
          });
        });

        document.addEventListener('click', async function (event) {
          if (!(event.target instanceof Element)) {
            return;
          }

          const openFolderButton = event.target.closest('[data-open-folder]');
          if (openFolderButton) {
            event.preventDefault();
            await refreshUploads(openFolderButton.getAttribute('data-open-folder') || '');
            return;
          }

          const deleteButton = event.target.closest('[data-delete-upload]');
          if (deleteButton) {
            event.preventDefault();
            const targetPath = deleteButton.getAttribute('data-delete-upload');
            if (!targetPath) {
              setStatus('Unable to identify file to delete.', true);
              return;
            }

            try {
              setStatus('Deleting file...', false);
              const response = await fetch('/api/uploads/files?path=' + encodeURIComponent(targetPath), {
                method: 'DELETE',
                cache: 'no-store',
                credentials: 'same-origin',
              });

              if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                throw new Error(payload && payload.message ? payload.message : 'Delete failed.');
              }

              setStatus('File deleted. Refreshing folder...', false);
              await refreshUploads(currentUploadsPath);
            } catch (error) {
              const message = error instanceof Error ? error.message : 'Delete failed.';
              setStatus(message, true);
            }
            return;
          }

          const deleteFolderButton = event.target.closest('[data-delete-folder]');
          if (deleteFolderButton) {
            event.preventDefault();
            const targetPath = deleteFolderButton.getAttribute('data-delete-folder');
            if (!targetPath) {
              setStatus('Unable to identify folder to delete.', true);
              return;
            }

            try {
              setStatus('Deleting folder...', false);
              const response = await fetch('/api/uploads/folders?path=' + encodeURIComponent(targetPath), {
                method: 'DELETE',
                cache: 'no-store',
                credentials: 'same-origin',
              });

              if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                throw new Error(payload && payload.message ? payload.message : 'Delete failed.');
              }

              const currentNormalized = normalizeUploadsPath(currentUploadsPath);
              const deletedNormalized = normalizeUploadsPath(targetPath);
              const shouldMoveUp = currentNormalized === deletedNormalized || currentNormalized.startsWith(deletedNormalized + '/');
              setStatus('Folder deleted. Refreshing folder...', false);
              await refreshUploads(shouldMoveUp ? getParentUploadsPath(deletedNormalized) : currentUploadsPath);
            } catch (error) {
              const message = error instanceof Error ? error.message : 'Delete failed.';
              setStatus(message, true);
            }
            return;
          }

          const setGalleryFolderButton = event.target.closest('[data-set-gallery-folder]');
          if (setGalleryFolderButton) {
            event.preventDefault();
            const categoryName = setGalleryFolderButton.getAttribute('data-set-gallery-folder') || '';
            if (!(galleryUploadCategorySelect instanceof HTMLSelectElement)) {
              return;
            }

            galleryUploadCategorySelect.value = categoryName;
            updateGalleryUploadSubcategoryOptions();
            const folderPath = applyGalleryUploadFolder({ openFolder: true });
            setStatus('Target folder set to ' + folderPath + '.', false);
            return;
          }

          const deleteCategoryButton = event.target.closest('[data-delete-gallery-category]');
          if (deleteCategoryButton) {
            event.preventDefault();
            const categoryName = deleteCategoryButton.getAttribute('data-delete-gallery-category') || '';
            if (!categoryName) {
              setStatus('Could not identify category to delete.', true);
              return;
            }

            const confirmed = window.confirm('Delete "' + categoryName + '" and all of its subcategories and pieces? This cannot be undone.');
            if (!confirmed) {
              return;
            }

            try {
              setStatus('Deleting category...', false);
              const response = await fetch('/api/gallery/categories/' + encodeURIComponent(categoryName), {
                method: 'DELETE',
                cache: 'no-store',
                credentials: 'same-origin',
              });

              if (!response.ok) {
                const payload = await response.json().catch(function () { return {}; });
                throw new Error(payload && payload.message ? payload.message : 'Delete failed.');
              }

              setStatus('Category deleted. Refreshing gallery editor...', false);
              window.location.href = '/admin?tab=gallery&status=saved';
            } catch (error) {
              const message = error instanceof Error ? error.message : 'Delete failed.';
              setStatus(message, true);
            }
            return;
          }
        });

        if (createUploadFolderButton) {
          createUploadFolderButton.addEventListener('click', async function () {
            const folderName = normalizeUploadsPath(uploadsFolderInput && uploadsFolderInput instanceof HTMLInputElement ? uploadsFolderInput.value.trim() : currentUploadsPath);
            if (!folderName) {
              setStatus('Enter a folder path first.', true);
              return;
            }

            try {
              setStatus('Creating folder...', false);
              const response = await fetch('/api/uploads/folders', {
                method: 'POST',
                cache: 'no-store',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ folder: folderName }),
              });

              const payload = await response.json();
              if (!response.ok || !payload || typeof payload.path !== 'string') {
                throw new Error(payload && payload.message ? payload.message : 'Could not create folder.');
              }

              setStatus('Folder created: ' + payload.path, false);
              await refreshUploads(payload.path);
            } catch (error) {
              const message = error instanceof Error ? error.message : 'Could not create folder.';
              setStatus(message, true);
            }
          });
        }

        if (uploadsGoRootButton) {
          uploadsGoRootButton.addEventListener('click', function () {
            refreshUploads('');
          });
        }

        if (uploadsGoParentButton) {
          uploadsGoParentButton.addEventListener('click', function () {
            refreshUploads(getParentUploadsPath(currentUploadsPath));
          });
        }

        if (galleryEditorEl && galleryForm && galleryPiecesJsonField) {
          renderGalleryEditor();

          galleryEditorEl.addEventListener('click', function (event) {
            if (!(event.target instanceof Element)) {
              return;
            }

            const removeButton = event.target.closest('[data-remove-piece]');
            if (!removeButton) return;

            event.preventDefault();
            syncVisiblePiecesIntoState();
            const index = Number(removeButton.getAttribute('data-remove-piece'));
            galleryPiecesState = galleryPiecesState.filter(function (_piece, pieceIndex) {
              return pieceIndex !== index;
            });
            renderGalleryEditor();
          });

          galleryEditorEl.addEventListener('click', function (event) {
            if (!(event.target instanceof Element)) {
              return;
            }

            const coverButton = event.target.closest('[data-set-cover]');
            if (!coverButton) {
              return;
            }

            event.preventDefault();
            const card = coverButton.closest('[data-piece-card]');
            const coverImageUrlField = card && card.querySelector('[data-field="coverImageUrl"]');
            const nextCoverUrl = coverButton.getAttribute('data-set-cover') || '';

            if (!(coverImageUrlField instanceof HTMLInputElement) || !nextCoverUrl) {
              return;
            }

            coverImageUrlField.value = nextCoverUrl;
            syncVisiblePiecesIntoState();
            renderGalleryEditor();
            setStatus('Cover image updated for this piece.', false);
          });

          galleryEditorEl.addEventListener('click', function (event) {
            if (!(event.target instanceof Element)) {
              return;
            }

            const editImageButton = event.target.closest('[data-edit-gallery-image]');
            if (editImageButton) {
              event.preventDefault();
              const card = editImageButton.closest('[data-piece-card]');
              const fields = getGalleryCardImageFields(card);
              const imageIndex = Number(editImageButton.getAttribute('data-edit-gallery-image'));
              const currentUrls = fields ? readUrlListValue(fields.imageUrlsField) : [];

              if (!fields || !Number.isInteger(imageIndex) || imageIndex < 0 || imageIndex >= currentUrls.length) {
                return;
              }

              pendingGalleryImageEdit = {
                pieceIndex: Number(card.getAttribute('data-piece-index')),
                imageIndex: imageIndex,
                url: currentUrls[imageIndex],
              };
              renderGalleryEditor();
              setStatus('Frame selected for editing. Paste a new URL or use the library, then press Replace frame.', false);
              return;
            }

            const clearEditButton = event.target.closest('[data-clear-gallery-image-edit]');
            if (clearEditButton) {
              event.preventDefault();
              pendingGalleryImageEdit = null;
              renderGalleryEditor();
              setStatus('Frame edit canceled.', false);
              return;
            }

            const moveButton = event.target.closest('[data-move-gallery-image]');
            if (!moveButton) {
              return;
            }

            event.preventDefault();
            const card = moveButton.closest('[data-piece-card]');
            const fields = getGalleryCardImageFields(card);
            const direction = Number(moveButton.getAttribute('data-move-gallery-image-direction'));
            const imageIndex = Number(moveButton.getAttribute('data-move-gallery-image'));

            if (!fields) {
              return;
            }

            const nextUrls = moveImageInList(readUrlListValue(fields.imageUrlsField), imageIndex, direction);
            writeUrlListValue(fields.imageUrlsField, nextUrls);
            syncVisiblePiecesIntoState();
            renderGalleryEditor();
            setStatus('Gallery image order updated for this piece.', false);
          });

          galleryEditorEl.addEventListener('click', function (event) {
            if (!(event.target instanceof Element)) {
              return;
            }

            const removeImageButton = event.target.closest('[data-remove-gallery-image]');
            if (!removeImageButton) {
              return;
            }

            event.preventDefault();
            const card = removeImageButton.closest('[data-piece-card]');
            const fields = getGalleryCardImageFields(card);
            const imageIndex = Number(removeImageButton.getAttribute('data-remove-gallery-image'));

            if (!fields) {
              return;
            }

            const currentUrls = readUrlListValue(fields.imageUrlsField);
            if (!Number.isInteger(imageIndex) || imageIndex < 0 || imageIndex >= currentUrls.length) {
              return;
            }

            fields.coverImageUrlField.value = getCoverAfterRemovingImage(
              currentUrls,
              fields.coverImageUrlField.value.trim(),
              imageIndex
            );
            writeUrlListValue(
              fields.imageUrlsField,
              currentUrls.filter(function (_url, currentIndex) {
                return currentIndex !== imageIndex;
              })
            );
            syncVisiblePiecesIntoState();
            renderGalleryEditor();
            setStatus('Removed one image from this gallery piece.', false);
          });

          galleryEditorEl.addEventListener('click', function (event) {
            if (!(event.target instanceof Element)) {
              return;
            }

            const addUrlButton = event.target.closest('[data-add-gallery-image-url]');
            if (!addUrlButton) {
              return;
            }

            event.preventDefault();
            const card = addUrlButton.closest('[data-piece-card]');
            const fields = getGalleryCardImageFields(card);
            if (!fields || !(fields.newImageUrlField instanceof HTMLInputElement)) {
              return;
            }

            const nextUrl = fields.newImageUrlField.value.trim();
            if (!nextUrl) {
              setStatus('Paste an image URL first, then add it to this piece.', true);
              return;
            }

            const nextImageUrls = readUrlListValue(fields.imageUrlsField);
            const pieceIndex = Number(card.getAttribute('data-piece-index'));
            const replaceIndex =
              pendingGalleryImageEdit && pendingGalleryImageEdit.pieceIndex === pieceIndex
                ? pendingGalleryImageEdit.imageIndex
                : -1;

            if (Number.isInteger(replaceIndex) && replaceIndex >= 0 && replaceIndex < nextImageUrls.length) {
              nextImageUrls[replaceIndex] = nextUrl;
            } else if (!nextImageUrls.includes(nextUrl)) {
              nextImageUrls.push(nextUrl);
            }
            writeUrlListValue(fields.imageUrlsField, nextImageUrls);
            if (Number.isInteger(replaceIndex) && replaceIndex >= 0 && fields.coverImageUrlField.value.trim() === pendingGalleryImageEdit.url) {
              fields.coverImageUrlField.value = nextUrl;
            } else if (!fields.coverImageUrlField.value.trim()) {
              fields.coverImageUrlField.value = nextUrl;
            }
            fields.newImageUrlField.value = '';
            pendingGalleryImageEdit = null;
            syncVisiblePiecesIntoState();
            renderGalleryEditor();
            setStatus(Number.isInteger(replaceIndex) && replaceIndex >= 0 ? 'Frame updated for this gallery piece.' : 'Image URL added to this gallery piece.', false);
          });

          galleryEditorEl.addEventListener('click', function (event) {
            if (!(event.target instanceof Element)) {
              return;
            }

            const focusButton = event.target.closest('[data-focus-upload-field]');
            if (!focusButton) {
              return;
            }

            event.preventDefault();
            const card = focusButton.closest('[data-piece-card]');
            const fieldName = focusButton.getAttribute('data-focus-upload-field');
            const field = card && card.querySelector('[data-field="' + fieldName + '"]');
            if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) {
              return;
            }

            lastFocusedUploadField = field;
            field.focus();
            syncGalleryFolderFromFocusedPiece();
            setStatus('Field selected. Choose an image from the archive below and press Insert.', false);
          });

          galleryEditorEl.addEventListener('focusin', function (event) {
            const target = event.target;
            if (
              (target instanceof HTMLTextAreaElement || target instanceof HTMLInputElement) &&
              typeof target.getAttribute('data-upload-mode') === 'string'
            ) {
              lastFocusedUploadField = target;
              syncGalleryFolderFromFocusedPiece();
            }
          });

          galleryEditorEl.addEventListener('change', function (event) {
            const target = event.target;
            if (!(target instanceof HTMLSelectElement) || target.getAttribute('data-field') !== 'category') {
              if (
                target instanceof HTMLTextAreaElement &&
                target.getAttribute('data-field') === 'imageUrls'
              ) {
                syncVisiblePiecesIntoState();
                renderGalleryEditor();
              } else if (
                target instanceof HTMLInputElement &&
                target.getAttribute('data-field') === 'coverImageUrl'
              ) {
                syncVisiblePiecesIntoState();
                renderGalleryEditor();
              } else if (
                target instanceof HTMLInputElement &&
                target.getAttribute('data-field') === 'featured'
              ) {
                syncVisiblePiecesIntoState();
                renderGalleryEditor();
              }
              return;
            }

            const card = target.closest('[data-piece-card]');
            const subcategorySelect = card && card.querySelector('[data-field="subcategory"]');
            if (!(subcategorySelect instanceof HTMLSelectElement)) {
              return;
            }

            const category = getCategoryConfig(target.value);
            const nextSubcategory = category && Array.isArray(category.subcategories) ? category.subcategories[0] : '';
            subcategorySelect.innerHTML = getSubcategoryOptions(target.value, nextSubcategory);
            syncVisiblePiecesIntoState();
            renderGalleryEditor();
          });

          if (galleryAddPieceButton) {
            galleryAddPieceButton.addEventListener('click', function () {
              syncVisiblePiecesIntoState();
              const fallbackCategory = galleryCategories[0] || { name: 'Living Room', subcategories: ['Tables'] };
              galleryPiecesState.push(normalizeEditorPiece({
                id: '',
                title: '',
                category: fallbackCategory.name,
                subcategory: fallbackCategory.subcategories[0],
                material: '',
                note: '',
                featured: false,
                coverImageUrl: '',
                imageUrls: [],
              }));
              renderGalleryEditor();
            });
          }

          if (galleryPieceSearchInput) {
            galleryPieceSearchInput.addEventListener('input', function () {
              syncVisiblePiecesIntoState();
              renderGalleryEditor();
            });
          }

          if (galleryPieceCategoryFilter) {
            galleryPieceCategoryFilter.addEventListener('change', function () {
              syncVisiblePiecesIntoState();
              renderGalleryEditor();
            });
          }

          if (galleryExpandAllButton) {
            galleryExpandAllButton.addEventListener('click', function () {
              Array.from(galleryEditorEl.querySelectorAll('[data-piece-card]')).forEach(function (card) {
                card.setAttribute('open', 'open');
              });
            });
          }

          if (galleryCollapseAllButton) {
            galleryCollapseAllButton.addEventListener('click', function () {
              Array.from(galleryEditorEl.querySelectorAll('[data-piece-card]')).forEach(function (card) {
                card.removeAttribute('open');
              });
            });
          }

          galleryForm.addEventListener('submit', function () {
            syncVisiblePiecesIntoState();
            galleryPiecesJsonField.value = JSON.stringify(galleryPiecesState.filter(isMeaningfulPiece));
          });
        }

        if (galleryUploadCategorySelect instanceof HTMLSelectElement) {
          updateGalleryUploadSubcategoryOptions();
          galleryUploadCategorySelect.addEventListener('change', function () {
            updateGalleryUploadSubcategoryOptions();
            const folderPath = applyGalleryUploadFolder({ openFolder: false });
            setStatus('Target folder set to ' + folderPath + '.', false);
          });
        }

        if (galleryUploadSubcategorySelect instanceof HTMLSelectElement) {
          galleryUploadSubcategorySelect.addEventListener('change', function () {
            const folderPath = applyGalleryUploadFolder({ openFolder: false });
            setStatus('Target folder set to ' + folderPath + '.', false);
          });
        }

        if (galleryDeviceUploadInput instanceof HTMLInputElement) {
          galleryDeviceUploadInput.addEventListener('change', function () {
            const selectedCount = galleryDeviceUploadInput.files ? galleryDeviceUploadInput.files.length : 0;
            if (selectedCount === 0) {
              return;
            }

            const folderPath = applyGalleryUploadFolder({ openFolder: false });
            setStatus(
              'Selected ' + selectedCount + ' gallery image' + (selectedCount === 1 ? '' : 's') + ' for ' + folderPath + '.',
              false
            );
          });
        }

        if (gallerySyncFolderButton) {
          gallerySyncFolderButton.addEventListener('click', function () {
            const folderPath = syncGalleryFolderFromFocusedPiece()
              ? getSelectedGalleryUploadFolder()
              : applyGalleryUploadFolder({ openFolder: false });
            setStatus('Target folder set to ' + folderPath + '.', false);
          });
        }

        if (galleryOpenFolderButton) {
          galleryOpenFolderButton.addEventListener('click', function () {
            if (!syncGalleryFolderFromFocusedPiece()) {
              applyGalleryUploadFolder({ openFolder: true });
              return;
            }

            refreshUploads(getSelectedGalleryUploadFolder());
          });
        }

        if (galleryUploadFilesButton) {
          galleryUploadFilesButton.addEventListener('click', function () {
            syncGalleryFolderFromFocusedPiece();
            uploadGalleryDeviceFiles();
          });
        }

        if (journalEditorEl && journalForm && journalPostsJsonField) {
          renderJournalEditor();

          journalEditorEl.addEventListener('click', function (event) {
            if (!(event.target instanceof Element)) {
              return;
            }

            const removeButton = event.target.closest('[data-remove-journal-post]');
            if (!removeButton) return;

            event.preventDefault();
            syncVisibleJournalPostsIntoState();
            const index = Number(removeButton.getAttribute('data-remove-journal-post'));
            journalPostsState = journalPostsState.filter(function (_post, postIndex) {
              return postIndex !== index;
            });
            renderJournalEditor();
          });

          journalEditorEl.addEventListener('click', function (event) {
            if (!(event.target instanceof Element)) {
              return;
            }

            const duplicateButton = event.target.closest('[data-duplicate-journal-post]');
            if (!duplicateButton) {
              return;
            }

            event.preventDefault();
            syncVisibleJournalPostsIntoState();
            const index = Number(duplicateButton.getAttribute('data-duplicate-journal-post'));
            const current = journalPostsState[index];
            if (!current) {
              return;
            }

            const duplicated = normalizeJournalEditorPost({
              ...current,
              id: '',
              slug: current.slug ? current.slug + '-copy' : '',
              title: current.title ? current.title + ' Copy' : '',
              published: false,
              featured: false,
            });
            journalPostsState.splice(index + 1, 0, duplicated);
            renderJournalEditor();
            setStatus('Journal post duplicated as a draft.', false);
          });

          journalEditorEl.addEventListener('click', function (event) {
            if (!(event.target instanceof Element)) {
              return;
            }

            const moveButton = event.target.closest('[data-move-journal-post]');
            if (!moveButton) {
              return;
            }

            event.preventDefault();
            syncVisibleJournalPostsIntoState();
            const index = Number(moveButton.getAttribute('data-move-journal-post'));
            const direction = Number(moveButton.getAttribute('data-direction'));
            const nextIndex = index + direction;

            if (index < 0 || nextIndex < 0 || nextIndex >= journalPostsState.length) {
              return;
            }

            const nextState = journalPostsState.slice();
            const currentPost = nextState[index];
            nextState[index] = nextState[nextIndex];
            nextState[nextIndex] = currentPost;
            journalPostsState = nextState;
            renderJournalEditor();
          });

          journalEditorEl.addEventListener('click', function (event) {
            if (!(event.target instanceof Element)) {
              return;
            }

            const coverButton = event.target.closest('[data-set-journal-cover]');
            if (!coverButton) {
              return;
            }

            event.preventDefault();
            const card = coverButton.closest('[data-journal-card]');
            const coverImageUrlField = card && card.querySelector('[data-field="coverImageUrl"]');
            const nextCoverUrl = coverButton.getAttribute('data-set-journal-cover') || '';

            if (!(coverImageUrlField instanceof HTMLInputElement) || !nextCoverUrl) {
              return;
            }

            coverImageUrlField.value = nextCoverUrl;
            syncVisibleJournalPostsIntoState();
            renderJournalEditor();
            setStatus('Cover image updated for this journal post.', false);
          });

          journalEditorEl.addEventListener('click', function (event) {
            if (!(event.target instanceof Element)) {
              return;
            }

            const editImageButton = event.target.closest('[data-edit-journal-image]');
            if (editImageButton) {
              event.preventDefault();
              const card = editImageButton.closest('[data-journal-card]');
              const fields = getJournalCardImageFields(card);
              const imageIndex = Number(editImageButton.getAttribute('data-edit-journal-image'));
              const currentUrls = fields ? readUrlListValue(fields.galleryImageUrlsField, { dedupe: true }) : [];

              if (!fields || !Number.isInteger(imageIndex) || imageIndex < 0 || imageIndex >= currentUrls.length) {
                return;
              }

              pendingJournalImageEdit = {
                postIndex: Number(card.getAttribute('data-post-index')),
                imageIndex: imageIndex,
                url: currentUrls[imageIndex],
              };
              renderJournalEditor();
              setStatus('Frame selected for editing. Paste a new URL or use the library, then press Replace frame.', false);
              return;
            }

            const clearEditButton = event.target.closest('[data-clear-journal-image-edit]');
            if (clearEditButton) {
              event.preventDefault();
              pendingJournalImageEdit = null;
              renderJournalEditor();
              setStatus('Frame edit canceled.', false);
              return;
            }

            const moveButton = event.target.closest('[data-move-journal-image]');
            if (!moveButton) {
              return;
            }

            event.preventDefault();
            const card = moveButton.closest('[data-journal-card]');
            const fields = getJournalCardImageFields(card);
            const direction = Number(moveButton.getAttribute('data-move-journal-image-direction'));
            const imageIndex = Number(moveButton.getAttribute('data-move-journal-image'));

            if (!fields) {
              return;
            }

            const nextUrls = moveImageInList(readUrlListValue(fields.galleryImageUrlsField, { dedupe: true }), imageIndex, direction);
            writeUrlListValue(fields.galleryImageUrlsField, nextUrls, { dedupe: true });
            syncVisibleJournalPostsIntoState();
            renderJournalEditor();
            setStatus('Journal image order updated for this post.', false);
          });

          journalEditorEl.addEventListener('click', function (event) {
            if (!(event.target instanceof Element)) {
              return;
            }

            const removeImageButton = event.target.closest('[data-remove-journal-image]');
            if (!removeImageButton) {
              return;
            }

            event.preventDefault();
            const card = removeImageButton.closest('[data-journal-card]');
            const fields = getJournalCardImageFields(card);
            const imageIndex = Number(removeImageButton.getAttribute('data-remove-journal-image'));

            if (!fields) {
              return;
            }

            const currentUrls = readUrlListValue(fields.galleryImageUrlsField, { dedupe: true });
            if (!Number.isInteger(imageIndex) || imageIndex < 0 || imageIndex >= currentUrls.length) {
              return;
            }

            fields.coverImageUrlField.value = getCoverAfterRemovingImage(
              currentUrls,
              fields.coverImageUrlField.value.trim(),
              imageIndex
            );
            writeUrlListValue(
              fields.galleryImageUrlsField,
              currentUrls.filter(function (_url, currentIndex) {
                return currentIndex !== imageIndex;
              }),
              { dedupe: true }
            );
            syncVisibleJournalPostsIntoState();
            renderJournalEditor();
            setStatus('Removed one image from this journal post.', false);
          });

          journalEditorEl.addEventListener('click', function (event) {
            if (!(event.target instanceof Element)) {
              return;
            }

            const addUrlButton = event.target.closest('[data-add-journal-image-url]');
            if (!addUrlButton) {
              return;
            }

            event.preventDefault();
            const card = addUrlButton.closest('[data-journal-card]');
            const fields = getJournalCardImageFields(card);
            if (!fields || !(fields.newImageUrlField instanceof HTMLInputElement)) {
              return;
            }

            const nextUrl = fields.newImageUrlField.value.trim();
            if (!nextUrl) {
              setStatus('Paste an image URL first, then add it to this journal post.', true);
              return;
            }

            const nextImageUrls = readUrlListValue(fields.galleryImageUrlsField, { dedupe: true });
            const postIndex = Number(card.getAttribute('data-post-index'));
            const replaceIndex =
              pendingJournalImageEdit && pendingJournalImageEdit.postIndex === postIndex
                ? pendingJournalImageEdit.imageIndex
                : -1;

            if (Number.isInteger(replaceIndex) && replaceIndex >= 0 && replaceIndex < nextImageUrls.length) {
              nextImageUrls[replaceIndex] = nextUrl;
            } else if (!nextImageUrls.includes(nextUrl)) {
              nextImageUrls.push(nextUrl);
            }
            writeUrlListValue(fields.galleryImageUrlsField, nextImageUrls, { dedupe: true });
            if (Number.isInteger(replaceIndex) && replaceIndex >= 0 && fields.coverImageUrlField.value.trim() === pendingJournalImageEdit.url) {
              fields.coverImageUrlField.value = nextUrl;
            } else if (!fields.coverImageUrlField.value.trim()) {
              fields.coverImageUrlField.value = nextUrl;
            }
            fields.newImageUrlField.value = '';
            pendingJournalImageEdit = null;
            syncVisibleJournalPostsIntoState();
            renderJournalEditor();
            setStatus(Number.isInteger(replaceIndex) && replaceIndex >= 0 ? 'Frame updated for this journal post.' : 'Image URL added to this journal post.', false);
          });

          journalEditorEl.addEventListener('click', async function (event) {
            if (!(event.target instanceof Element)) {
              return;
            }

            const uploadButton = event.target.closest('[data-upload-journal-field]');
            if (!uploadButton) {
              return;
            }

            event.preventDefault();
            const uploadTarget = uploadButton.getAttribute('data-upload-journal-field');
            const card = uploadButton.closest('[data-journal-card]');
            const fileInput = card && card.querySelector('[data-journal-upload-file="' + uploadTarget + '"]');
            const coverField = card && card.querySelector('[data-field="coverImageUrl"]');
            const galleryField = card && card.querySelector('[data-field="galleryImageUrls"]');
            const selectedFiles =
              fileInput instanceof HTMLInputElement && fileInput.files
                ? Array.from(fileInput.files)
                : [];

            if (selectedFiles.length === 0) {
              setStatus('Select one or more images first.', true);
              return;
            }

            try {
              if (uploadButton instanceof HTMLButtonElement) {
                uploadButton.disabled = true;
              }
              setStatus('Uploading image' + (selectedFiles.length > 1 ? 's' : '') + '...', false);
              const uploadedUrls = await uploadMultipleImages(selectedFiles);

              if (uploadTarget === 'cover' && coverField instanceof HTMLInputElement) {
                insertUploadUrlIntoField(coverField, uploadedUrls[0], 'replace');
                if (galleryField instanceof HTMLTextAreaElement) {
                  uploadedUrls.forEach(function (url) {
                    insertUploadUrlIntoField(galleryField, url, 'append');
                  });
                }
              } else if (uploadTarget === 'gallery' && galleryField instanceof HTMLTextAreaElement) {
                uploadedUrls.forEach(function (url) {
                  insertUploadUrlIntoField(galleryField, url, 'append');
                });
              }

              if (fileInput instanceof HTMLInputElement) {
                fileInput.value = '';
              }
              renderJournalEditor();
              await refreshUploads(currentUploadsPath);
              setStatus('Uploaded ' + uploadedUrls.length + ' image' + (uploadedUrls.length === 1 ? '' : 's') + ' into the journal post.', false);
            } catch (error) {
              const message = error instanceof Error ? error.message : 'Upload failed.';
              setStatus(message, true);
            } finally {
              if (uploadButton instanceof HTMLButtonElement) {
                uploadButton.disabled = false;
              }
            }
          });

          journalEditorEl.addEventListener('click', function (event) {
            if (!(event.target instanceof Element)) {
              return;
            }

            const focusButton = event.target.closest('[data-focus-upload-field]');
            if (!focusButton) {
              return;
            }

            event.preventDefault();
            const card = focusButton.closest('[data-journal-card]');
            const fieldName = focusButton.getAttribute('data-focus-upload-field');
            const field = card && card.querySelector('[data-field="' + fieldName + '"]');
            if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) {
              return;
            }

            lastFocusedUploadField = field;
            field.focus();
            setStatus('Field selected. Choose an image from the archive below and press Insert.', false);
          });

          journalEditorEl.addEventListener('click', function (event) {
            if (!(event.target instanceof Element)) {
              return;
            }

            const snippetButton = event.target.closest('[data-insert-body-snippet]');
            if (!snippetButton) {
              return;
            }

            event.preventDefault();
            const snippetType = snippetButton.getAttribute('data-insert-body-snippet');
            const card = snippetButton.closest('[data-journal-card]');
            const bodyField = card && card.querySelector('[data-field="body"]');
            if (!(bodyField instanceof HTMLTextAreaElement)) {
              return;
            }

            const snippets = {
              heading: '## New Section',
              quote: '> Add a memorable line here.',
              list: '- First point\\n- Second point',
              break: '',
            };
            const snippet = snippets[snippetType] ?? '';
            const existing = String(bodyField.value || '');
            bodyField.value = existing
              ? existing.replace(/\\s*$/, '') + '\\n\\n' + snippet
              : snippet;
            triggerFieldChange(bodyField);
            bodyField.focus();
          });

          journalEditorEl.addEventListener('focusin', function (event) {
            const target = event.target;
            if (
              (target instanceof HTMLTextAreaElement || target instanceof HTMLInputElement) &&
              typeof target.getAttribute('data-upload-mode') === 'string'
            ) {
              lastFocusedUploadField = target;
            }
          });

          journalEditorEl.addEventListener('change', function (event) {
            const target = event.target;
            if (
              target instanceof HTMLInputElement &&
              target.getAttribute('data-field') === 'title'
            ) {
              const card = target.closest('[data-journal-card]');
              const slugField = card && card.querySelector('[data-field="slug"]');
              const currentSlug = slugField instanceof HTMLInputElement ? slugField.value.trim() : '';
              const titleSlug = slugifyPieceId(target.value || '');

              if (slugField instanceof HTMLInputElement && !currentSlug) {
                slugField.value = titleSlug;
              }
            }

            if (
              target instanceof HTMLTextAreaElement &&
              target.getAttribute('data-field') === 'galleryImageUrls'
            ) {
              syncVisibleJournalPostsIntoState();
              renderJournalEditor();
              return;
            }

            if (
              target instanceof HTMLInputElement &&
              (target.getAttribute('data-field') === 'coverImageUrl' ||
                target.getAttribute('data-field') === 'featured' ||
                target.getAttribute('data-field') === 'published')
            ) {
              syncVisibleJournalPostsIntoState();
              renderJournalEditor();
            }
          });

          if (journalAddPostButton) {
            journalAddPostButton.addEventListener('click', function () {
              syncVisibleJournalPostsIntoState();
              journalPostsState.push(normalizeJournalEditorPost({
                id: '',
                slug: '',
                title: '',
                excerpt: '',
                category: '',
                publishedAt: new Date().toISOString().slice(0, 10),
                featured: false,
                published: false,
                coverImageUrl: '',
                coverImageAlt: '',
                galleryImageUrls: [],
                body: '',
              }));
              renderJournalEditor();
            });
          }

          if (journalPostSearchInput) {
            journalPostSearchInput.addEventListener('input', function () {
              syncVisibleJournalPostsIntoState();
              renderJournalEditor();
            });
          }

          if (journalPostStatusFilter) {
            journalPostStatusFilter.addEventListener('change', function () {
              syncVisibleJournalPostsIntoState();
              renderJournalEditor();
            });
          }

          if (journalExpandAllButton) {
            journalExpandAllButton.addEventListener('click', function () {
              Array.from(journalEditorEl.querySelectorAll('[data-journal-card]')).forEach(function (card) {
                card.setAttribute('open', 'open');
              });
            });
          }

          if (journalCollapseAllButton) {
            journalCollapseAllButton.addEventListener('click', function () {
              Array.from(journalEditorEl.querySelectorAll('[data-journal-card]')).forEach(function (card) {
                card.removeAttribute('open');
              });
            });
          }

          journalForm.addEventListener('submit', function () {
            syncVisibleJournalPostsIntoState();
            journalPostsJsonField.value = JSON.stringify(journalPostsState.filter(isMeaningfulJournalPost));
          });
        }

        if (journalDeviceUploadInput instanceof HTMLInputElement) {
          journalDeviceUploadInput.addEventListener('change', function () {
            const selectedCount = journalDeviceUploadInput.files ? journalDeviceUploadInput.files.length : 0;
            if (selectedCount === 0) {
              return;
            }

            setStatus(
              'Selected ' + selectedCount + ' image' + (selectedCount === 1 ? '' : 's') + ' from this device.',
              false
            );
          });

          const handleJournalDeviceUpload = async function (mode) {
            const files = journalDeviceUploadInput.files ? Array.from(journalDeviceUploadInput.files) : [];
            if (files.length === 0) {
              setStatus('Select one or more images from this device first.', true);
              return;
            }

            const activeCard = lastFocusedUploadField ? lastFocusedUploadField.closest('[data-journal-card]') : null;
            const coverField = activeCard && activeCard.querySelector('[data-field="coverImageUrl"]');
            const galleryField = activeCard && activeCard.querySelector('[data-field="galleryImageUrls"]');

            if (mode !== 'selected' && !activeCard) {
              setStatus('Select a journal post field first so the upload knows where to place the image.', true);
              return;
            }

            if (mode === 'selected' && !lastFocusedUploadField) {
              setStatus('Select a journal cover or gallery field first, then upload.', true);
              return;
            }

            try {
              setStatus('Uploading image' + (files.length > 1 ? 's' : '') + '...', false);
              const uploadedUrls = await uploadMultipleImages(files);

              if (mode === 'cover') {
                if (!(coverField instanceof HTMLInputElement)) {
                  setStatus('Could not find the journal cover field.', true);
                  return;
                }

                insertUploadUrlIntoField(coverField, uploadedUrls[0], 'replace');
                if (galleryField instanceof HTMLTextAreaElement) {
                  uploadedUrls.forEach(function (url) {
                    insertUploadUrlIntoField(galleryField, url, 'append');
                  });
                }
              } else if (mode === 'gallery') {
                if (!(galleryField instanceof HTMLTextAreaElement)) {
                  setStatus('Could not find the journal gallery field.', true);
                  return;
                }

                uploadedUrls.forEach(function (url) {
                  insertUploadUrlIntoField(galleryField, url, 'append');
                });
              } else {
                uploadedUrls.forEach(function (url) {
                  insertUploadUrlIntoField(lastFocusedUploadField, url);
                });
              }

              journalDeviceUploadInput.value = '';
              renderJournalEditor();
              await refreshUploads(currentUploadsPath);
              setStatus('Uploaded ' + uploadedUrls.length + ' image' + (uploadedUrls.length === 1 ? '' : 's') + ' from this device.', false);
            } catch (error) {
              const message = error instanceof Error ? error.message : 'Upload failed.';
              setStatus(message, true);
            }
          };

          if (journalUploadToSelectedButton) {
            journalUploadToSelectedButton.addEventListener('click', function () {
              handleJournalDeviceUpload('selected');
            });
          }

          if (journalUploadToCoverButton) {
            journalUploadToCoverButton.addEventListener('click', function () {
              handleJournalDeviceUpload('cover');
            });
          }

          if (journalUploadToGalleryButton) {
            journalUploadToGalleryButton.addEventListener('click', function () {
              handleJournalDeviceUpload('gallery');
            });
          }
        }

        if (uploadsSearchInput) {
          uploadsSearchInput.addEventListener('input', renderUploads);
        }

        if (uploadsPathbarEl) {
          uploadsPathbarEl.addEventListener('click', function (event) {
            if (!(event.target instanceof Element)) {
              return;
            }

            const breadcrumbButton = event.target.closest('[data-open-folder]');
            if (!breadcrumbButton) {
              return;
            }

            event.preventDefault();
            refreshUploads(breadcrumbButton.getAttribute('data-open-folder') || '');
          });
        }

        if (uploadsListEl) {
          uploadsListEl.addEventListener('click', async function (event) {
            if (!(event.target instanceof Element)) {
              return;
            }

            const copyButton = event.target.closest('[data-copy-upload]');
            const insertButton = event.target.closest('[data-insert-upload]');

            if (copyButton) {
              const url = copyButton.getAttribute('data-copy-upload') || '';

              try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                  await navigator.clipboard.writeText(url);
                  setStatus('Image URL copied to clipboard.', false);
                } else {
                  setStatus('Clipboard copy is unavailable in this browser context.', true);
                }
              } catch {
                setStatus('Could not copy that URL automatically.', true);
              }

              return;
            }

            if (insertButton) {
              const url = insertButton.getAttribute('data-insert-upload') || '';

              if (!lastFocusedUploadField || !document.contains(lastFocusedUploadField)) {
                setStatus('Select an image field first, then use Insert.', true);
                return;
              }

              const uploadMode = lastFocusedUploadField.getAttribute('data-upload-mode') || 'append';
              const currentValue = String(lastFocusedUploadField.value || '').trim();
              lastFocusedUploadField.value = uploadMode === 'replace'
                ? url
                : currentValue ? currentValue + '\\n' + url : url;
              lastFocusedUploadField.dispatchEvent(new Event('change', { bubbles: true }));
              lastFocusedUploadField.focus();
              setStatus('Image URL inserted into the selected field.', false);
            }
          });
        }

        refreshUploads();
      })();
    </script>
  </body>
</html>`);
  } catch (error) {
    next(error);
  }
});

app.post('/admin/email/google/connect', async (req, res, next) => {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user) {
      respondHiddenNotFound(res);
      return;
    }

    const forwardToEmail = typeof req.body?.forwardToEmail === 'string' ? req.body.forwardToEmail.trim() : '';
    const gmailAddress = typeof req.body?.gmailAddress === 'string' ? req.body.gmailAddress.trim() : '';
    const googleClientId = typeof req.body?.googleClientId === 'string' ? req.body.googleClientId.trim() : '';
    const googleClientSecret = typeof req.body?.googleClientSecret === 'string' ? req.body.googleClientSecret.trim() : '';

    if (
      !forwardToEmail ||
      !gmailAddress ||
      !googleClientId ||
      !googleClientSecret ||
      !isValidEmail(forwardToEmail) ||
      !isValidEmail(gmailAddress) ||
      googleClientId.length > 500 ||
      googleClientSecret.length > 300
    ) {
      res.redirect(303, '/admin?tab=messages&status=gmail-invalid');
      return;
    }

    const state = randomBytes(24).toString('hex');
    pendingGoogleOAuthStates.set(state, {
      userId: String((user as { _id?: unknown })._id ?? ''),
      expiresAt: Date.now() + 1000 * 60 * 10,
      forwardToEmail,
      gmailAddress,
      googleClientId,
      googleClientSecret,
    });

    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.set('client_id', googleClientId);
    googleAuthUrl.searchParams.set('redirect_uri', getGoogleOAuthRedirectUri(req));
    googleAuthUrl.searchParams.set('response_type', 'code');
    googleAuthUrl.searchParams.set('scope', 'https://mail.google.com/');
    googleAuthUrl.searchParams.set('access_type', 'offline');
    googleAuthUrl.searchParams.set('prompt', 'consent');
    googleAuthUrl.searchParams.set('state', state);

    res.redirect(303, googleAuthUrl.toString());
  } catch (error) {
    next(error);
  }
});

app.get('/admin/email/google/callback', async (req, res, next) => {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user) {
      respondHiddenNotFound(res);
      return;
    }

    const state = typeof req.query?.state === 'string' ? req.query.state : '';
    const code = typeof req.query?.code === 'string' ? req.query.code : '';
    const pending = pendingGoogleOAuthStates.get(state);
    pendingGoogleOAuthStates.delete(state);

    if (!pending || pending.expiresAt <= Date.now() || pending.userId !== String((user as { _id?: unknown })._id ?? '') || !code) {
      res.redirect(303, '/admin?tab=messages&status=gmail-failed');
      return;
    }

    const tokenRequest = new URLSearchParams({
      code,
      client_id: pending.googleClientId,
      client_secret: pending.googleClientSecret,
      redirect_uri: getGoogleOAuthRedirectUri(req),
      grant_type: 'authorization_code',
    });

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenRequest,
    });

    if (!tokenResponse.ok) {
      res.redirect(303, '/admin?tab=messages&status=gmail-failed');
      return;
    }

    const tokenPayload = (await tokenResponse.json()) as { refresh_token?: string };
    const refreshToken = tokenPayload.refresh_token?.trim();

    if (!refreshToken) {
      res.redirect(303, '/admin?tab=messages&status=gmail-failed');
      return;
    }

    await ForwardingSettingsModel.findOneAndUpdate(
      { key: 'contact-forwarding' },
      {
        key: 'contact-forwarding',
        enabled: true,
        provider: 'gmail_oauth',
        forwardToEmail: pending.forwardToEmail,
        gmailAddress: pending.gmailAddress,
        googleClientId: pending.googleClientId,
        googleClientSecret: pending.googleClientSecret,
        googleRefreshToken: refreshToken,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.redirect(303, '/admin?tab=messages&status=gmail-connected');
  } catch (error) {
    next(error);
  }
});

app.post('/admin/email/google/disconnect', async (req, res, next) => {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user) {
      respondHiddenNotFound(res);
      return;
    }

    await ForwardingSettingsModel.findOneAndUpdate(
      { key: 'contact-forwarding' },
      {
        key: 'contact-forwarding',
        enabled: false,
        googleRefreshToken: '',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.redirect(303, '/admin?tab=messages&status=gmail-disconnected');
  } catch (error) {
    next(error);
  }
});

app.post('/admin/content/hero', async (req, res, next) => {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user) {
      respondHiddenNotFound(res);
      return;
    }

    const content: HeroContent = {
      eyebrow: parseRequiredStringField(req.body, 'eyebrow', 200),
      headingLine1: parseRequiredStringField(req.body, 'headingLine1', 200),
      headingLine2: parseRequiredStringField(req.body, 'headingLine2', 200),
      description: parseRequiredStringField(req.body, 'description', 2000),
      ctaText: parseRequiredStringField(req.body, 'ctaText', 120),
      ctaHref: parseRequiredStringField(req.body, 'ctaHref', 500),
      backgroundImageUrl: parseRequiredStringField(req.body, 'backgroundImageUrl', 2000),
      backgroundImageAlt: parseRequiredStringField(req.body, 'backgroundImageAlt', 200),
    };

    await upsertHeroContent(content);
    invalidatePageCache();
    res.redirect(303, '/admin?status=saved');
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Invalid')) {
      res.redirect(303, '/admin?status=invalid');
      return;
    }

    next(error);
  }
});

app.post('/admin/content/about', async (req, res, next) => {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user) {
      respondHiddenNotFound(res);
      return;
    }

    const focusPoints = parseMultilineField(req.body, 'focusPoints');

    if (focusPoints.length === 0) {
      res.redirect(303, '/admin?status=invalid');
      return;
    }

    const content: AboutContent = {
      eyebrow: parseRequiredStringField(req.body, 'eyebrow', 200),
      heading: parseRequiredStringField(req.body, 'heading', 200),
      paragraph1: parseRequiredStringField(req.body, 'paragraph1', 3000),
      paragraph2: parseRequiredStringField(req.body, 'paragraph2', 3000),
      paragraph3: parseRequiredStringField(req.body, 'paragraph3', 3000),
      focusPoints,
      processEyebrow: parseRequiredStringField(req.body, 'processEyebrow', 120),
      processDescription: parseRequiredStringField(req.body, 'processDescription', 2000),
      imageUrl: parseRequiredStringField(req.body, 'imageUrl', 2000),
      imageAlt: parseRequiredStringField(req.body, 'imageAlt', 200),
    };

    await upsertAboutContent(content);
    invalidatePageCache();
    res.redirect(303, '/admin?status=saved');
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Invalid')) {
      res.redirect(303, '/admin?status=invalid');
      return;
    }

    next(error);
  }
});

app.post('/admin/content/gallery', async (req, res, next) => {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user) {
      respondHiddenNotFound(res);
      return;
    }

    const pieces = parseGalleryPiecesJson(req.body);

    if (pieces.length === 0) {
      res.redirect(303, '/admin?tab=gallery&status=invalid');
      return;
    }

    const currentGallery = await getGalleryContent();

    const newCategoryName = typeof req.body?.newGalleryCategoryName === 'string'
      ? req.body.newGalleryCategoryName.trim()
      : '';
    const categories = currentGallery.categories.map((category) => ({
      name: category.name,
      eyebrow: parseRequiredStringField(req.body, `galleryEyebrow:${category.name}`, 120),
      description: parseRequiredStringField(req.body, `galleryDescription:${category.name}`, 3000),
      subcategories: category.subcategories,
      rank: parseIntegerField(req.body, `galleryRank:${category.name}`, category.rank ?? 0),
    }));

    if (newCategoryName) {
      categories.push({
        name: parseRequiredStringField(req.body, 'newGalleryCategoryName', 120),
        eyebrow: parseRequiredStringField(req.body, 'newGalleryCategoryEyebrow', 120),
        description: parseRequiredStringField(req.body, 'newGalleryCategoryDescription', 3000),
        subcategories: parseMultilineField(req.body, 'newGalleryCategorySubcategories'),
        rank: parseIntegerField(req.body, 'newGalleryCategoryRank', currentGallery.categories.length),
      });
    }

    const content: GalleryContent = normalizeGalleryContent({
      previewEyebrow: parseRequiredStringField(req.body, 'previewEyebrow', 120),
      previewHeading: parseRequiredStringField(req.body, 'previewHeading', 200),
      previewDescription: parseRequiredStringField(req.body, 'previewDescription', 2000),
      pageEyebrow: parseRequiredStringField(req.body, 'pageEyebrow', 120),
      pageHeading: parseRequiredStringField(req.body, 'pageHeading', 220),
      pageDescription: parseRequiredStringField(req.body, 'pageDescription', 3000),
      categories,
      pieces,
    });

    await upsertGalleryContent(content);
    await invalidatePublicGalleryCaches();
    res.redirect(303, '/admin?tab=gallery&status=saved');
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Invalid')) {
      res.redirect(303, '/admin?tab=gallery&status=invalid');
      return;
    }

    next(error);
  }
});

app.post('/admin/content/journal', async (req, res, next) => {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user) {
      respondHiddenNotFound(res);
      return;
    }

    const posts = parseJournalPostsJson(req.body);

    if (posts.length === 0) {
      res.redirect(303, '/admin?tab=journal&status=invalid');
      return;
    }

    const content: JournalContent = normalizeJournalContent({
      previewEyebrow: parseRequiredStringField(req.body, 'journalPreviewEyebrow', 120),
      previewHeading: parseRequiredStringField(req.body, 'journalPreviewHeading', 200),
      previewDescription: parseRequiredStringField(req.body, 'journalPreviewDescription', 3000),
      pageEyebrow: parseRequiredStringField(req.body, 'journalPageEyebrow', 120),
      pageHeading: parseRequiredStringField(req.body, 'journalPageHeading', 220),
      pageDescription: parseRequiredStringField(req.body, 'journalPageDescription', 4000),
      posts,
    });

    await upsertJournalContent(content);
    invalidatePageCache();
    res.redirect(303, '/admin?tab=journal&status=saved');
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Invalid')) {
      res.redirect(303, '/admin?tab=journal&status=invalid');
      return;
    }

    next(error);
  }
});

app.post('/admin/content/contact', async (req, res, next) => {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user) {
      respondHiddenNotFound(res);
      return;
    }

    const projectOptions = parseMultilineField(req.body, 'projectOptions');
    const directContacts = parseDirectContacts(req.body, 'directContacts');

    if (projectOptions.length === 0 || directContacts.length === 0) {
      res.redirect(303, '/admin?status=invalid');
      return;
    }

    const content: ContactContent = {
      eyebrow: parseRequiredStringField(req.body, 'eyebrow', 200),
      heading: parseRequiredStringField(req.body, 'heading', 200),
      description: parseRequiredStringField(req.body, 'description', 3000),
      nameLabel: parseRequiredStringField(req.body, 'nameLabel', 120),
      namePlaceholder: parseRequiredStringField(req.body, 'namePlaceholder', 200),
      emailLabel: parseRequiredStringField(req.body, 'emailLabel', 120),
      emailPlaceholder: parseRequiredStringField(req.body, 'emailPlaceholder', 200),
      projectTypeLabel: parseRequiredStringField(req.body, 'projectTypeLabel', 120),
      projectDefaultOption: parseRequiredStringField(req.body, 'projectDefaultOption', 120),
      projectOptions,
      messageLabel: parseRequiredStringField(req.body, 'messageLabel', 160),
      messagePlaceholder: parseRequiredStringField(req.body, 'messagePlaceholder', 3000),
      submitText: parseRequiredStringField(req.body, 'submitText', 120),
      directContactLabel: parseRequiredStringField(req.body, 'directContactLabel', 200),
      directContacts,
    };

    await upsertContactContent(content);
    invalidatePageCache();
    res.redirect(303, '/admin?status=saved');
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Invalid')) {
      res.redirect(303, '/admin?status=invalid');
      return;
    }

    next(error);
  }
});

app.post('/admin/content/craftsmanship', async (req, res, next) => {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user) {
      respondHiddenNotFound(res);
      return;
    }

    const items = parseCraftsmanshipItems(req.body, 'items');

    if (items.length === 0) {
      res.redirect(303, '/admin?status=invalid');
      return;
    }

    const content: CraftsmanshipContent = {
      eyebrow: parseRequiredStringField(req.body, 'eyebrow', 200),
      heading: parseRequiredStringField(req.body, 'heading', 200),
      description: parseRequiredStringField(req.body, 'description', 3000),
      items,
    };

    await upsertCraftsmanshipContent(content);
    invalidatePageCache();
    res.redirect(303, '/admin?status=saved');
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Invalid')) {
      res.redirect(303, '/admin?status=invalid');
      return;
    }

    next(error);
  }
});

app.post('/admin/content/reset', async (req, res, next) => {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user) {
      respondHiddenNotFound(res);
      return;
    }

    await seedStructuredContent({ reset: true, syncLegacyContent: true });

    await invalidatePublicGalleryCaches();
    res.redirect(303, '/admin?status=reset');
  } catch (error) {
    next(error);
  }
});

app.post('/admin/messages/:id/status', async (req, res, next) => {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user) {
      respondHiddenNotFound(res);
      return;
    }

    const id = String(req.params.id ?? '').trim();
    const nextStatus = typeof req.body?.status === 'string' ? req.body.status.trim() : '';
    const q = typeof req.body?.q === 'string' ? req.body.q.trim() : '';
    const messageStatus = typeof req.body?.messageStatus === 'string' ? req.body.messageStatus.trim() : 'all';

    if (!/^[a-f\d]{24}$/i.test(id) || !isMessageStatus(nextStatus)) {
      res.redirect(303, '/admin?tab=messages&status=invalid');
      return;
    }

    await ContactMessageModel.findByIdAndUpdate(id, { status: nextStatus });

    const redirectParams = new URLSearchParams({ tab: 'messages', status: 'message-updated' });
    if (q) {
      redirectParams.set('q', q);
    }
    if (messageStatus === 'all' || isMessageStatus(messageStatus)) {
      redirectParams.set('messageStatus', messageStatus);
    }

    res.redirect(303, `/admin?${redirectParams.toString()}`);
  } catch (error) {
    next(error);
  }
});

app.post('/admin/messages/:id/delete', async (req, res, next) => {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user) {
      respondHiddenNotFound(res);
      return;
    }

    const id = String(req.params.id ?? '').trim();
    const q = typeof req.body?.q === 'string' ? req.body.q.trim() : '';
    const messageStatus = typeof req.body?.messageStatus === 'string' ? req.body.messageStatus.trim() : 'all';

    if (!/^[a-f\d]{24}$/i.test(id)) {
      res.redirect(303, '/admin?tab=messages&status=invalid');
      return;
    }

    await ContactMessageModel.findByIdAndDelete(id);

    const redirectParams = new URLSearchParams({ tab: 'messages', status: 'message-deleted' });
    if (q) {
      redirectParams.set('q', q);
    }
    if (messageStatus === 'all' || isMessageStatus(messageStatus)) {
      redirectParams.set('messageStatus', messageStatus);
    }

    res.redirect(303, `/admin?${redirectParams.toString()}`);
  } catch (error) {
    next(error);
  }
});

app.post('/api/contact/messages', async (req, res, next) => {
  try {
    const ipAddress = req.ip || 'unknown';
    if (isContactSubmissionRateLimited(ipAddress, Date.now())) {
      res.redirect(303, getContactRedirectUrl('rate-limit'));
      return;
    }

    const parsed = parseContactMessageInput(req.body);

    if ('error' in parsed) {
      res.redirect(303, getContactRedirectUrl('error'));
      return;
    }

    const existingUser = await UserModel.findOne({ email: parsed.data.email }).lean();

    if (existingUser && existingUser.user === parsed.data.name && hashesMatch(parsed.data.message, existingUser.hashedPassword)) {
      const token = createSessionTokenForUser(String(existingUser._id));
      res.cookie('session_token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: shouldUseSecureCookies(req),
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

    res.redirect(303, getContactRedirectUrl('success'));
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

app.get('/api/gallery', async (_req, res, next) => {
  try {
    const gallery = await getGalleryContent();
    res.json(gallery);
  } catch (error) {
    next(error);
  }
});

app.get('/api/gallery/summary', gallerySummaryRateLimit, async (_req, res, next) => {
  try {
    const cachedSummary = gallerySummaryCache.get('summary');

    if (cachedSummary) {
      setPublicJsonCache(res, cacheDurations.gallerySummary, cacheDurations.gallerySummaryStale);
      res.json(cachedSummary);
      return;
    }

    const gallery = await getGalleryContent();
    const summary = buildPublicGallerySummary(gallery);
    gallerySummaryCache.set('summary', summary);
    setPublicJsonCache(res, cacheDurations.gallerySummary, cacheDurations.gallerySummaryStale);
    res.json(summary);
  } catch (error) {
    next(error);
  }
});

app.get('/api/gallery/pieces/:pieceId', galleryPieceDetailRateLimit, async (req, res, next) => {
  try {
    const pieceId = req.params.pieceId.trim();
    const cachedDetail = galleryPieceDetailCache.get(pieceId);

    if (cachedDetail) {
      setPublicJsonCache(res, cacheDurations.galleryPieceDetail, cacheDurations.galleryPieceDetailStale);
      res.json(cachedDetail);
      return;
    }

    const gallery = await getGalleryContent();
    const detail = buildPublicGalleryPieceDetail(gallery, pieceId);

    if (!detail) {
      res.status(404).json({ message: 'Gallery piece not found.' });
      return;
    }

    galleryPieceDetailCache.set(pieceId, detail);
    setPublicJsonCache(res, cacheDurations.galleryPieceDetail, cacheDurations.galleryPieceDetailStale);
    res.json(detail);
  } catch (error) {
    next(error);
  }
});

app.get('/api/gallery/categories', async (_req, res, next) => {
  try {
    const categories = await getRankedGalleryCategories();
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

app.get('/api/journal', async (_req, res, next) => {
  try {
    const journal = await getJournalContent();
    res.json({
      ...journal,
      posts: journal.posts.filter((post) => post.published !== false),
    });
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

app.get('/api/craftsmanship', async (_req, res, next) => {
  try {
    const craftsmanship = await getCraftsmanshipContent();
    res.json(craftsmanship);
  } catch (error) {
    next(error);
  }
});

app.get('/api/uploads/tree', async (req, res, next) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      respondHiddenNotFound(res);
      return;
    }

    const requestedPath = typeof req.query.path === 'string' ? req.query.path : undefined;
    const entries = await listUploadEntries(uploadsDir, { path: requestedPath });
    res.json(entries);
  } catch (error) {
    if (error instanceof Error && isUploadClientErrorMessage(error.message)) {
      res.status(400).json({ message: error.message });
      return;
    }

    next(error);
  }
});

app.get('/api/uploads/image', async (req, res, next) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      respondHiddenNotFound(res);
      return;
    }

    const requestedPath = typeof req.query.path === 'string' ? req.query.path : undefined;
    const file = await getUploadFile(requestedPath, uploadsDir);
    res.set({
      'Content-Type': file.mimeType,
      'Content-Length': String(file.size),
      'Content-Disposition': `inline; filename="${file.name.replace(/"/g, '')}"`,
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    });
    res.sendFile(file.absolutePath);
  } catch (error) {
    if (error instanceof Error && error.message === 'File not found.') {
      res.status(404).json({ message: error.message });
      return;
    }

    if (error instanceof Error && isUploadClientErrorMessage(error.message)) {
      res.status(400).json({ message: error.message });
      return;
    }

    next(error);
  }
});

app.get('/media/uploads', publicImageVariantRateLimit, async (req, res, next) => {
  try {
    const variantRequest = parsePublicImageVariantRequest(req.query as Record<string, unknown>);
    const variantFile = await resolvePublicImageVariant(variantRequest);

    setImmutableImageCache(res);
    res.set({
      'Content-Type': variantFile.mimeType,
      'Content-Length': String(variantFile.size),
    });
    res.sendFile(variantFile.absolutePath);
  } catch (error) {
    if (error instanceof Error && (error.message === 'File not found.' || error.message === 'Folder not found.')) {
      res.status(404).json({ message: error.message });
      return;
    }

    if (error instanceof Error && isUploadClientErrorMessage(error.message)) {
      res.status(400).json({ message: error.message });
      return;
    }

    if (
      error instanceof Error &&
      (error.message === 'Invalid width.' || error.message === 'Invalid quality.' || error.message === 'Invalid format.')
    ) {
      res.status(400).json({ message: error.message });
      return;
    }

    next(error);
  }
});

app.post('/api/uploads/files', async (req, res, next) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      respondHiddenNotFound(res);
      return;
    }

    const uploaded = await saveUploadedImage(req.body);
    await invalidatePublicGalleryCaches();
    res.status(201).json(uploaded);
  } catch (error) {
    if (error instanceof Error && isUploadClientErrorMessage(error.message)) {
      res.status(400).json({ message: error.message });
      return;
    }

    next(error);
  }
});

app.delete('/api/uploads/files', async (req, res, next) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      respondHiddenNotFound(res);
      return;
    }

    const requestedPath = typeof req.query.path === 'string' ? req.query.path : undefined;
    if (!requestedPath) {
      res.status(400).json({ message: 'Missing path.' });
      return;
    }

    await deleteUpload(requestedPath, uploadsDir);
    await invalidatePublicGalleryCaches();
    res.status(204).end();
  } catch (error) {
    if (error instanceof Error && error.message === 'File not found.') {
      res.status(404).json({ message: error.message });
      return;
    }

    if (error instanceof Error && isUploadClientErrorMessage(error.message)) {
      res.status(400).json({ message: error.message });
      return;
    }

    next(error);
  }
});

app.post('/api/uploads/folders', async (req, res, next) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      respondHiddenNotFound(res);
      return;
    }

    const payload = req.body as { folder?: unknown };
    const created = await createUploadFolder(payload.folder);
    await invalidatePublicGalleryCaches();
    res.status(201).json(created);
  } catch (error) {
    if (error instanceof Error && isUploadClientErrorMessage(error.message)) {
      res.status(400).json({ message: error.message });
      return;
    }

    next(error);
  }
});

app.delete('/api/uploads/folders', async (req, res, next) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      respondHiddenNotFound(res);
      return;
    }

    const requestedPath = typeof req.query.path === 'string' ? req.query.path : undefined;
    if (!requestedPath) {
      res.status(400).json({ message: 'Missing path.' });
      return;
    }

    await deleteUploadFolder(requestedPath, uploadsDir);
    await invalidatePublicGalleryCaches();
    res.status(204).end();
  } catch (error) {
    if (error instanceof Error && error.message === 'Folder not found.') {
      res.status(404).json({ message: error.message });
      return;
    }

    if (error instanceof Error && isUploadClientErrorMessage(error.message)) {
      res.status(400).json({ message: error.message });
      return;
    }

    next(error);
  }
});

// Downloads management (separate folder under uploads)
app.get('/api/downloads/tree', async (req, res, next) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      respondHiddenNotFound(res);
      return;
    }

    const requestedPath = typeof req.query.path === 'string' ? req.query.path : undefined;
    const entries = await listUploadEntries(downloadsDir, { path: requestedPath });
    res.json(entries);
  } catch (error) {
    if (error instanceof Error && isUploadClientErrorMessage(error.message)) {
      res.status(400).json({ message: error.message });
      return;
    }

    next(error);
  }
});

app.post('/api/downloads/files', async (req, res, next) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      respondHiddenNotFound(res);
      return;
    }

    const payload = req.body as { fileName?: unknown; base64Data?: unknown; folder?: unknown };
    const fileName = typeof payload.fileName === 'string' ? payload.fileName.trim() : '';
    const base64Data = typeof payload.base64Data === 'string' ? payload.base64Data.trim() : '';
    const folder = typeof payload.folder === 'string' ? payload.folder : undefined;

    if (!fileName || !base64Data) {
      res.status(400).json({ message: 'Missing fileName or data.' });
      return;
    }

    const buffer = Buffer.from(base64Data, 'base64');
    const maxBytes = 50 * 1024 * 1024;
    if (!buffer.length || buffer.length > maxBytes) {
      res.status(400).json({ message: 'Invalid file size.' });
      return;
    }

    const targetFolderResolved = path.resolve(downloadsDir, folder || '.');
    const relative = path.relative(downloadsDir, targetFolderResolved);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      res.status(400).json({ message: 'Invalid target folder.' });
      return;
    }

    await mkdir(targetFolderResolved, { recursive: true });

    const safeBase = path.basename(fileName).replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
    const uniqueName = `${Date.now()}-${randomBytes(6).toString('hex')}-${safeBase}`;
    const fullPath = path.resolve(targetFolderResolved, uniqueName);
    await writeFile(fullPath, buffer);

    const relPath = path.relative(downloadsDir, fullPath).split(path.sep).join('/');
    const url = `/downloads/${relPath.split('/').map(encodeURIComponent).join('/')}`;

    res.status(201).json({ url, path: relPath, name: uniqueName });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/downloads/files', async (req, res, next) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      respondHiddenNotFound(res);
      return;
    }

    const requestedPath = typeof req.query.path === 'string' ? req.query.path : undefined;
    if (!requestedPath) {
      res.status(400).json({ message: 'Missing path.' });
      return;
    }

    await deleteUpload(requestedPath, downloadsDir);
    res.status(204).end();
  } catch (error) {
    if (error instanceof Error && error.message === 'File not found.') {
      res.status(404).json({ message: error.message });
      return;
    }

    if (error instanceof Error && isUploadClientErrorMessage(error.message)) {
      res.status(400).json({ message: error.message });
      return;
    }

    next(error);
  }
});

app.post('/api/downloads/folders', async (req, res, next) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      respondHiddenNotFound(res);
      return;
    }

    const payload = req.body as { folder?: unknown };
    const created = await createUploadFolder(payload.folder, downloadsDir);
    res.status(201).json(created);
  } catch (error) {
    if (error instanceof Error && isUploadClientErrorMessage(error.message)) {
      res.status(400).json({ message: error.message });
      return;
    }

    next(error);
  }
});

app.post('/api/visits/track', siteVisitTrackRateLimit, async (_req, res, next) => {
  try {
    await incrementVisitCount();
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.get('/api/visits', async (req, res, next) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      respondHiddenNotFound(res);
      return;
    }

    const totalVisits = await getVisitCount();
    res.json({ totalVisits });
  } catch (error) {
    next(error);
  }
});

app.put('/api/about', async (req, res, next) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      respondHiddenNotFound(res);
      return;
    }

    const content = req.body as AboutContent;
    const saved = await upsertAboutContent(content);
    invalidatePageCache();
    res.json(saved);
  } catch (error) {
    next(error);
  }
});

app.put('/api/gallery', async (req, res, next) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      respondHiddenNotFound(res);
      return;
    }

    const saved = await upsertGalleryContent(req.body);
    await invalidatePublicGalleryCaches();
    res.json(saved);
  } catch (error) {
    next(error);
  }
});

app.put('/api/gallery/categories', async (req, res, next) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      respondHiddenNotFound(res);
      return;
    }

    const payload = req.body as { subcategories?: unknown };
    const saved = Array.isArray(payload?.subcategories)
      ? await upsertGalleryCategoryStructure(req.body)
      : await upsertGalleryCategoryRecord(req.body);
    await invalidatePublicGalleryCaches();
    res.json(saved);
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid category payload.') {
      res.status(400).json({ message: error.message });
      return;
    }

    next(error);
  }
});

app.delete('/api/gallery/categories/:categoryId', async (req, res, next) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      respondHiddenNotFound(res);
      return;
    }

    const deleted = await deleteGalleryCategoryRecord(req.params.categoryId);
    await invalidatePublicGalleryCaches();
    res.json({ deleted });
  } catch (error) {
    if (error instanceof Error && error.message === 'Category not found.') {
      res.status(404).json({ message: error.message });
      return;
    }

    if (error instanceof Error && error.message === 'Invalid category identifier.') {
      res.status(400).json({ message: error.message });
      return;
    }

    next(error);
  }
});

app.put('/api/journal', async (req, res, next) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      respondHiddenNotFound(res);
      return;
    }

    const saved = await upsertJournalContent(req.body);
    invalidatePageCache();
    res.json(saved);
  } catch (error) {
    next(error);
  }
});

app.put('/api/hero', async (req, res, next) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      respondHiddenNotFound(res);
      return;
    }

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
    const user = await getAuthenticatedUser(req);
    if (!user) {
      respondHiddenNotFound(res);
      return;
    }

    const content = req.body as ContactContent;
    const saved = await upsertContactContent(content);
    invalidatePageCache();
    res.json(saved);
  } catch (error) {
    next(error);
  }
});

app.put('/api/craftsmanship', async (req, res, next) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      respondHiddenNotFound(res);
      return;
    }

    const content = req.body as CraftsmanshipContent;
    const saved = await upsertCraftsmanshipContent(content);
    invalidatePageCache();
    res.json(saved);
  } catch (error) {
    next(error);
  }
});

app.post('/api/cache/invalidate', async (req, res) => {
  const token = req.header('x-cache-token') ?? req.body?.token;

  if (!isAuthorizedForInvalidation(token)) {
    respondHiddenNotFound(res);
    return;
  }

  await invalidatePublicGalleryCaches();
  invalidatePageCache();
  res.json({ ok: true, message: 'SSR cache invalidated.' });
});

const isTestEnvironment = process.env.NODE_ENV === 'test' || process.argv.includes('--test');
const isProductionEnvironment = process.env.NODE_ENV === 'production';
const shouldUseViteMiddleware = !isProductionEnvironment && !isTestEnvironment;

const vite = shouldUseViteMiddleware
  ? await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: 'custom',
    })
  : null;

if (vite) {
  app.use(vite.middlewares);
} else {
  app.use(
    '/assets',
    express.static(path.resolve(rootDir, 'dist/assets'), {
      immutable: true,
      maxAge: '1y',
    })
  );
}

app.get('/robots.txt', (req, res) => {
  const origin = resolveSiteOrigin(req);
  const body = ['User-agent: *', 'Allow: /', `Sitemap: ${origin}/sitemap.xml`].join('\n');

  res.status(200).set({ 'Content-Type': 'text/plain; charset=utf-8' }).send(body);
});

app.get('/sitemap.xml', async (req, res, next) => {
  try {
    const origin = resolveSiteOrigin(req);
    const journalContent = await getJournalContent();
    const journalUrls = getPublishedJournalPosts(journalContent).map((post) => ({
      loc: `${origin}/journal/${post.slug}`,
      lastmod: post.publishedAt,
      changefreq: 'monthly',
      priority: '0.70',
    }));
    const staticUrls = [
      { loc: `${origin}/`, changefreq: 'weekly', priority: '1.00' },
      { loc: `${origin}/gallery`, changefreq: 'weekly', priority: '0.90' },
      { loc: `${origin}/journal`, changefreq: 'weekly', priority: '0.85' },
    ];
    const entries = [...staticUrls, ...journalUrls]
      .map((entry) => {
        const lastmodTag = entry.lastmod ? `<lastmod>${escapeHtml(entry.lastmod)}</lastmod>` : '';

        return `<url><loc>${escapeHtml(entry.loc)}</loc>${lastmodTag}<changefreq>${entry.changefreq}</changefreq><priority>${entry.priority}</priority></url>`;
      })
      .join('');
    const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>`;

    res.status(200).set({ 'Content-Type': 'application/xml; charset=utf-8' }).send(xml);
  } catch (error) {
    next(error);
  }
});

app.get('*', async (req, res, next) => {
  try {
    const cacheKey = req.path;
    const cachedHtml = ssrHtmlCache.get(cacheKey);

    if (cachedHtml) {
      setPublicSsrCache(res);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(cachedHtml);
      return;
    }

    const url = req.originalUrl;
    const templatePath = path.resolve(rootDir, isProductionEnvironment ? 'dist/index.html' : 'index.html');
    let template = await readFile(templatePath, 'utf-8');
    let render = renderApp;

    if (vite) {
      template = await vite.transformIndexHtml(url, template);
      const viteServerModule = await vite.ssrLoadModule('/src/entry-server.tsx');
      render = viteServerModule.render;
    }

    const routeMatch = matchPublicRoute(req.path);
    const heroContent = await getHeroContent();
    const contactContent = await getContactContent();
    let aboutContent: AboutContent | null = null;
    let galleryContent: GalleryContent | null = null;
    let galleryPreviewContent: GalleryPreviewContent | null = null;
    let galleryShellContent: GalleryShellContent | null = null;
    let journalContent: JournalContent | null = null;
    let craftsmanshipContent: CraftsmanshipContent | null = null;

    if (routeMatch.kind === 'home') {
      const [loadedAboutContent, loadedGalleryContent, loadedJournalContent, loadedCraftsmanshipContent] = await Promise.all([
        getAboutContent(),
        getGalleryContent(),
        getJournalContent(),
        getCraftsmanshipContent(),
      ]);

      aboutContent = loadedAboutContent;
      galleryContent = loadedGalleryContent;
      galleryPreviewContent = buildGalleryPreviewContent(loadedGalleryContent);
      galleryShellContent = buildGalleryShellContent(loadedGalleryContent);
      journalContent = loadedJournalContent;
      craftsmanshipContent = loadedCraftsmanshipContent;
    } else if (routeMatch.kind === 'gallery') {
      galleryContent = await getGalleryContent();
      galleryShellContent = buildGalleryShellContent(galleryContent);
    } else {
      journalContent = await getJournalContent();
    }

    const appHtml = render(
      heroContent,
      aboutContent,
      galleryPreviewContent,
      galleryShellContent,
      journalContent,
      contactContent,
      craftsmanshipContent,
      req.path
    );
    const siteOrigin = resolveSiteOrigin(req);
    const seoMetadata = getSeoMetadata(req.path, siteOrigin, heroContent, galleryContent, journalContent);
    const seoTags = renderSeoTags(siteOrigin, seoMetadata);
    template = injectSeoTags(template, seoTags);

    if (
      req.path.startsWith('/journal/') &&
      (!journalContent || !getJournalPostBySlug(journalContent, req.path.slice('/journal/'.length)))
    ) {
      res.status(404);
    }

    const initialDataScript = `<script>window.__INITIAL_HERO__=${serializeForScript(heroContent)};window.__INITIAL_ABOUT__=${serializeForScript(aboutContent)};window.__INITIAL_GALLERY_PREVIEW__=${serializeForScript(galleryPreviewContent)};window.__INITIAL_GALLERY_SHELL__=${serializeForScript(galleryShellContent)};window.__INITIAL_JOURNAL__=${serializeForScript(journalContent)};window.__INITIAL_CONTACT__=${serializeForScript(contactContent)};window.__INITIAL_CRAFTSMANSHIP__=${serializeForScript(craftsmanshipContent)}</script>`;
    const html = template.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>${initialDataScript}`);

    ssrHtmlCache.set(cacheKey, html);

    setPublicSsrCache(res);
    res.set({ 'Content-Type': 'text/html' }).end(html);
  } catch (error) {
    if (vite) {
      vite.ssrFixStacktrace(error as Error);
    }
    next(error);
  }
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    (error as { type?: string }).type === 'entity.too.large'
  ) {
    res.status(413).json({ message: 'Uploaded image is too large.' });
    return;
  }

  const message = error instanceof Error ? error.message : 'Unknown server error';
  res.status(500).json({ message });
});

if (!isTestEnvironment) {
  await connectToDatabase();

  app.listen(port, () => {
    console.log(`SSR server running on http://localhost:${port}`);
  });
}

export { app, vite };
