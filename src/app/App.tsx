import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { FeaturedWork } from './components/FeaturedWork';
import { Craftsmanship } from './components/Craftsmanship';
import { BlogPreview } from './components/BlogPreview';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <About />
      <FeaturedWork />
      <Craftsmanship />
      <BlogPreview />
      <Contact />
      <Footer />
    </div>
  );
}