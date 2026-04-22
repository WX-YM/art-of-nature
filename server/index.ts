import express from 'express';
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { createServer as createViteServer } from 'vite';
import { connectToDatabase } from './db';
import { getHeroContent, upsertHeroContent } from './hero-content-service';
import { getGalleryContent, normalizeGalleryContent, upsertGalleryContent } from './gallery-content-service';
import { defaultGalleryContent, type GalleryContent, type GalleryPiece } from '../src/app/lib/gallery';
import { defaultHeroContent, type HeroContent } from '../src/app/lib/heroContent';
import { getAboutContent, upsertAboutContent } from './about-content-service';
import { defaultAboutContent, type AboutContent } from '../src/app/lib/aboutContent';
import { getContactContent, upsertContactContent } from './contact-content-service';
import { defaultContactContent, type ContactContent } from '../src/app/lib/contactContent';
import { getCraftsmanshipContent, upsertCraftsmanshipContent } from './craftsmanship-content-service';
import { defaultCraftsmanshipContent, type CraftsmanshipContent } from '../src/app/lib/craftsmanshipContent';
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
import { uploadsDir, saveUploadedImage, listUploads } from './upload-service';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const port = Number(process.env.PORT ?? 3000);

const app = express();
app.set('trust proxy', true);
app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true, limit: '12mb' }));
app.use('/uploads', express.static(uploadsDir));

const cachedHtmlByPath = new Map<string, string>();
const activeSessions = new Map<string, { userId: string; expiresAt: number }>();
const pendingGoogleOAuthStates = new Map<string, {
  userId: string;
  expiresAt: number;
  forwardToEmail: string;
  gmailAddress: string;
  googleClientId: string;
  googleClientSecret: string;
}>();

