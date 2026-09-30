import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
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

export function safeStringEqual(left: string, right: string) {
  // Compare digests so neither the length nor the content leaks through timing.
  return timingSafeEqual(createHash('sha256').update(left).digest(), createHash('sha256').update(right).digest());
}

const scryptPrefix = 'scrypt';
const scryptKeyLength = 64;
const scryptOptions = { N: 16384, r: 8, p: 1 } as const;

export function hashPassword(password: string) {
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, scryptKeyLength, scryptOptions);
  return `${scryptPrefix}$${salt.toString('hex')}$${derived.toString('hex')}`;
}

export function isLegacyPasswordHash(hashedPassword: string) {
  return !hashedPassword.startsWith(`${scryptPrefix}$`);
}

export function verifyPassword(password: string, hashedPassword: string) {
  if (typeof hashedPassword !== 'string' || !hashedPassword) {
    return false;
  }

  if (isLegacyPasswordHash(hashedPassword)) {
    // Unsalted SHA-256 hashes created by older versions of scripts/create-user.ts.
    return hashesMatch(password, hashedPassword);
  }

  const [, saltHex, hashHex] = hashedPassword.split('$');
  if (!saltHex || !hashHex) {
    return false;
  }

  const expected = Buffer.from(hashHex, 'hex');
  if (expected.length !== scryptKeyLength) {
    return false;
  }

  const derived = scryptSync(password, Buffer.from(saltHex, 'hex'), scryptKeyLength, scryptOptions);
  return timingSafeEqual(derived, expected);
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
  const phone = typeof raw.phone === 'string' ? raw.phone.trim() : '';
  const projectType = typeof raw.projectType === 'string' ? raw.projectType.trim() : '';
  const message = typeof raw.message === 'string' ? raw.message.trim() : '';

  if (!name || !email || !projectType || !message) {
    return { error: 'All fields are required.' };
  }

  // Single-line fields end up in email headers when messages are forwarded.
  const controlCharacterPattern = /[\u0000-\u001f\u007f]/;
  if ([name, email, phone, projectType].some((value) => controlCharacterPattern.test(value))) {
    return { error: 'One or more fields contain invalid characters.' };
  }

  if (name.length > 120 || email.length > 254 || phone.length > 40 || projectType.length > 120 || message.length > 5000) {
    return { error: 'One or more fields exceed allowed length.' };
  }

  const phonePattern = /^[+\d\s().-]+$/;
  if (phone && !phonePattern.test(phone)) {
    return { error: 'Please provide a valid phone number.' };
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return { error: 'Please provide a valid email address.' };
  }

  return {
    data: {
      name,
      email,
      phone: phone || undefined,
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
    return false; // Secure by default
  }

  if (typeof requestToken !== 'string' || !requestToken) {
    return false;
  }

  return safeStringEqual(requestToken, expectedToken);
}
