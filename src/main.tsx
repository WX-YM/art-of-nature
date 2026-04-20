import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './app/App.tsx';
import './styles/index.css';
import { defaultHeroContent, type HeroContent } from './app/lib/heroContent';
import { defaultAboutContent, type AboutContent } from './app/lib/aboutContent';
import { defaultContactContent, type ContactContent } from './app/lib/contactContent';

declare global {
  interface Window {
    __INITIAL_HERO__?: HeroContent;
    __INITIAL_ABOUT__?: AboutContent;
    __INITIAL_CONTACT__?: ContactContent;
  }
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element was not found.');
}

const heroContent = window.__INITIAL_HERO__ ?? defaultHeroContent;
const aboutContent = window.__INITIAL_ABOUT__ ?? defaultAboutContent;
const contactContent = window.__INITIAL_CONTACT__ ?? defaultContactContent;

if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, <App heroContent={heroContent} aboutContent={aboutContent} contactContent={contactContent} />);
} else {
  createRoot(rootElement).render(<App heroContent={heroContent} aboutContent={aboutContent} contactContent={contactContent} />);
}