function invalidatePageCache() {
  cachedHtmlByPath.clear();
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

function isMessageStatus(value: unknown): value is 'new' | 'seen' {
  return value === 'new' || value === 'seen';
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getGoogleOAuthRedirectUri(req: express.Request) {
  return `${req.protocol}://${req.get('host')}/admin/email/google/callback`;
}

function slugifyGalleryPieceId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
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

      if (!title || !material || !note || !category || !subcategory || imageUrls.length === 0) {
        return null;
      }

      const images = imageUrls.map((src, index) => ({
        src,
        alt: `${title} image ${index + 1}`,
      }));

      const idSource =
        typeof rawPiece.id === 'string' && rawPiece.id.trim()
          ? rawPiece.id.trim()
          : title;

      return {
        id: slugifyGalleryPieceId(idSource),
        title,
        category,
        subcategory,
        material,
        note,
        archiveCount: images.length,
        featured,
        image: images[0],
        images,
      } as GalleryPiece;
    })
    .filter((piece): piece is GalleryPiece => piece !== null);
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

    const adminUrl = new URL(req.originalUrl, 'http://localhost');
    const requestedTab = adminUrl.searchParams.get('tab');
    const activeTab = requestedTab === 'messages' || requestedTab === 'gallery' ? requestedTab : 'content';
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

    const [totalVisits, totalContactMessages, hero, about, gallery, contact, craftsmanship, contactMessages, forwardingSettingsDoc] = await Promise.all([
      getVisitCount(),
      ContactMessageModel.countDocuments(),
      getHeroContent(),
      getAboutContent(),
      getGalleryContent(),
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
        imageUrls: piece.images.map((image) => image.src),
      })),
      categories: gallery.categories,
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
                  <td>
                    <form method="post" action="/admin/messages/${id}/status" style="display:inline-block; margin-right:0.4rem;">
                      <input type="hidden" name="status" value="${nextStatus}" />
                      <input type="hidden" name="q" value="${escapeHtml(searchQuery)}" />
                      <input type="hidden" name="messageStatus" value="${statusFilter}" />
                      <button type="submit" style="background:#1f2937;">${nextStatusButton}</button>
                    </form>
                    <form method="post" action="/admin/messages/${id}/delete" style="display:inline-block;" onsubmit="return confirm('Delete this contact message?');">
                      <input type="hidden" name="q" value="${escapeHtml(searchQuery)}" />
                      <input type="hidden" name="messageStatus" value="${statusFilter}" />
                      <button type="submit" style="background:#b91c1c;">Delete</button>
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
    <style>
      :root {
        color-scheme: light;
        --admin-bg: #f6f1e9;
        --admin-surface: rgba(255, 252, 247, 0.9);
        --admin-card: #fffaf3;
        --admin-border: rgba(88, 72, 58, 0.12);
        --admin-border-strong: rgba(88, 72, 58, 0.18);
        --admin-text: #312a24;
        --admin-muted: #776a5e;
        --admin-accent: #9a6a53;
        --admin-accent-dark: #4b3d34;
        --admin-shadow: 0 18px 55px rgba(52, 42, 33, 0.12);
      }
      * { box-sizing: border-box; }
      body {
        font-family: "Inter", "Segoe UI", sans-serif;
        margin: 0;
        background:
          radial-gradient(circle at top, rgba(177, 141, 111, 0.18), transparent 36%),
          linear-gradient(180deg, #f7f1ea 0%, #f2ebe3 100%);
        color: var(--admin-text);
      }
      main {
        max-width: 1220px;
        margin: 2rem auto;
        background: var(--admin-surface);
        border: 1px solid var(--admin-border);
        border-radius: 28px;
        padding: 1.75rem;
        box-shadow: var(--admin-shadow);
        backdrop-filter: blur(18px);
      }
      section {
        border: 1px solid var(--admin-border);
        border-radius: 22px;
        padding: 1.2rem;
        background: var(--admin-card);
        margin-top: 1rem;
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.7);
      }
      h1, h2, h3, summary strong {
        font-family: "Georgia", "Times New Roman", serif;
        letter-spacing: -0.02em;
      }
      h2 { margin-top: 0; font-size: 1.45rem; }
      h3 { color: var(--admin-accent-dark); }
      form p { margin: 0.75rem 0; }
      label { display: block; font-size: 0.92rem; color: var(--admin-muted); }
      input, textarea, select {
        width: 100%;
        margin-top: 0.35rem;
        border: 1px solid var(--admin-border-strong);
        border-radius: 14px;
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
        border: none;
        background: var(--admin-accent-dark);
        color: #fff;
        border-radius: 999px;
        padding: 0.72rem 1.15rem;
        cursor: pointer;
        font-weight: 600;
        letter-spacing: 0.01em;
      }
      button:hover { opacity: 0.94; }
      .upload-row { display: grid; grid-template-columns: 1fr auto; gap: 0.55rem; align-items: end; }
      .upload-help { margin-top: -0.3rem; color: var(--admin-muted); font-size: 0.82rem; line-height: 1.6; }
      .uploads-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 0.65rem; }
      .upload-card { border: 1px solid var(--admin-border); border-radius: 16px; padding: 0.5rem; background: #fff; }
      .upload-card img { width: 100%; height: 120px; object-fit: cover; border-radius: 8px; background: #f3f4f6; }
      .upload-card a { display: block; margin-top: 0.45rem; color: var(--admin-accent-dark); font-size: 0.8rem; word-break: break-all; text-decoration: none; }
      .stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.65rem; }
      .stat-card { border: 1px solid var(--admin-border); border-radius: 18px; padding: 1rem; background: rgba(255,255,255,0.78); }
      .status-message { padding: 0.85rem 1rem; border-radius: 16px; background: #f3f9f5; color: #17603c; border: 1px solid rgba(23,96,60,0.16); }
      .tab-row { display: flex; gap: 0.55rem; margin-bottom: 1rem; flex-wrap: wrap; }
      .tab-link {
        display: inline-flex;
        align-items: center;
        text-decoration: none;
        border: 1px solid var(--admin-border-strong);
        border-radius: 999px;
        padding: 0.58rem 0.92rem;
        color: var(--admin-muted);
        background: rgba(255,255,255,0.72);
      }
      .tab-link.active { background: var(--admin-accent-dark); border-color: var(--admin-accent-dark); color: #fff; }
      .messages-toolbar { display: grid; grid-template-columns: 1fr auto auto; gap: 0.65rem; align-items: end; }
      .messages-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 16px; overflow: hidden; }
      .messages-table th, .messages-table td { border: 1px solid var(--admin-border); padding: 0.65rem; vertical-align: top; text-align: left; font-size: 0.86rem; }
      .messages-table th { background: #f7efe4; font-weight: 700; }
      .admin-hero { display: flex; flex-wrap: wrap; align-items: end; justify-content: space-between; gap: 1rem; margin-bottom: 1.4rem; }
      .admin-eyebrow { margin: 0 0 0.35rem 0; font-size: 0.78rem; letter-spacing: 0.32em; text-transform: uppercase; color: var(--admin-muted); }
      .admin-intro { max-width: 40rem; color: var(--admin-muted); line-height: 1.8; }
      .section-grid { display: grid; gap: 1rem; }
      .section-grid.two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .gallery-category-grid { display: grid; gap: 0.9rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
      .gallery-category-card { border: 1px solid var(--admin-border); border-radius: 18px; padding: 1rem; background: rgba(255,255,255,0.74); }
      .gallery-editor-toolbar { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; justify-content: space-between; margin: 1rem 0; }
      .gallery-piece-editor { display: grid; gap: 0.9rem; }
      .gallery-piece-card { border: 1px solid var(--admin-border); border-radius: 18px; background: rgba(255,255,255,0.76); overflow: hidden; }
      .gallery-piece-card summary { list-style: none; cursor: pointer; padding: 1rem 1.1rem; display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
      .gallery-piece-card summary::-webkit-details-marker { display: none; }
      .gallery-piece-meta { color: var(--admin-muted); font-size: 0.82rem; letter-spacing: 0.08em; text-transform: uppercase; }
      .gallery-piece-body { border-top: 1px solid var(--admin-border); padding: 1rem 1.1rem 1.2rem; }
      .piece-grid { display: grid; gap: 0.85rem; grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .piece-grid .full { grid-column: 1 / -1; }
      .checkbox-row { display: flex; align-items: center; gap: 0.55rem; color: var(--admin-text); }
      .checkbox-row input { width: auto; margin: 0; }
      .ghost-button { background: rgba(255,255,255,0.88); color: var(--admin-accent-dark); border: 1px solid var(--admin-border-strong); }
      .danger-button { background: #b0423d; }
      .subtle-divider { margin: 1.25rem 0; border: none; border-top: 1px solid var(--admin-border); }
      @media (max-width: 900px) {
        main { margin: 1rem; padding: 1rem; border-radius: 22px; }
        .section-grid.two, .piece-grid, .messages-toolbar { grid-template-columns: 1fr; }
        .upload-row { grid-template-columns: 1fr; }
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
        <p style="margin: 0; color: var(--admin-muted);">Signed in as <strong>${safeUserName}</strong></p>
      </div>
      <nav class="tab-row">
        <a class="tab-link ${activeTab === 'content' ? 'active' : ''}" href="/admin?tab=content">Content</a>
        <a class="tab-link ${activeTab === 'gallery' ? 'active' : ''}" href="/admin?tab=gallery">Gallery</a>
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
        <form method="post" action="/admin/content/hero">
          <p><label>Eyebrow<br /><input name="eyebrow" required style="width:100%;" value="${escapeHtml(hero.eyebrow)}" /></label></p>
          <p><label>Heading Line 1<br /><input name="headingLine1" required style="width:100%;" value="${escapeHtml(hero.headingLine1)}" /></label></p>
          <p><label>Heading Line 2<br /><input name="headingLine2" required style="width:100%;" value="${escapeHtml(hero.headingLine2)}" /></label></p>
          <p><label>Description<br /><textarea name="description" required style="width:100%; min-height: 70px;">${escapeHtml(hero.description)}</textarea></label></p>
          <p><label>CTA Text<br /><input name="ctaText" required style="width:100%;" value="${escapeHtml(hero.ctaText)}" /></label></p>
          <p><label>CTA Href<br /><input name="ctaHref" required style="width:100%;" value="${escapeHtml(hero.ctaHref)}" /></label></p>
          <p><label>Background Image URL<br /><input name="backgroundImageUrl" required style="width:100%;" value="${escapeHtml(hero.backgroundImageUrl)}" /></label></p>
          <p class="upload-help">Upload an image to auto-fill Background Image URL.</p>
          <p class="upload-row"><input type="file" class="image-file-input" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" data-target-field="backgroundImageUrl" /><button type="button" class="image-upload-button" data-target-field="backgroundImageUrl">Upload Image</button></p>
          <p><label>Background Image Alt<br /><input name="backgroundImageAlt" required style="width:100%;" value="${escapeHtml(hero.backgroundImageAlt)}" /></label></p>
          <p><button type="submit">Save Hero</button></p>
        </form>
      </section>
      <hr style="margin: 1.25rem 0; border: none; border-top: 1px solid #e5e7eb;" />
      <section>
        <h2>About Content</h2>
        <form method="post" action="/admin/content/about">
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
          <p class="upload-row"><input type="file" class="image-file-input" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" data-target-field="imageUrl" /><button type="button" class="image-upload-button" data-target-field="imageUrl">Upload Image</button></p>
          <p><label>Image Alt<br /><input name="imageAlt" required style="width:100%;" value="${escapeHtml(about.imageAlt)}" /></label></p>
          <p><button type="submit">Save About</button></p>
        </form>
      </section>
      <hr style="margin: 1.25rem 0; border: none; border-top: 1px solid #e5e7eb;" />
      <section>
        <h2>Contact Content</h2>
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
        <p class="upload-help" id="upload-status">Upload images from Hero/About forms above. Reuse URLs here later in Featured Work.</p>
        <div id="uploads-list" class="uploads-list"></div>
      </section>
      <section>
        <h2>Reset</h2>
        <form method="post" action="/admin/content/reset" onsubmit="return confirm('Reset all website content to defaults?');">
          <button type="submit" style="background: #b91c1c; color: #fff; border: none; padding: 0.55rem 0.85rem; border-radius: 6px;">Reset all content</button>
        </form>
      </section>
      ` : ''}
      ${activeTab === 'gallery' ? `
      <section>
        <p class="admin-eyebrow" style="margin-top:0;">Gallery</p>
        <h2>Gallery Editor</h2>
        <p class="upload-help">Edit the homepage portfolio preview, the dedicated gallery page, and each archived piece from one form. Images are saved as live URLs, so the public site updates without code changes.</p>
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
                (category) => `<div class="gallery-category-card">
                  <p class="admin-eyebrow" style="margin-top:0;">${escapeHtml(category.name)}</p>
                  <p><label>Eyebrow<br /><input name="galleryEyebrow:${escapeHtml(category.name)}" required value="${escapeHtml(category.eyebrow)}" /></label></p>
                  <p><label>Description<br /><textarea name="galleryDescription:${escapeHtml(category.name)}" required style="min-height:110px;">${escapeHtml(category.description)}</textarea></label></p>
                </div>`
              )
              .join('')}
          </div>

          <div class="gallery-editor-toolbar">
            <div>
              <strong style="display:block; margin-bottom:0.2rem;">Piece Archive</strong>
              <span class="upload-help">Collapse the cards you are not editing. Each piece accepts one image URL per line.</span>
            </div>
            <button type="button" id="gallery-add-piece" class="ghost-button">Add Piece</button>
          </div>

          <textarea id="gallery-pieces-json" name="galleryPiecesJson" hidden></textarea>
          <div id="gallery-piece-editor" class="gallery-piece-editor"></div>

          <p style="margin-top:1rem;"><button type="submit">Save Gallery</button></p>
        </form>
      </section>
      <section>
        <h2>Image Library</h2>
        <p class="upload-help" id="upload-status">Upload a new image or reuse an existing URL from the archive below when editing a gallery piece.</p>
        <div id="uploads-list" class="uploads-list"></div>
      </section>
      ` : ''}
      ${activeTab === 'messages' ? `
      <section>
        <h2>Contact Messages</h2>
        <form method="post" action="/admin/email/google/connect" style="margin-bottom:1rem; border:1px solid #e5e7eb; border-radius:10px; padding:0.9rem; background:#fff;">
          <h3 style="margin-top:0; margin-bottom:0.7rem; font-size:0.98rem;">Auto-forward using Gmail OAuth</h3>
          <p class="upload-help" style="margin-top:0; margin-bottom:0.8rem;">Connect a Gmail account once, then contact messages are auto-forwarded without server SMTP config changes.</p>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:0.65rem;">
            <p style="margin:0;"><label>Forward To Email<br /><input name="forwardToEmail" required value="${escapeHtml(forwardingSettings.forwardToEmail)}" placeholder="inbox@example.com" /></label></p>
            <p style="margin:0;"><label>Gmail Address<br /><input name="gmailAddress" required value="${escapeHtml(forwardingSettings.gmailAddress)}" placeholder="your@gmail.com" /></label></p>
            <p style="margin:0;"><label>Google OAuth Client ID<br /><input name="googleClientId" required value="${escapeHtml(forwardingSettings.googleClientId)}" placeholder="...apps.googleusercontent.com" /></label></p>
            <p style="margin:0;"><label>Google OAuth Client Secret<br /><input name="googleClientSecret" required value="${escapeHtml(forwardingSettings.googleClientSecret)}" placeholder="GOCSPX-..." /></label></p>
          </div>
          <p style="margin:0.8rem 0 0 0; display:flex; gap:0.55rem; flex-wrap:wrap; align-items:center;">
            <button type="submit" style="background:#111827;">${forwardingSettings.connected ? 'Reconnect Gmail' : 'Connect Gmail'}</button>
            <span style="font-size:0.84rem; color:${forwardingSettings.connected ? '#166534' : '#6b7280'};">${forwardingSettings.connected ? 'Connected' : 'Not connected'}</span>
          </p>
        </form>
        <form method="post" action="/admin/email/google/disconnect" style="margin-bottom:1rem;">
          <button type="submit" style="background:#b91c1c;" ${forwardingSettings.connected ? '' : 'disabled'}>Disconnect Gmail Forwarding</button>
        </form>
        <form method="get" action="/admin" class="messages-toolbar">
          <input type="hidden" name="tab" value="messages" />
          <p style="margin:0;"><label>Search<br /><input type="search" name="q" value="${escapeHtml(searchQuery)}" placeholder="Name, email, phone, project, message" /></label></p>
          <p style="margin:0;"><label>Status<br />
            <select name="messageStatus" style="margin-top:0.35rem; border:1px solid #d1d5db; border-radius:8px; padding:0.62rem 0.75rem; background:#fff;">
              <option value="all" ${statusFilter === 'all' ? 'selected' : ''}>All</option>
              <option value="new" ${statusFilter === 'new' ? 'selected' : ''}>New</option>
              <option value="seen" ${statusFilter === 'seen' ? 'selected' : ''}>Seen</option>
            </select>
          </label></p>
          <p style="margin:0;"><button type="submit">Search</button></p>
        </form>
        <div style="overflow:auto; margin-top:1rem;">
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
        const galleryEditorData = ${serializeForScript(galleryEditorState)};
        const galleryEditorEl = document.getElementById('gallery-piece-editor');
        const galleryAddPieceButton = document.getElementById('gallery-add-piece');
        const galleryForm = document.getElementById('gallery-content-form');
        const galleryPiecesJsonField = document.getElementById('gallery-pieces-json');
        const galleryCategories = Array.isArray(galleryEditorData && galleryEditorData.categories)
          ? galleryEditorData.categories
          : [];

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

        function getCategoryConfig(categoryName) {
          return galleryCategories.find(function (category) {
            return category && category.name === categoryName;
          }) || galleryCategories[0] || null;
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
            imageUrls: imageUrls,
          };
        }

        function readPiecesFromDom() {
          if (!galleryEditorEl) return [];

          return Array.from(galleryEditorEl.querySelectorAll('[data-piece-card]'))
            .map(function (card) {
              const title = card.querySelector('[data-field="title"]');
              const category = card.querySelector('[data-field="category"]');
              const subcategory = card.querySelector('[data-field="subcategory"]');
              const material = card.querySelector('[data-field="material"]');
              const note = card.querySelector('[data-field="note"]');
              const featured = card.querySelector('[data-field="featured"]');
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
                imageUrls:
                  imageUrls && typeof imageUrls.value === 'string'
                    ? imageUrls.value.split(/\r?\n/).map(function (line) { return line.trim(); }).filter(Boolean)
                    : [],
              });

              normalized.id = normalized.id || slugifyPieceId(normalized.title);
              return normalized;
            })
            .filter(function (piece) {
              return piece.title || piece.material || piece.note || piece.imageUrls.length > 0;
            });
        }

        function renderGalleryEditor(pieces) {
          if (!galleryEditorEl) return;

          galleryEditorEl.innerHTML = pieces
            .map(function (piece, index) {
              const normalized = normalizeEditorPiece(piece);
              const imageCount = normalized.imageUrls.length;
              const summaryTitle = normalized.title || 'Untitled piece';
              const summaryMeta = normalized.category + ' / ' + normalized.subcategory + ' / ' + imageCount + ' image' + (imageCount === 1 ? '' : 's');

              return '<details class="gallery-piece-card" data-piece-card open="' + (index < 2 ? 'open' : '') + '">' +
                '<summary>' +
                  '<div>' +
                    '<strong>' + escapeHtmlValue(summaryTitle) + '</strong>' +
                    '<div class="gallery-piece-meta">' + escapeHtmlValue(summaryMeta) + (normalized.featured ? ' / featured' : '') + '</div>' +
                  '</div>' +
                  '<button type="button" class="danger-button" data-remove-piece="' + index + '">Remove</button>' +
                '</summary>' +
                '<div class="gallery-piece-body">' +
                  '<div class="piece-grid">' +
                    '<input type="hidden" data-field="id" value="' + escapeHtmlValue(normalized.id) + '" />' +
                    '<p><label>Title<br /><input data-field="title" value="' + escapeHtmlValue(normalized.title) + '" /></label></p>' +
                    '<p><label>Material<br /><input data-field="material" value="' + escapeHtmlValue(normalized.material) + '" /></label></p>' +
                    '<p><label>Category<br /><select data-field="category">' + categoryOptionsMarkup(normalized.category) + '</select></label></p>' +
                    '<p><label>Subcategory<br /><select data-field="subcategory">' + getSubcategoryOptions(normalized.category, normalized.subcategory) + '</select></label></p>' +
                    '<p class="full"><label>Note<br /><textarea data-field="note" style="min-height:120px;">' + escapeHtmlValue(normalized.note) + '</textarea></label></p>' +
                    '<p class="full"><label>Image URLs (one per line)<br /><textarea data-field="imageUrls" style="min-height:150px;">' + escapeHtmlValue(normalized.imageUrls.join('\\n')) + '</textarea></label></p>' +
                    '<p class="full"><label class="checkbox-row"><input type="checkbox" data-field="featured" ' + (normalized.featured ? 'checked' : '') + ' /> Featured on homepage portfolio section</label></p>' +
                  '</div>' +
                '</div>' +
              '</details>';
            })
            .join('');
        }

        function setStatus(message, isError) {
          if (!statusEl) return;
          statusEl.textContent = message;
          statusEl.style.color = isError ? '#b91c1c' : '#6b7280';
        }

        async function refreshUploads() {
          if (!uploadsListEl) return;

          try {
            const response = await fetch('/api/uploads');
            if (!response.ok) {
              throw new Error('Failed to load uploads.');
            }

            const uploads = await response.json();
            if (!Array.isArray(uploads) || uploads.length === 0) {
              uploadsListEl.innerHTML = '<p class="upload-help">No images uploaded yet.</p>';
              return;
            }

            uploadsListEl.innerHTML = uploads
              .slice(0, 60)
              .map(function (item) {
                const safeUrl = String(item.url || '');
                return '<div class="upload-card">' +
                  '<img src="' + safeUrl + '" alt="Uploaded image" />' +
                  '<a href="' + safeUrl + '" target="_blank" rel="noopener">' + safeUrl + '</a>' +
                '</div>';
              })
              .join('');
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

        document.querySelectorAll('.image-upload-button').forEach(function (button) {
          button.addEventListener('click', async function () {
            const targetField = button.getAttribute('data-target-field');
            if (!targetField) return;

            const fileInput = document.querySelector('input.image-file-input[data-target-field="' + targetField + '"]');
            const targetInput = document.querySelector('input[name="' + targetField + '"]');
            const selectedFile = fileInput && fileInput.files ? fileInput.files[0] : null;

            if (!selectedFile || !targetInput) {
              setStatus('Select an image first.', true);
              return;
            }

            try {
              setStatus('Uploading image...', false);
              const base64Data = await fileToBase64(selectedFile);

              const response = await fetch('/api/uploads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  fileName: selectedFile.name,
                  mimeType: selectedFile.type,
                  base64Data: base64Data,
                }),
              });

              const payload = await response.json();
              if (!response.ok || !payload || typeof payload.url !== 'string') {
                throw new Error(payload && payload.message ? payload.message : 'Upload failed.');
              }

              targetInput.value = payload.url;
              setStatus('Image uploaded. URL inserted into field.', false);
              refreshUploads();
            } catch (error) {
              const message = error instanceof Error ? error.message : 'Upload failed.';
              setStatus(message, true);
            }
          });
        });

        if (galleryEditorEl && galleryForm && galleryPiecesJsonField) {
          renderGalleryEditor(galleryEditorData && Array.isArray(galleryEditorData.pieces) ? galleryEditorData.pieces : []);

          galleryEditorEl.addEventListener('click', function (event) {
            const removeButton = event.target.closest('[data-remove-piece]');
            if (!removeButton) return;

            event.preventDefault();
            const index = Number(removeButton.getAttribute('data-remove-piece'));
            const nextPieces = readPiecesFromDom().filter(function (_piece, pieceIndex) {
              return pieceIndex !== index;
            });
            renderGalleryEditor(nextPieces);
          });

          galleryEditorEl.addEventListener('change', function (event) {
            const target = event.target;
            if (!(target instanceof HTMLSelectElement) || target.getAttribute('data-field') !== 'category') {
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
          });

          if (galleryAddPieceButton) {
            galleryAddPieceButton.addEventListener('click', function () {
              const nextPieces = readPiecesFromDom();
              const fallbackCategory = galleryCategories[0] || { name: 'Living Room', subcategories: ['Tables'] };
              nextPieces.push({
                id: '',
                title: '',
                category: fallbackCategory.name,
                subcategory: fallbackCategory.subcategories[0],
                material: '',
                note: '',
                featured: false,
                imageUrls: [],
              });
              renderGalleryEditor(nextPieces);
            });
          }

          galleryForm.addEventListener('submit', function () {
            galleryPiecesJsonField.value = JSON.stringify(readPiecesFromDom());
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

    const content: GalleryContent = normalizeGalleryContent({
      previewEyebrow: parseRequiredStringField(req.body, 'previewEyebrow', 120),
      previewHeading: parseRequiredStringField(req.body, 'previewHeading', 200),
      previewDescription: parseRequiredStringField(req.body, 'previewDescription', 2000),
      pageEyebrow: parseRequiredStringField(req.body, 'pageEyebrow', 120),
      pageHeading: parseRequiredStringField(req.body, 'pageHeading', 220),
      pageDescription: parseRequiredStringField(req.body, 'pageDescription', 3000),
      categories: defaultGalleryContent.categories.map((category) => ({
        name: category.name,
        eyebrow: parseRequiredStringField(req.body, `galleryEyebrow:${category.name}`, 120),
        description: parseRequiredStringField(req.body, `galleryDescription:${category.name}`, 3000),
        subcategories: category.subcategories,
      })),
      pieces,
    });

    await upsertGalleryContent(content);
    invalidatePageCache();
    res.redirect(303, '/admin?tab=gallery&status=saved');
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Invalid')) {
      res.redirect(303, '/admin?tab=gallery&status=invalid');
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

    await Promise.all([
      upsertHeroContent(defaultHeroContent),
      upsertAboutContent(defaultAboutContent),
      upsertGalleryContent(defaultGalleryContent),
      upsertContactContent(defaultContactContent),
      upsertCraftsmanshipContent(defaultCraftsmanshipContent),
    ]);

    invalidatePageCache();
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

app.get('/api/gallery', async (_req, res, next) => {
  try {
    const gallery = await getGalleryContent();
    res.json(gallery);
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

app.get('/api/uploads', async (req, res, next) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      respondHiddenNotFound(res);
      return;
    }

    const uploads = await listUploads();
    res.json(uploads);
  } catch (error) {
    next(error);
  }
});

app.post('/api/uploads', async (req, res, next) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      respondHiddenNotFound(res);
      return;
    }

    const uploaded = await saveUploadedImage(req.body);
    res.status(201).json(uploaded);
  } catch (error) {
    if (error instanceof Error && (error.message.startsWith('Invalid') || error.message.startsWith('Missing'))) {
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

app.post('/api/cache/invalidate', (req, res) => {
  const token = req.header('x-cache-token') ?? req.body?.token;

  if (!isAuthorizedForInvalidation(token)) {
    respondHiddenNotFound(res);
    return;
  }

  invalidatePageCache();
  res.json({ ok: true, message: 'SSR cache invalidated.' });
});

const isTestEnvironment = process.env.NODE_ENV === 'test' || process.argv.includes('--test');

const vite = await createViteServer({
  server: {
    middlewareMode: true,
    hmr: isTestEnvironment ? false : undefined,
  },
  appType: 'custom',
});

app.use(vite.middlewares);

app.get('*', async (req, res, next) => {
  try {
    const cacheKey = req.path;
    const cachedHtml = cachedHtmlByPath.get(cacheKey);

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
    const galleryContent = await getGalleryContent();
    const contactContent = await getContactContent();
    const craftsmanshipContent = await getCraftsmanshipContent();
    const appHtml = render(heroContent, aboutContent, galleryContent, contactContent, craftsmanshipContent, req.path);

    const initialDataScript = `<script>window.__INITIAL_HERO__=${serializeForScript(heroContent)};window.__INITIAL_ABOUT__=${serializeForScript(aboutContent)};window.__INITIAL_GALLERY__=${serializeForScript(galleryContent)};window.__INITIAL_CONTACT__=${serializeForScript(contactContent)};window.__INITIAL_CRAFTSMANSHIP__=${serializeForScript(craftsmanshipContent)}</script>`;
    const html = template.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>${initialDataScript}`);

    cachedHtmlByPath.set(cacheKey, html);

    res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
  } catch (error) {
    vite.ssrFixStacktrace(error as Error);
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
