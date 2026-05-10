import { type ContactContent } from '../src/app/lib/contactContent';
import { type CraftsmanshipContent } from '../src/app/lib/craftsmanshipContent';

export function parseRequiredStringField(body: unknown, fieldName: string, maxLength: number = 10000): string {
  if (!body || typeof body !== 'object') {
    throw new Error(`Invalid ${fieldName}.`);
  }

  const value = (body as Record<string, unknown>)[fieldName];
  const parsed = typeof value === 'string' ? value.trim() : '';

  if (!parsed || parsed.length > maxLength) {
    throw new Error(`Invalid ${fieldName}.`);
  }

  return parsed;
}

export function parseOptionalStringField(body: unknown, fieldName: string, maxLength: number = 10000): string {
  if (!body || typeof body !== 'object') {
    return '';
  }

  const value = (body as Record<string, unknown>)[fieldName];
  const parsed = typeof value === 'string' ? value.trim() : '';

  if (parsed.length > maxLength) {
    throw new Error(`Invalid ${fieldName}.`);
  }

  return parsed;
}

export function parseMultilineField(body: unknown, fieldName: string): string[] {
  if (!body || typeof body !== 'object') {
    return [];
  }

  const raw = (body as Record<string, unknown>)[fieldName];
  if (typeof raw !== 'string') {
    return [];
  }

  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function toContactLinksText(directContacts: ContactContent['directContacts']): string {
  return directContacts.map((item) => `${item.href} | ${item.label}`).join('\n');
}

export function toCraftsmanshipItemsText(items: CraftsmanshipContent['items']): string {
  return items.map((item) => `${item.title} | ${item.description}`).join('\n');
}

export function parseDirectContacts(body: unknown, fieldName: string): ContactContent['directContacts'] {
  return parseMultilineField(body, fieldName)
    .map((line) => {
      const separatorIndex = line.indexOf('|');
      if (separatorIndex < 0) {
        return null;
      }

      const href = line.slice(0, separatorIndex).trim();
      const label = line.slice(separatorIndex + 1).trim();

      if (!href || !label) {
        return null;
      }

      return { href, label };
    })
    .filter((item): item is { href: string; label: string } => item !== null);
}

export function parseCraftsmanshipItems(body: unknown, fieldName: string): CraftsmanshipContent['items'] {
  return parseMultilineField(body, fieldName)
    .map((line) => {
      const separatorIndex = line.indexOf('|');
      if (separatorIndex < 0) {
        return null;
      }

      const title = line.slice(0, separatorIndex).trim();
      const description = line.slice(separatorIndex + 1).trim();

      if (!title || !description) {
        return null;
      }

      return { title, description };
    })
    .filter((item): item is { title: string; description: string } => item !== null);
}
