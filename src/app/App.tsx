import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { FeaturedWork } from './components/FeaturedWork';
import { Craftsmanship } from './components/Craftsmanship';
import { BlogPreview } from './components/BlogPreview';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import type { HeroContent } from './lib/heroContent';
import type { AboutContent } from './lib/aboutContent';

type AppProps = {
  heroContent: HeroContent;
  aboutContent: AboutContent;
};

export default function App({ heroContent, aboutContent }: AppProps) {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_top,rgba(168,153,110,0.18),transparent_65%)]" />
        <div className="absolute left-[-8rem] top-[32rem] h-72 w-72 rounded-full bg-secondary/40 blur-3xl" />
        <div className="absolute right-[-10rem] top-[58rem] h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      </div>
      <Navigation />
      <main>
        <Hero content={heroContent} />
        <About content={aboutContent} />
        <FeaturedWork />
        <Craftsmanship />
        <BlogPreview />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
