import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { GalleryPreview } from './components/GalleryPreview';
import { GalleryPage } from './components/GalleryPage';
import { Craftsmanship } from './components/Craftsmanship';
import { BlogPreview } from './components/BlogPreview';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import type { GalleryContent } from './lib/gallery';
import type { HeroContent } from './lib/heroContent';
import type { AboutContent } from './lib/aboutContent';
import type { ContactContent } from './lib/contactContent';
import type { CraftsmanshipContent } from './lib/craftsmanshipContent';

type AppProps = {
  heroContent: HeroContent;
  aboutContent: AboutContent;
  galleryContent: GalleryContent;
  contactContent: ContactContent;
  craftsmanshipContent: CraftsmanshipContent;
  routePath?: string;
};

export default function App({
  heroContent,
  aboutContent,
  galleryContent,
  contactContent,
  craftsmanshipContent,
  routePath = '/',
}: AppProps) {
  const normalizedPath = routePath === '' ? '/' : routePath.replace(/\/+$/, '') || '/';
  const isGalleryPage = normalizedPath === '/gallery';

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_top,rgba(168,153,110,0.18),transparent_65%)]" />
        <div className="absolute left-[-8rem] top-[32rem] h-72 w-72 rounded-full bg-secondary/40 blur-3xl" />
        <div className="absolute right-[-10rem] top-[58rem] h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      </div>
      <Navigation currentPath={normalizedPath} />
      {isGalleryPage ? (
        <GalleryPage content={galleryContent} />
      ) : (
        <>
          <Hero content={heroContent} />
          <About content={aboutContent} />
          <GalleryPreview content={galleryContent} />
          <Craftsmanship content={craftsmanshipContent} />
          <BlogPreview />
        </>
      )}
      <Contact content={contactContent} />
      <Footer />
    </div>
  );
}
