import express from 'express';
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { createServer as createViteServer } from 'vite';
import { connectToDatabase } from './db';
import { getHeroContent, upsertHeroContent } from './hero-content-service';
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

let cachedHtml: string | null = null;
const activeSessions = new Map<string, { userId: string; expiresAt: number }>();

function invalidatePageCache() {
  cachedHtml = null;
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

    const [totalVisits, totalContactMessages, hero, about, contact, craftsmanship] = await Promise.all([
      getVisitCount(),
      ContactMessageModel.countDocuments(),
      getHeroContent(),
      getAboutContent(),
      getContactContent(),
      getCraftsmanshipContent(),
    ]);
    const safeUserName = escapeHtml(user.user);
    const status = new URL(req.originalUrl, 'http://localhost').searchParams.get('status');
    const statusMessage =
      status === 'saved'
        ? 'Content saved.'
        : status === 'reset'
          ? 'Content reset to defaults.'
          : status === 'invalid'
            ? 'Invalid form values.'
            : '';

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
      body { font-family: Inter, Arial, sans-serif; margin: 0; background: #f3f4f6; color: #111827; }
      main { max-width: 980px; margin: 2rem auto; background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 1.5rem 1.75rem; box-shadow: 0 12px 35px rgba(17, 24, 39, 0.08); }
      section { border: 1px solid #e5e7eb; border-radius: 10px; padding: 1rem; background: #fafafa; margin-top: 1rem; }
      h2 { margin-top: 0; font-size: 1.1rem; }
      form p { margin: 0.75rem 0; }
      label { display: block; font-size: 0.92rem; color: #374151; }
      input, textarea { width: 100%; margin-top: 0.35rem; border: 1px solid #d1d5db; border-radius: 8px; padding: 0.62rem 0.75rem; font: inherit; background: #fff; }
      textarea { min-height: 80px; resize: vertical; }
      button { border: none; background: #111827; color: #fff; border-radius: 8px; padding: 0.58rem 0.9rem; cursor: pointer; font-weight: 600; }
      button:hover { opacity: 0.92; }
      .upload-row { display: grid; grid-template-columns: 1fr auto; gap: 0.55rem; align-items: end; }
      .upload-help { margin-top: -0.3rem; color: #6b7280; font-size: 0.82rem; }
      .uploads-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 0.65rem; }
      .upload-card { border: 1px solid #e5e7eb; border-radius: 10px; padding: 0.5rem; background: #fff; }
      .upload-card img { width: 100%; height: 120px; object-fit: cover; border-radius: 8px; background: #f3f4f6; }
      .upload-card a { display: block; margin-top: 0.45rem; color: #1f2937; font-size: 0.8rem; word-break: break-all; text-decoration: none; }
      .stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.65rem; }
      .stat-card { border: 1px solid #e5e7eb; border-radius: 10px; padding: 0.8rem; background: #fff; }
      .status-message { padding: 0.75rem 1rem; border-radius: 8px; background: #ecfeff; color: #0f766e; border: 1px solid #99f6e4; }
    </style>
  </head>
  <body>
    <main>
      <h1 style="margin-top: 0;">Hidden Dashboard</h1>
      <p style="margin-bottom: 1.5rem; color: #4b5563;">Signed in as <strong>${safeUserName}</strong></p>
      ${
        statusMessage
          ? `<p class="status-message">${escapeHtml(statusMessage)}</p>`
          : ''
      }
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
    </main>
    <script>
      (function () {
        const statusEl = document.getElementById('upload-status');
        const uploadsListEl = document.getElementById('uploads-list');

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
              .slice(0, 24)
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

        refreshUploads();
      })();
    </script>
  </body>
</html>`);
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
      upsertContactContent(defaultContactContent),
      upsertCraftsmanshipContent(defaultCraftsmanshipContent),
    ]);

    invalidatePageCache();
    res.redirect(303, '/admin?status=reset');
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
    const craftsmanshipContent = await getCraftsmanshipContent();
    const appHtml = render(heroContent, aboutContent, contactContent, craftsmanshipContent);

    const initialDataScript = `<script>window.__INITIAL_HERO__=${serializeForScript(heroContent)};window.__INITIAL_ABOUT__=${serializeForScript(aboutContent)};window.__INITIAL_CONTACT__=${serializeForScript(contactContent)};window.__INITIAL_CRAFTSMANSHIP__=${serializeForScript(craftsmanshipContent)}</script>`;
    const html = template.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>${initialDataScript}`);

    cachedHtml = html;

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
