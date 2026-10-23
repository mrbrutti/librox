import assert from 'node:assert/strict';
import {coverMarkup, safeHTTPS} from '../book-cover.mjs';

// Catalog metadata is untrusted; the cover template is the one HTML boundary.
const hostile = coverMarkup({title:'<img src=x onerror="alert(1)">', author:'</span><script>alert(2)</script>', cover:'javascript:alert(3)'});
assert(!hostile.includes('<script>'));
assert(!hostile.includes('<img src=x'));
assert(hostile.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'));
assert(!hostile.includes('book-jacket'));
for (const unsafe of ['http://example.com/book.epub', 'javascript:alert(1)', '//example.com/book.epub', 'https://user:password@example.com/book.epub', '', undefined]) {
  assert.equal(safeHTTPS(unsafe), null);
}
const jacket = coverMarkup({title:'A & B', author:'Author', cover:'https://example.com/cover.jpg?q=" onerror="x'});
assert(jacket.includes('A &amp; B'));
assert(!jacket.includes('" onerror='));
console.log('Cover metadata escaping and HTTPS boundaries passed.');
