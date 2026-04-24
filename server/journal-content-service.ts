import {
  slugifyJournalValue,
  type JournalContent,
  type JournalPost,
} from '../src/app/lib/journal';
import { JournalContentModel } from './models/JournalContent';
import { JournalPostRecordModel } from './models/JournalPostRecord';

const JOURNAL_KEY = 'primary-journal';

const journalSettingsFallback = {
  previewEyebrow: 'Insights',
  previewHeading: 'Journal',
  previewDescription: 'Material notes, process observations, and studio writing.',
  pageEyebrow: 'Journal',
  pageHeading: 'Studio Notes',
  pageDescription: 'A slower record of timber, craft, and the decisions behind each piece.',
};

type JournalContentDocument = {
  key: string;
  previewEyebrow?: string;
  previewHeading?: string;
  previewDescription?: string;
  pageEyebrow?: string;
  pageHeading?: string;
  pageDescription?: string;
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
    rank: typeof raw.rank === 'number' && Number.isFinite(raw.rank) ? raw.rank : 0,
    coverImageUrl,
    coverImageAlt,
    galleryImageUrls: uniqueGalleryImageUrls,
    body,
  };
}

async function getJournalSettings() {
  const doc = await JournalContentModel.findOne<JournalContentDocument>({ key: JOURNAL_KEY }).lean();

  return {
    previewEyebrow: normalizeText(doc?.previewEyebrow, journalSettingsFallback.previewEyebrow, 120),
    previewHeading: normalizeText(doc?.previewHeading, journalSettingsFallback.previewHeading, 200),
    previewDescription: normalizeText(doc?.previewDescription, journalSettingsFallback.previewDescription, 3000),
    pageEyebrow: normalizeText(doc?.pageEyebrow, journalSettingsFallback.pageEyebrow, 120),
    pageHeading: normalizeText(doc?.pageHeading, journalSettingsFallback.pageHeading, 220),
    pageDescription: normalizeText(doc?.pageDescription, journalSettingsFallback.pageDescription, 4000),
  };
}

async function getRankedJournalPosts() {
  const postDocs = await JournalPostRecordModel.find({}).sort({ rank: 1, publishedAt: -1, title: 1 }).lean();
  return postDocs
    .map((postDoc) =>
      normalizePost({
        id: postDoc.key,
        slug: postDoc.slug,
        title: postDoc.title,
        excerpt: postDoc.excerpt,
        category: postDoc.category,
        publishedAt: postDoc.publishedAt,
        featured: postDoc.featured,
        published: postDoc.published,
        rank: postDoc.rank,
        coverImageUrl: postDoc.coverImageUrl,
        coverImageAlt: postDoc.coverImageAlt,
        galleryImageUrls: postDoc.galleryImageUrls,
        body: postDoc.body,
      })
    )
    .filter((post): post is JournalPost => post !== null);
}

async function syncJournalPostRecords(content: JournalContent) {
  const posts = content.posts.map((post, rank) => ({
    key: post.id || post.slug,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    category: post.category,
    publishedAt: post.publishedAt,
    featured: post.featured === true,
    published: post.published !== false,
    rank: post.rank ?? rank,
    coverImageUrl: post.coverImageUrl,
    coverImageAlt: post.coverImageAlt,
    galleryImageUrls: post.galleryImageUrls,
    body: post.body,
  }));

  const postKeys = new Set(posts.map((post) => post.key));

  await Promise.all(
    posts.map((post) =>
      JournalPostRecordModel.findOneAndUpdate({ key: post.key }, post, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      })
    )
  );

  await JournalPostRecordModel.deleteMany({ key: { $nin: Array.from(postKeys) } });
}

export function normalizeJournalContent(content: unknown): JournalContent {
  const raw = content && typeof content === 'object' ? (content as Partial<JournalContent>) : {};
  const posts = Array.isArray(raw.posts)
    ? raw.posts
        .map((post) => normalizePost(post))
        .filter((post): post is JournalPost => post !== null)
    : [];

  return {
    previewEyebrow: normalizeText(raw.previewEyebrow, journalSettingsFallback.previewEyebrow, 120),
    previewHeading: normalizeText(raw.previewHeading, journalSettingsFallback.previewHeading, 200),
    previewDescription: normalizeText(raw.previewDescription, journalSettingsFallback.previewDescription, 3000),
    pageEyebrow: normalizeText(raw.pageEyebrow, journalSettingsFallback.pageEyebrow, 120),
    pageHeading: normalizeText(raw.pageHeading, journalSettingsFallback.pageHeading, 220),
    pageDescription: normalizeText(raw.pageDescription, journalSettingsFallback.pageDescription, 4000),
    posts,
  };
}

export async function getJournalContent(): Promise<JournalContent> {
  const [settings, posts] = await Promise.all([getJournalSettings(), getRankedJournalPosts()]);

  return {
    ...settings,
    posts,
  };
}

export async function upsertJournalContent(content: unknown): Promise<JournalContent> {
  const normalized = normalizeJournalContent(content);

  await JournalContentModel.findOneAndUpdate(
    { key: JOURNAL_KEY },
    {
      key: JOURNAL_KEY,
      previewEyebrow: normalized.previewEyebrow,
      previewHeading: normalized.previewHeading,
      previewDescription: normalized.previewDescription,
      pageEyebrow: normalized.pageEyebrow,
      pageHeading: normalized.pageHeading,
      pageDescription: normalized.pageDescription,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await syncJournalPostRecords(normalized);

  return getJournalContent();
}
