// The app's physical book treatment, applied to each catalog's original jacket.
// Artwork is never replaced with Librox's illustrative cover templates.
const MASK64 = (1n << 64n) - 1n;
const TINTS = ['#2f4a4a', '#8a4b2f', '#6b4a5c', '#4a5c4a', '#3f4e63', '#7a6a3f'];

export function coverSeed(title) {
  let hash = 5381n;
  for (const byte of new TextEncoder().encode(title)) hash = (hash * 33n + BigInt(byte)) & MASK64;
  return hash;
}

const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
export function safeHTTPS(value) {
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : null; }
  catch { return null; }
}

export function coverMarkup(book, {eager = false, localCover = ''} = {}) {
  const title = String(book.title || 'Untitled');
  const tint = TINTS[Number(coverSeed(title) % 6n)];
  const source = /^assets\/covers\/[a-z0-9-]+\.jpg$/.test(localCover) ? localCover : safeHTTPS(book.cover);
  const titleClass = title.length > 45 ? ' is-long' : '';
  // Native covers shrink long lettering within their board. Keep whole words
  // on the web too; the full, unabridged title is always readable below it.
  const longestWord = Math.max(...title.split(/[\s\-–—]+/u).map(word => [...word].length), 1);
  const baseSize = title.length > 45 ? 8 : title.length > 16 ? 11.2 : 14.5;
  const titleSize = Math.min(baseSize, 82 / longestWord).toFixed(2);
  return `<span class="bound-book${titleClass}" style="--book-cloth:${tint};--book-tint:${tint};--book-title-size:${titleSize}cqw" aria-hidden="true">
    <span class="book-light"></span><span class="book-shadow"></span><span class="book-volume">
      <span class="book-back"></span><span class="book-spine"><span>${escape(title)}</span></span>
      <span class="book-pages book-pages-edge"></span><span class="book-pages book-pages-top"></span><span class="book-pages book-pages-bottom"></span>
      <span class="book-board">
        <span class="book-fallback">
          <span class="book-lettering"><span class="book-cover-title">${escape(title)}</span><span class="book-cover-author">${escape(book.author)}</span></span>
        </span>${source ? `<img class="book-jacket${localCover ? ' is-loaded' : ''}" src="${escape(source)}" alt="" loading="${eager ? 'eager' : 'lazy'}" decoding="async" referrerpolicy="no-referrer" />` : ''}
        <span class="book-binding"></span><span class="book-crease"></span><span class="book-sheen"></span>
      </span>
    </span>
  </span>`;
}

export const suggestedBooks = [
  {title:'Pride and Prejudice', author:'Jane Austen', localCover:'assets/covers/pride-and-prejudice.jpg'},
  {title:'Moby-Dick', author:'Herman Melville', localCover:'assets/covers/moby-dick.jpg'},
  {title:'Walden', author:'Henry David Thoreau', localCover:'assets/covers/walden.jpg'},
];

export function suggestedMarkup() {
  return suggestedBooks.map(book => `<li><button class="suggested-book" type="button" data-search-query="${escape(book.title)}" aria-label="Search for ${escape(book.title)}">
    ${coverMarkup(book, {eager:true, localCover:book.localCover})}
    <span class="suggested-meta"><strong>${escape(book.title)}</strong><span>${escape(book.author)}</span><span class="suggested-action">Find this book <span class="icon i-arrow-right" aria-hidden="true"></span></span></span>
  </button></li>`).join('\n');
}
