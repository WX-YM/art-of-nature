import { renderToString } from 'react-dom/server';
import App from './app/App';
import type { HeroContent } from './app/lib/heroContent';
import type { AboutContent } from './app/lib/aboutContent';

export function render(heroContent: HeroContent, aboutContent: AboutContent): string {
  return renderToString(<App heroContent={heroContent} aboutContent={aboutContent} />);
}
