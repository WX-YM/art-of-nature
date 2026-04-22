import { createHash, timingSafeEqual } from 'node:crypto';
import type express from 'express';
import type { ContactMessageInput } from '../src/app/lib/contactMessage';

export function sha256Hex(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

export function hashesMatch(rawValue: string, hashedValue: string) {
  const incomingHash = sha256Hex(rawValue);

  if (incomingHash.length !== hashedValue.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(incomingHash), Buffer.from(hashedValue));
}

export function getCookieValue(cookieHeader: string | undefined, cookieName: string) {
  if (!cookieHeader) {
    return undefined;
  }

  const cookiePairs = cookieHeader.split(';');

  for (const cookiePair of cookiePairs) {
    const separatorIndex = cookiePair.indexOf('=');
    if (separatorIndex < 0) {
      continue;
    }

    const key = cookiePair.slice(0, separatorIndex).trim();
    if (key !== cookieName) {
      continue;
    }

    const value = cookiePair.slice(separatorIndex + 1).trim();

    try {
      return decodeURIComponent(value);
    } catch {
      return undefined;
    }
  }

  return undefined;
}

export function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function createIpRateLimiter(windowMs: number, maxRequests: number) {
  const requestsByIp = new Map<string, { count: number; windowStart: number }>();

  // Cleanup interval to prevent memory leaks from stale IP tracking
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [ip, current] of requestsByIp.entries()) {
      if (now - current.windowStart >= windowMs) {
        requestsByIp.delete(ip);
      }
    }
  }, Math.max(windowMs, 60000));
  cleanupTimer.unref();

  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const now = Date.now();
    const ip = req.ip || 'unknown';
    const current = requestsByIp.get(ip);

    if (!current || now - current.windowStart >= windowMs) {
      requestsByIp.set(ip, { count: 1, windowStart: now });
      res.setHeader('X-RateLimit-Limit', String(maxRequests));
      res.setHeader('X-RateLimit-Remaining', String(Math.max(maxRequests - 1, 0)));
      next();
      return;
    }

    if (current.count >= maxRequests) {
      const retryAfterSeconds = Math.ceil((windowMs - (now - current.windowStart)) / 1000);
      res.setHeader('Retry-After', String(Math.max(retryAfterSeconds, 1)));
      res.setHeader('X-RateLimit-Limit', String(maxRequests));
      res.setHeader('X-RateLimit-Remaining', '0');
      res.status(429).json({ message: 'Too many requests. Please try again later.' });
      return;
    }

    current.count += 1;
    requestsByIp.set(ip, current);
    res.setHeader('X-RateLimit-Limit', String(maxRequests));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(maxRequests - current.count, 0)));
    next();
  };
}

export function parseContactMessageInput(body: unknown): { data: ContactMessageInput } | { error: string } {
  if (!body || typeof body !== 'object') {
    return { error: 'Invalid request body.' };
  }

  const raw = body as Record<string, unknown>;
  const name = typeof raw.name === 'string' ? raw.name.trim() : '';
  const email = typeof raw.email === 'string' ? raw.email.trim() : '';
  const projectType = typeof raw.projectType === 'string' ? raw.projectType.trim() : '';
  const message = typeof raw.message === 'string' ? raw.message.trim() : '';

  if (!name || !email || !projectType || !message) {
    return { error: 'All fields are required.' };
  }

  if (name.length > 120 || email.length > 254 || projectType.length > 120 || message.length > 5000) {
    return { error: 'One or more fields exceed allowed length.' };
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return { error: 'Please provide a valid email address.' };
  }

  return {
    data: {
      name,
      email,
      projectType,
      message,
    },
  };
}

export function serializeForScript(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function isAuthorizedForInvalidation(requestToken: string | undefined) {
  const expectedToken = process.env.CACHE_INVALIDATE_TOKEN;

  if (!expectedToken) {
    return true;
  }

  return requestToken === expectedToken;
}
