import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import {
  formatJournalDate,
  getJournalPostBySlug,
  getJournalReadingTimeMinutes,
  getRelatedJournalPosts,
  parseJournalBody,
  type JournalContent,
} from '../lib/journal';

type JournalArticlePageProps = {
  content: JournalContent;
  slug: string;
};

export function JournalArticlePage({ content, slug }: JournalArticlePageProps) {
  const post = getJournalPostBySlug(content, slug);

  if (!post) {
    return (
      <main className="pb-20 pt-28 sm:pt-32 lg:pb-32">
        <section className="section-shell">
          <div className="panel-surface mx-auto max-w-3xl px-6 py-14 text-center sm:px-10">
            <p className="section-kicker">Journal</p>
            <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)', lineHeight: '1.02' }}>Article not found</h1>
            <p className="mx-auto mt-5 max-w-2xl text-[1rem] leading-8 text-foreground/68 sm:text-[1.08rem]">
              This journal entry is no longer available or has not been published yet.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a
                href="/journal"
                className="inline-flex items-center gap-2 border border-border bg-white px-5 py-3 text-sm transition-colors hover:border-accent hover:text-accent"
              >
                <ArrowLeft size={16} />
                Back to Journal
              </a>
              <a
                href="/"
                className="inline-flex items-center gap-2 border border-primary bg-primary px-5 py-3 text-sm text-primary-foreground transition-colors hover:border-accent hover:bg-accent"
              >
                Return Home
              </a>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const bodyBlocks = parseJournalBody(post.body);
  const relatedPosts = getRelatedJournalPosts(content, post.slug, 2);
  const supportingImages = post.galleryImageUrls.slice(1);

  return (
    <main className="pb-20 pt-28 sm:pt-32 lg:pb-32">
      <section className="section-shell">
        <div className="reveal-up mx-auto max-w-6xl">
          <a
            href="/journal"
            className="inline-flex items-center gap-2 text-sm text-foreground/62 transition-colors hover:text-accent"
          >
            <ArrowLeft size={15} />
            Back to Journal
          </a>

          <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,0.72fr)_minmax(19rem,0.28fr)] xl:items-start">
            <div>
              <p className="section-kicker">{post.category}</p>
              <h1 style={{ fontSize: 'clamp(3rem, 6vw, 5.4rem)', lineHeight: '0.94' }}>{post.title}</h1>
              <p className="mt-6 max-w-3xl text-[1.06rem] leading-8 text-foreground/68 sm:text-[1.14rem]">
                {post.excerpt}
              </p>
            </div>

            <aside className="panel-surface grid gap-4 p-5 sm:p-6">
              <div>
                <p className="text-[0.72rem] uppercase tracking-[0.24em] text-foreground/42">Published</p>
                <p className="mt-2 text-sm leading-7 text-foreground/78">{formatJournalDate(post.publishedAt)}</p>
              </div>
              <div>
                <p className="text-[0.72rem] uppercase tracking-[0.24em] text-foreground/42">Reading Time</p>
                <p className="mt-2 text-sm leading-7 text-foreground/78">{getJournalReadingTimeMinutes(post.body)} minutes</p>
              </div>
              <div>
                <p className="text-[0.72rem] uppercase tracking-[0.24em] text-foreground/42">Category</p>
                <p className="mt-2 text-sm leading-7 text-foreground/78">{post.category}</p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="section-shell mt-12 sm:mt-14">
        <div className="reveal-up overflow-hidden border border-border bg-white shadow-[0_24px_70px_rgba(45,41,38,0.08)]">
          <div className="h-[23rem] sm:h-[30rem] lg:h-[38rem]">
            <ImageWithFallback
              src={post.coverImageUrl}
              alt={post.coverImageAlt}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="section-shell mt-14 sm:mt-16">
        <div className="grid gap-12 xl:grid-cols-[minmax(0,0.72fr)_minmax(19rem,0.28fr)]">
          <article className="min-w-0">
            <div className="mx-auto max-w-3xl space-y-7 text-[1.02rem] leading-8 text-foreground/74 sm:text-[1.08rem] sm:leading-9">
              {bodyBlocks.map((block, index) => {
                if (block.type === 'heading') {
                  return (
                    <h2 key={`${block.type}-${index}`} className="pt-5 text-[1.8rem] leading-tight text-foreground sm:text-[2.2rem]">
                      {block.content}
                    </h2>
                  );
                }

                if (block.type === 'quote') {
                  return (
                    <blockquote
                      key={`${block.type}-${index}`}
                      className="border-l border-accent/45 pl-6 text-[1.25rem] leading-9 text-foreground/82 sm:text-[1.45rem] sm:leading-10"
                    >
                      {block.content}
                    </blockquote>
                  );
                }

                if (block.type === 'list') {
                  return (
                    <ul key={`${block.type}-${index}`} className="space-y-3 pl-5 text-foreground/72">
                      {block.items.map((item) => (
                        <li key={item} className="list-disc">
                          {item}
                        </li>
                      ))}
                    </ul>
                  );
                }

                return <p key={`${block.type}-${index}`}>{block.content}</p>;
              })}
            </div>
          </article>

          <aside className="space-y-5 xl:sticky xl:top-28 xl:self-start">
            {supportingImages.length > 0 ? (
              <div className="panel-surface space-y-4 p-4">
                <p className="text-[0.72rem] uppercase tracking-[0.24em] text-foreground/42">Archive Frames</p>
                <div className="grid gap-4">
                  {supportingImages.slice(0, 4).map((imageUrl, index) => (
                    <div key={imageUrl} className="overflow-hidden">
                      <ImageWithFallback
                        src={imageUrl}
                        alt={`${post.title} supporting image ${index + 1}`}
                        className="h-[11rem] w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="panel-surface p-5 sm:p-6">
              <p className="text-[0.72rem] uppercase tracking-[0.24em] text-foreground/42">Continue</p>
              <a
                href="/#contact"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-foreground/78 transition-colors hover:text-accent"
              >
                Inquire for Details
                <ArrowUpRight size={15} />
              </a>
            </div>
          </aside>
        </div>
      </section>

      {relatedPosts.length > 0 ? (
        <section className="section-shell mt-16 sm:mt-20">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="section-kicker">More Reading</p>
              <h2 className="text-[2rem] leading-tight sm:text-[2.5rem]">Continue in the Journal</h2>
            </div>
            <a href="/journal" className="text-sm transition-colors hover:text-accent">
              View all
            </a>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {relatedPosts.map((relatedPost) => (
              <a
                key={relatedPost.slug}
                href={`/journal/${relatedPost.slug}`}
                className="group overflow-hidden border border-border bg-white shadow-[0_18px_48px_rgba(45,41,38,0.08)]"
              >
                <div className="h-[17rem] overflow-hidden">
                  <ImageWithFallback
                    src={relatedPost.coverImageUrl}
                    alt={relatedPost.coverImageAlt}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="space-y-3 p-5 sm:p-6">
                  <p className="text-[0.76rem] uppercase tracking-[0.26em] text-foreground/48">
                    {relatedPost.category} · {formatJournalDate(relatedPost.publishedAt)}
                  </p>
                  <h3 className="text-[1.45rem] leading-tight transition-colors group-hover:text-accent">
                    {relatedPost.title}
                  </h3>
                  <p className="text-sm leading-7 text-foreground/68">{relatedPost.excerpt}</p>
                </div>
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
