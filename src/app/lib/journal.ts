export type JournalPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  featured?: boolean;
  published: boolean;
  rank?: number;
  coverImageUrl: string;
  coverImageAlt: string;
  galleryImageUrls: string[];
  body: string;
};

export type JournalContent = {
  previewEyebrow: string;
  previewHeading: string;
  previewDescription: string;
  pageEyebrow: string;
  pageHeading: string;
  pageDescription: string;
  posts: JournalPost[];
};

export type JournalBodyBlock =
  | { type: 'heading'; content: string }
  | { type: 'paragraph'; content: string }
  | { type: 'quote'; content: string }
  | { type: 'list'; items: string[] };

function encodeUploadPath(value: string) {
  return value
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

export function slugifyJournalValue(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function articleImage(pathname: string) {
  return `/${encodeUploadPath(pathname)}`;
}

export const defaultJournalContent: JournalContent = {
  previewEyebrow: 'Insights',
  previewHeading: 'Journal',
  previewDescription:
    'Material notes, process observations, and quieter essays from the studio gallery.',
  pageEyebrow: 'Journal',
  pageHeading: 'Studio Notes',
  pageDescription:
    'A slower record of timber, craft, and the decisions that shape each piece long before it enters a room.',
  posts: [
    {
      id: 'art-of-wood-selection',
      slug: 'art-of-wood-selection',
      title: 'The Art of Wood Selection',
      excerpt:
        'How the studio chooses timber by grain, live edge, structure, and the quieter character each board brings into a room.',
      category: 'Materials',
      publishedAt: '2026-04-15',
      featured: true,
      published: true,
      coverImageUrl: articleImage('uploads/aon imgaes/coffee tables/olive wood with resin coffee table/0D2A1120.jpg'),
      coverImageAlt: 'Olive wood coffee table surface with resin detail',
      galleryImageUrls: [
        articleImage('uploads/aon imgaes/coffee tables/olive wood with resin coffee table/0D2A1120.jpg'),
        articleImage('uploads/aon imgaes/coffee tables/olive wood with resin coffee table/0D2A1127.jpg'),
        articleImage('uploads/aon imgaes/coffee tables/olive wood with resin coffee table/0D2A1128.jpg'),
      ],
      body: `## Beginning with the board

The studio rarely begins with a sketch alone. It begins by standing with the timber itself and asking what kind of presence it already holds.

Some pieces ask for calm continuity, where grain runs evenly and lets proportion speak first. Others ask for contrast, movement, and a more visible conversation between edge, figure, and natural irregularity.

> A beautiful board is not always the right board. The right board is the one whose character belongs to the room and to the object being made.

For tables and statement pieces, the live edge can remain part of the final language. For cabinetry and more architectural forms, consistency and structure often matter more than drama.

- Grain direction shapes how the eye moves across the piece.
- Density and stability influence where timber can be used confidently.
- Color variation affects how quiet or expressive the final object feels.

Selection is less about perfection and more about intention. The goal is always to let the material feel inevitable once the piece is complete.`,
    },
    {
      id: 'designing-for-longevity',
      slug: 'designing-for-longevity',
      title: 'Designing for Longevity',
      excerpt:
        'Why proportion, restraint, and tactile materials matter more than trends when making pieces meant to stay in a space for years.',
      category: 'Philosophy',
      publishedAt: '2026-04-08',
      featured: true,
      published: true,
      coverImageUrl: articleImage('uploads/aon imgaes/entry pictures/FB_IMG_1660169263115.jpg'),
      coverImageAlt: 'Interior entry composition featuring crafted wood elements',
      galleryImageUrls: [
        articleImage('uploads/aon imgaes/entry pictures/FB_IMG_1660169263115.jpg'),
        articleImage('uploads/aon imgaes/entry pictures/FB_IMG_1660169241995.jpg'),
        articleImage('uploads/aon imgaes/entry pictures/544A0007.jpg'),
      ],
      body: `## Beyond the season

Pieces made for a home should feel quieter with time, not louder. Longevity is rarely created by chasing novelty. It is built through proportion, honest materials, and an understanding of how a room will be lived in.

When a design is too eager to impress, it often becomes tired quickly. When it is balanced, tactile, and grounded, it becomes part of the architecture of daily life.

The studio thinks about longevity through repetition of use: how a hand meets an edge, how light falls across a finish, how a silhouette feels after months rather than moments.

> The ambition is not to make something trendy. It is to make something that still feels right when the room around it changes.

Designing for longevity means removing what is unnecessary until the material, proportion, and presence are enough on their own.`,
    },
    {
      id: 'traditional-joinery-methods',
      slug: 'traditional-joinery-methods',
      title: 'Traditional Joinery Methods',
      excerpt:
        'A look at how older joinery logic still informs contemporary studio work, from strength and repairability to visual calm.',
      category: 'Technique',
      publishedAt: '2026-03-28',
      featured: false,
      published: true,
      coverImageUrl: articleImage(
        'uploads/aon imgaes/lighting/chandlier from tree rings with live edges/544A0007.jpg'
      ),
      coverImageAlt: 'Crafted lighting detail suspended with handmade structure',
      galleryImageUrls: [
        articleImage('uploads/aon imgaes/lighting/chandlier from tree rings with live edges/544A0007.jpg'),
        articleImage('uploads/aon imgaes/lighting/chandlier from tree rings with live edges/544A0017.jpg'),
        articleImage('uploads/aon imgaes/lighting/chandlier from tree rings with live edges/544A0026.jpg'),
      ],
      body: `## Structure that can be understood

Traditional joinery still matters because it solves more than structure. It also shapes the visual calm of a piece. When elements meet honestly, the object feels settled.

Older methods such as housed joints, mortise-and-tenon logic, and carefully concealed mechanical support continue to guide the studio's work, even when the final expression is contemporary.

Joinery is also about repairability and respect for movement. Timber shifts with climate and age. Good construction anticipates that instead of fighting it.

- A visible joint can become a design statement when used with restraint.
- A concealed joint can preserve visual quiet while still honoring structure.
- Both approaches depend on understanding the material rather than forcing it.

Technique should never feel decorative for its own sake. It should make the final piece feel composed, trustworthy, and lasting.`,
    },
  ],
};

export function getPublishedJournalPosts(content: JournalContent) {
  return [...content.posts]
    .filter((post) => post.published)
    .sort((left, right) => {
      if ((left.rank ?? 0) !== (right.rank ?? 0)) {
        return (left.rank ?? 0) - (right.rank ?? 0);
      }

      if (left.publishedAt === right.publishedAt) {
        return left.title.localeCompare(right.title);
      }

      return left.publishedAt < right.publishedAt ? 1 : -1;
    });
}

export function getHomepageJournalPosts(content: JournalContent, count: number = 3) {
  const publishedPosts = getPublishedJournalPosts(content);
  const featuredPosts = publishedPosts.filter((post) => post.featured);
  const remainingPosts = publishedPosts.filter((post) => !post.featured);

  return [...featuredPosts, ...remainingPosts].slice(0, count);
}

export function getJournalPostBySlug(content: JournalContent, slug: string) {
  const normalizedSlug = slugifyJournalValue(slug);
  return getPublishedJournalPosts(content).find((post) => post.slug === normalizedSlug) ?? null;
}

export function getRelatedJournalPosts(content: JournalContent, slug: string, count: number = 2) {
  return getPublishedJournalPosts(content)
    .filter((post) => post.slug !== slug)
    .slice(0, count);
}

export function getJournalReadingTimeMinutes(body: string) {
  const wordCount = body
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(2, Math.ceil(wordCount / 180));
}

export function formatJournalDate(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed);
}

function flushParagraph(lines: string[], blocks: JournalBodyBlock[]) {
  if (lines.length === 0) {
    return;
  }

  blocks.push({ type: 'paragraph', content: lines.join(' ').trim() });
  lines.length = 0;
}

function flushQuote(lines: string[], blocks: JournalBodyBlock[]) {
  if (lines.length === 0) {
    return;
  }

  blocks.push({ type: 'quote', content: lines.join(' ').trim() });
  lines.length = 0;
}

function flushList(items: string[], blocks: JournalBodyBlock[]) {
  if (items.length === 0) {
    return;
  }

  blocks.push({ type: 'list', items: [...items] });
  items.length = 0;
}

export function parseJournalBody(body: string): JournalBodyBlock[] {
  const lines = body.split(/\r?\n/);
  const blocks: JournalBodyBlock[] = [];
  const paragraphLines: string[] = [];
  const quoteLines: string[] = [];
  const listItems: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph(paragraphLines, blocks);
      flushQuote(quoteLines, blocks);
      flushList(listItems, blocks);
      continue;
    }

    if (line.startsWith('## ')) {
      flushParagraph(paragraphLines, blocks);
      flushQuote(quoteLines, blocks);
      flushList(listItems, blocks);
      blocks.push({ type: 'heading', content: line.slice(3).trim() });
      continue;
    }

    if (line.startsWith('> ')) {
      flushParagraph(paragraphLines, blocks);
      flushList(listItems, blocks);
      quoteLines.push(line.slice(2).trim());
      continue;
    }

    if (line.startsWith('- ')) {
      flushParagraph(paragraphLines, blocks);
      flushQuote(quoteLines, blocks);
      listItems.push(line.slice(2).trim());
      continue;
    }

    flushQuote(quoteLines, blocks);
    flushList(listItems, blocks);
    paragraphLines.push(line);
  }

  flushParagraph(paragraphLines, blocks);
  flushQuote(quoteLines, blocks);
  flushList(listItems, blocks);

  return blocks;
}
