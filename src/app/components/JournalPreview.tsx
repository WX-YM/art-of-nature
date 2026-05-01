import { ArrowUpRight } from 'lucide-react';
import { replaceArchiveUiCopy } from '../lib/uiText';
import { ImageWithFallback } from './figma/ImageWithFallback';
import {
  formatJournalDate,
  getHomepageJournalPosts,
  getJournalReadingTimeMinutes,
  type JournalContent,
} from '../lib/journal';

type JournalPreviewProps = {
  content: JournalContent;
};

export function JournalPreview({ content }: JournalPreviewProps) {
  const posts = getHomepageJournalPosts(content, 3);

  return (
    <section id="journal" className="scroll-mt-28 bg-white py-20 sm:py-24 lg:py-32">
      <div className="section-shell">
        <div className="mb-14 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="reveal-up max-w-2xl">
            <p className="section-kicker">{content.previewEyebrow}</p>
            <h2 style={{ fontSize: 'clamp(2.2rem, 4vw, 4rem)', lineHeight: '1.04' }}>
              {content.previewHeading}
            </h2>
            <p className="mt-5 max-w-xl text-[1.02rem] leading-8 text-foreground/72">
              {replaceArchiveUiCopy(content.previewDescription)}
            </p>
          </div>

          <a
            href="/journal"
            className="reveal-up inline-flex items-center gap-2 self-start border border-border bg-white px-5 py-3 text-sm transition-colors hover:border-accent hover:text-accent"
            style={{ animationDelay: '0.08s' }}
          >
            View More Journals
            <ArrowUpRight size={16} />
          </a>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr_0.9fr]">
          {posts.map((post, index) => (
            <a
              key={post.slug}
              href={`/journal/${post.slug}`}
              className={`reveal-up group overflow-hidden border border-border bg-white shadow-[0_18px_45px_rgba(45,41,38,0.08)] ${
                index === 0 ? 'lg:row-span-2' : ''
              }`}
              style={{ animationDelay: `${0.08 * (index + 1)}s` }}
            >
              <div className={index === 0 ? 'h-[22rem] sm:h-[30rem] lg:h-full' : 'h-[18rem] sm:h-[22rem]'}>
                <ImageWithFallback
                  src={post.coverImageUrl}
                  alt={post.coverImageAlt}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
              <div className="space-y-4 p-5 sm:p-6">
                <p className="text-[0.78rem] uppercase tracking-[0.28em] text-foreground/50">
                  {post.category} · {formatJournalDate(post.publishedAt)}
                </p>
                <h3 className="text-[1.45rem] leading-tight transition-colors group-hover:text-accent sm:text-[1.8rem]">
                  {post.title}
                </h3>
                <p className="text-sm leading-7 text-foreground/68 sm:text-base">{post.excerpt}</p>
                <div className="inline-flex items-center gap-2 pt-1 text-xs uppercase tracking-[0.22em] text-foreground/55 transition-colors group-hover:text-accent">
                  {getJournalReadingTimeMinutes(post.body)} min read
                  <ArrowUpRight size={14} />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
