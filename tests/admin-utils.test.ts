import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseOptionalStringField,
  parseRequiredStringField,
  parseMultilineField,
  toContactLinksText,
  toCraftsmanshipItemsText,
  parseDirectContacts,
  parseCraftsmanshipItems
} from '../server/admin-utils';

test('parseRequiredStringField extracts and trims valid strings', () => {
  const body = { name: '  hello  ' };
  assert.equal(parseRequiredStringField(body, 'name'), 'hello');
});

test('parseRequiredStringField throws on missing, empty, or oversized values', () => {
  assert.throws(() => parseRequiredStringField(null, 'name'), /Invalid name/);
  assert.throws(() => parseRequiredStringField({}, 'name'), /Invalid name/);
  assert.throws(() => parseRequiredStringField({ name: '   ' }, 'name'), /Invalid name/);
  assert.throws(() => parseRequiredStringField({ name: 'abcd' }, 'name', 3), /Invalid name/);
});

test('parseOptionalStringField trims valid strings and allows blank values', () => {
  assert.equal(parseOptionalStringField({ name: '  hello  ' }, 'name'), 'hello');
  assert.equal(parseOptionalStringField({ name: '   ' }, 'name'), '');
  assert.equal(parseOptionalStringField({}, 'name'), '');
  assert.equal(parseOptionalStringField(null, 'name'), '');
  assert.throws(() => parseOptionalStringField({ name: 'abcd' }, 'name', 3), /Invalid name/);
});

test('parseMultilineField splits and trims lines ignoring empty ones', () => {
  const body = { data: ' line1 \n\n  line2\r\nline3  \n ' };
  assert.deepEqual(parseMultilineField(body, 'data'), ['line1', 'line2', 'line3']);
});

test('parseMultilineField returns empty array for invalid input', () => {
  assert.deepEqual(parseMultilineField(null, 'data'), []);
  assert.deepEqual(parseMultilineField({}, 'data'), []);
  assert.deepEqual(parseMultilineField({ data: 123 }, 'data'), []);
});

test('toContactLinksText maps direct contacts to textual representation', () => {
  const input = [
    { href: 'mailto:me@sys.com', label: 'Email Me' },
    { href: 'tel:123', label: 'Call Me' }
  ];
  const expected = 'mailto:me@sys.com | Email Me\ntel:123 | Call Me';
  assert.equal(toContactLinksText(input), expected);
});

test('toCraftsmanshipItemsText maps items to textual representation', () => {
  const input = [
    { title: 'Item1', description: 'Desc1' },
    { title: 'Item2', description: 'Desc2' }
  ];
  const expected = 'Item1 | Desc1\nItem2 | Desc2';
  assert.equal(toCraftsmanshipItemsText(input), expected);
});

test('parseDirectContacts parses correct multi-line inputs into array of links', () => {
  const body = { contacts: 'mailto:me@sys.com | Email Me\n \n tel:123 | Call Me \ninvalid-line\n | \nmissing-label | \nhref | ' };
  const expected = [
    { href: 'mailto:me@sys.com', label: 'Email Me' },
    { href: 'tel:123', label: 'Call Me' }
  ];
  assert.deepEqual(parseDirectContacts(body, 'contacts'), expected);
});

test('parseCraftsmanshipItems parses correct multi-line inputs into array of items', () => {
  const body = { items: 'Title 1 | Desc 1\nTitle 2 | Desc 2 \n invalid-line ' };
  const expected = [
    { title: 'Title 1', description: 'Desc 1' },
    { title: 'Title 2', description: 'Desc 2' }
  ];
  assert.deepEqual(parseCraftsmanshipItems(body, 'items'), expected);
});
