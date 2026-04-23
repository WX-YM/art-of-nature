import {
  defaultJournalContent,
  slugifyJournalValue,
  type JournalContent,
  type JournalPost,
} from '../src/app/lib/journal';
import { JournalContentModel } from './models/JournalContent';

const JOURNAL_KEY = 'primary-journal';

type JournalContentDocument = JournalContent & {
  key: string;
};

function normalizeText(value: unknown, fallback: string, maxLength: number) {
  const parsed = typeof value === 'string' ? value.trim() : '';
  if (!parsed || parsed.length > maxLength) {
    return fallback;
  }

  return parsed;
}

function normalizeDate(value: unknown, fallback: string) {
  const parsed = typeof value === 'string' ? value.trim() : '';
  if (!parsed || Number.isNaN(new Date(parsed).getTime())) {
    return fallback;
  }

  return parsed;
}

function normalizePost(value: unknown): JournalPost | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const raw = value as Partial<JournalPost>;
  const title = normalizeText(raw.title, '', 220);
  const excerpt = normalizeText(raw.excerpt, '', 1200);
  const category = normalizeText(raw.category, '', 120);
  const body = normalizeText(raw.body, '', 20_000);
  const coverImageUrl = normalizeText(raw.coverImageUrl, '', 4000);
  const coverImageAlt = normalizeText(raw.coverImageAlt, title || 'Journal image', 300);

  if (!title || !excerpt || !category || !body || !coverImageUrl) {
    return null;
  }

  const idSource =
    typeof raw.id === 'string' && raw.id.trim()
      ? raw.id
      : typeof raw.slug === 'string' && raw.slug.trim()
        ? raw.slug
        : title;
  const slugSource =
    typeof raw.slug === 'string' && raw.slug.trim()
      ? raw.slug
      : typeof raw.id === 'string' && raw.id.trim()
        ? raw.id
        : title;

  const id = slugifyJournalValue(idSource);
  const slug = slugifyJournalValue(slugSource);

  if (!id || !slug) {
    return null;
  }

  const galleryImageUrls = Array.isArray(raw.galleryImageUrls)
    ? raw.galleryImageUrls
        .map((url) => (typeof url === 'string' ? url.trim() : ''))
        .filter((url) => Boolean(url && url.length <= 4000))
    : [];
  const uniqueGalleryImageUrls = Array.from(new Set([coverImageUrl, ...galleryImageUrls]));

  return {
    id,
    slug,
    title,
    excerpt,
    category,
    publishedAt: normalizeDate(raw.publishedAt, new Date().toISOString().slice(0, 10)),
    featured: raw.featured === true,
    published: raw.published !== false,
    coverImageUrl,
    coverImageAlt,
    galleryImageUrls: uniqueGalleryImageUrls,
    body,
  };
}

export function normalizeJournalContent(content: unknown): JournalContent {
  const raw = content && typeof content === 'object' ? (content as Partial<JournalContent>) : {};
  const posts = Array.isArray(raw.posts)
    ? raw.posts
        .map((post) => normalizePost(post))
        .filter((post): post is JournalPost => post !== null)
    : [];

  return {
    previewEyebrow: normalizeText(raw.previewEyebrow, defaultJournalContent.previewEyebrow, 120),
    previewHeading: normalizeText(raw.previewHeading, defaultJournalContent.previewHeading, 200),
    previewDescription: normalizeText(raw.previewDescription, defaultJournalContent.previewDescription, 3000),
    pageEyebrow: normalizeText(raw.pageEyebrow, defaultJournalContent.pageEyebrow, 120),
    pageHeading: normalizeText(raw.pageHeading, defaultJournalContent.pageHeading, 220),
    pageDescription: normalizeText(raw.pageDescription, defaultJournalContent.pageDescription, 4000),
    posts: posts.length > 0 ? posts : defaultJournalContent.posts,
  };
}

export async function getJournalContent(): Promise<JournalContent> {
  const doc = await JournalContentModel.findOne<JournalContentDocument>({ key: JOURNAL_KEY }).lean();

  if (!doc) {
    return normalizeJournalContent(defaultJournalContent);
  }

  return normalizeJournalContent(doc);
}

export async function upsertJournalContent(content: unknown): Promise<JournalContent> {
  const normalized = normalizeJournalContent(content);

  await JournalContentModel.findOneAndUpdate(
    { key: JOURNAL_KEY },
    { ...normalized, key: JOURNAL_KEY },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return normalized;
}
