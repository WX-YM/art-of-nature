import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createIpRateLimiter,
  escapeHtml,
  getCookieValue,
  hashesMatch,
  isAuthorizedForInvalidation,
  parseContactMessageInput,
  serializeForScript,
} from '../server/http-utils';

test('hashesMatch validates equal and different values', () => {
  assert.equal(hashesMatch('secret-value', '31160254d1297393d2ad00e1c01851aec834361e02c524b89fe06aff2879ce6a'), true);
  assert.equal(hashesMatch('secret-value', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'), false);
});

test('getCookieValue returns decoded cookie and handles malformed values safely', () => {
  assert.equal(getCookieValue('x=1; session_token=abc%20123', 'session_token'), 'abc 123');
  assert.equal(getCookieValue('x=1; session_token=%E0%A4%A', 'session_token'), undefined);
  assert.equal(getCookieValue(undefined, 'session_token'), undefined);
});

test('escapeHtml escapes html-sensitive characters', () => {
  assert.equal(escapeHtml(`<&>"'`), '&lt;&amp;&gt;&quot;&#39;');
});

test('parseContactMessageInput validates and trims contact payload', () => {
  assert.deepEqual(parseContactMessageInput(null), { error: 'Invalid request body.' });
  assert.deepEqual(parseContactMessageInput({}), { error: 'All fields are required.' });
  assert.deepEqual(
    parseContactMessageInput({ name: 'N', email: 'invalid', projectType: 'P', message: 'M' }),
    { error: 'Please provide a valid email address.' }
  );

  const parsed = parseContactMessageInput({
    name: '  Jane Doe  ',
    email: '  jane@example.com  ',
    phone: '  +1 (555) 010-1234  ',
    projectType: '  Furniture  ',
    message: '  Hello there  ',
  });

  assert.deepEqual(parsed, {
    data: {
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+1 (555) 010-1234',
      projectType: 'Furniture',
      message: 'Hello there',
    },
  });
});

test('parseContactMessageInput allows missing phone and rejects invalid phone', () => {
  const parsedWithoutPhone = parseContactMessageInput({
    name: 'Jane Doe',
    email: 'jane@example.com',
    projectType: 'Furniture',
    message: 'Hello there',
  });

  assert.deepEqual(parsedWithoutPhone, {
    data: {
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: undefined,
      projectType: 'Furniture',
      message: 'Hello there',
    },
  });

  const parsedWithInvalidPhone = parseContactMessageInput({
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: 'abc#@',
    projectType: 'Furniture',
    message: 'Hello there',
  });

  assert.deepEqual(parsedWithInvalidPhone, { error: 'Please provide a valid phone number.' });
});

test('parseContactMessageInput rejects oversized fields', () => {
  const parsed = parseContactMessageInput({
    name: 'a'.repeat(121),
    email: 'valid@example.com',
    projectType: 'project',
    message: 'message',
  });

  assert.deepEqual(parsed, { error: 'One or more fields exceed allowed length.' });
});

test('serializeForScript escapes html tag opening characters', () => {
  assert.equal(serializeForScript({ value: '<script>' }), '{"value":"\\u003cscript>"}');
});

test('isAuthorizedForInvalidation enforces token only when configured', () => {
  const previous = process.env.CACHE_INVALIDATE_TOKEN;

  delete process.env.CACHE_INVALIDATE_TOKEN;
  assert.equal(isAuthorizedForInvalidation(undefined), false);

  process.env.CACHE_INVALIDATE_TOKEN = 'token-1';
  assert.equal(isAuthorizedForInvalidation('token-1'), true);
  assert.equal(isAuthorizedForInvalidation('token-2'), false);

  if (previous === undefined) {
    delete process.env.CACHE_INVALIDATE_TOKEN;
  } else {
    process.env.CACHE_INVALIDATE_TOKEN = previous;
  }
});

test('createIpRateLimiter tracks remaining calls, blocks overflow, and resets after window', () => {
  const limiter = createIpRateLimiter(1000, 2);
  const originalDateNow = Date.now;
  let now = 1000;
  Date.now = () => now;

  const nextCalls: number[] = [];
  const deniedStatuses: number[] = [];

  function createResponse() {
    const headers = new Map<string, string>();
    return {
      headers,
      setHeader(key: string, value: string) {
        headers.set(key, value);
      },
      status(code: number) {
        deniedStatuses.push(code);
        return this;
      },
      json() {
        return this;
      },
    };
  }

  try {
    const req = { ip: '127.0.0.1' } as never;

    limiter(req, createResponse() as never, () => {
      nextCalls.push(1);
    });
    limiter(req, createResponse() as never, () => {
      nextCalls.push(1);
    });
    limiter(req, createResponse() as never, () => {
      nextCalls.push(1);
    });

    assert.equal(nextCalls.length, 2);
    assert.deepEqual(deniedStatuses, [429]);

    now += 1000;

    limiter(req, createResponse() as never, () => {
      nextCalls.push(1);
    });

    assert.equal(nextCalls.length, 3);
  } finally {
    Date.now = originalDateNow;
  }
});
