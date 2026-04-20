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
import type { ContactContent } from './lib/contactContent';

type AppProps = {
  heroContent: HeroContent;
  aboutContent: AboutContent;
  contactContent: ContactContent;
};

export default function App({ heroContent, aboutContent, contactContent }: AppProps) {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero content={heroContent} />
      <About content={aboutContent} />
      <FeaturedWork />
      <Craftsmanship />
      <BlogPreview />
      <Contact content={contactContent} />
      <Footer />
    </div>
  );
}