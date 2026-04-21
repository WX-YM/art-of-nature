import { renderToString } from 'react-dom/server';
import App from './app/App';
import type { HeroContent } from './app/lib/heroContent';
import type { AboutContent } from './app/lib/aboutContent';
import type { ContactContent } from './app/lib/contactContent';
import type { CraftsmanshipContent } from './app/lib/craftsmanshipContent';

export function render(
  heroContent: HeroContent,
  aboutContent: AboutContent,
  contactContent: ContactContent,
  craftsmanshipContent: CraftsmanshipContent
): string {
  return renderToString(
    <App
      heroContent={heroContent}
      aboutContent={aboutContent}
      contactContent={contactContent}
      craftsmanshipContent={craftsmanshipContent}
    />
  );
}
