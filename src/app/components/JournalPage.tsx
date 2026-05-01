import { ArrowRight } from 'lucide-react';
import { replaceArchiveUiCopy } from '../lib/uiText';
import { ImageWithFallback } from './figma/ImageWithFallback';
import {
  formatJournalDate,
  getJournalReadingTimeMinutes,
  getPublishedJournalPosts,
  type JournalContent,
} from '../lib/journal';

type JournalPageProps = {
  content: JournalContent;
};

export function JournalPage({ content }: JournalPageProps) {
  const posts = getPublishedJournalPosts(content);
  const [leadPost, ...remainingPosts] = posts;

  return (
    <main className="pb-20 pt-28 sm:pt-32 lg:pb-32">
      <section className="section-shell">
        <div className="reveal-up grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="section-kicker">{content.pageEyebrow}</p>
            <h1 style={{ fontSize: 'clamp(3rem, 7vw, 5.6rem)', lineHeight: '0.96' }}>{content.pageHeading}</h1>
          </div>
          <div className="max-w-xl lg:justify-self-end">
            <p className="text-[1.02rem] leading-8 text-foreground/72 sm:text-[1.08rem]">
              {replaceArchiveUiCopy(content.pageDescription)}
            </p>
          </div>
        </div>
      </section>

      {leadPost ? (
        <section className="section-shell mt-14 sm:mt-16">
          <a
            href={`/journal/${leadPost.slug}`}
            className="reveal-up grid overflow-hidden border border-border bg-white shadow-[0_20px_60px_rgba(45,41,38,0.08)] lg:grid-cols-[1.08fr_0.92fr]"
          >
            <div className="h-[22rem] overflow-hidden sm:h-[30rem] lg:h-full">
              <ImageWithFallback
                src={leadPost.coverImageUrl}
                alt={leadPost.coverImageAlt}
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.02]"
              />
            </div>
            <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-10">
              <div>
                <p className="text-[0.78rem] uppercase tracking-[0.28em] text-foreground/48">Featured Journal</p>
                <h2 className="mt-5 text-[2.1rem] leading-[1.02] sm:text-[3rem]">{leadPost.title}</h2>
                <p className="mt-5 text-[0.82rem] uppercase tracking-[0.24em] text-foreground/48">
                  {leadPost.category} · {formatJournalDate(leadPost.publishedAt)} ·{' '}
                  {getJournalReadingTimeMinutes(leadPost.body)} min read
                </p>
                <p className="mt-6 text-[1rem] leading-8 text-foreground/68 sm:text-[1.06rem]">{leadPost.excerpt}</p>
              </div>
              <div className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-foreground/78 transition-colors hover:text-accent">
                Read article
                <ArrowRight size={16} />
              </div>
            </div>
          </a>
        </section>
      ) : null}

      <section className="section-shell mt-14 sm:mt-16">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {remainingPosts.map((post, index) => (
            <a
              key={post.slug}
              href={`/journal/${post.slug}`}
              className="reveal-up group overflow-hidden border border-border bg-white shadow-[0_18px_48px_rgba(45,41,38,0.08)]"
              style={{ animationDelay: `${0.06 * (index + 1)}s` }}
            >
              <div className="h-[18rem] overflow-hidden">
                <ImageWithFallback
                  src={post.coverImageUrl}
                  alt={post.coverImageAlt}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
              <div className="space-y-4 p-5 sm:p-6">
                <p className="text-[0.76rem] uppercase tracking-[0.26em] text-foreground/48">
                  {post.category} · {formatJournalDate(post.publishedAt)}
                </p>
                <h3 className="text-[1.55rem] leading-tight transition-colors group-hover:text-accent">
                  {post.title}
                </h3>
                <p className="text-sm leading-7 text-foreground/68 sm:text-base">{post.excerpt}</p>
                <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-foreground/55 transition-colors group-hover:text-accent">
                  {getJournalReadingTimeMinutes(post.body)} min read
                  <ArrowRight size={14} />
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
