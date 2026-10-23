// Web counterpart of LibroxBookView / LibroxCoverPalette. Keep the complete
// catalog jacket; the app's engraved plates are the fallback, not replacements.
const MASK64 = (1n << 64n) - 1n;
const TINTS = ['#2f4a4a', '#8a4b2f', '#6b4a5c', '#4a5c4a', '#3f4e63', '#7a6a3f'];
const MARINE = new Set('sea seas ocean oceans wave waves whale whales maritime ship ships sail sailing tide tides river rivers island islands moby mobydick water undertow estuary current harbor harbour coast shore reef storm beach tidal tidebound'.split(' '));
const GARDEN = new Set('garden gardens flower flowers botany botanical forest forests nature plant plants romance poetry fairy woodland orchard meadow vines'.split(' '));
const CLOTH = {ocean:['#0d3731','#14394c','#2e414c'], botanical:['#593430','#364937','#4d3952']};

export function coverSeed(title) {
  let hash = 5381n;
  for (const byte of new TextEncoder().encode(title)) hash = (hash * 33n + BigInt(byte)) & MASK64;
  return hash;
}

export function coverDesign(title, subjects = [], series = '') {
  const words = (title + ' ' + series + ' ' + subjects.join(' ')).toLowerCase().split(/[^\p{L}]+/u);
  const seed = coverSeed(title);
  const family = words.some(word => MARINE.has(word)) ? 'ocean'
    : words.some(word => GARDEN.has(word)) ? 'botanical' : seed % 2n === 0n ? 'ocean' : 'botanical';
  return {family, cloth:CLOTH[family][Number(seed % 3n)], tint:TINTS[Number(seed % 6n)]};
}

const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
export function safeHTTPS(value) {
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : null; }
  catch { return null; }
}

export function coverMarkup(book, {eager = false} = {}) {
  const title = String(book.title || 'Untitled');
  const design = coverDesign(title, book.subjects, book.series);
  const source = safeHTTPS(book.cover);
  const titleClass = title.length > 45 ? ' is-long' : title.length > 16 ? ' is-medium' : '';
  // Native covers shrink long lettering within their board. Keep whole words
  // on the web too; the full, unabridged title is always readable below it.
  const longestWord = Math.max(...title.split(/[\s\-–—]+/u).map(word => [...word].length), 1);
  const baseSize = title.length > 45 ? 8 : title.length > 16 ? 11.2 : design.family === 'botanical' ? 15 : 14.5;
  const titleSize = Math.min(baseSize, 82 / longestWord).toFixed(2);
  return `<span class="bound-book ${design.family}${titleClass}" style="--book-cloth:${design.cloth};--book-tint:${design.tint};--book-title-size:${titleSize}cqw" aria-hidden="true">
    <span class="book-light"></span><span class="book-volume">
      <span class="book-pages"></span><span class="book-board">
        <span class="book-fallback"><img class="book-engraving" src="assets/covers/${design.family}.webp" width="600" height="900" alt="" loading="${eager ? 'eager' : 'lazy'}" decoding="async" />
          <span class="book-lettering"><span class="book-cover-title">${escape(title)}</span><span class="book-cover-author">${escape(book.author)}</span></span>
        </span>${source ? `<img class="book-jacket" src="${escape(source)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" />` : ''}
        <span class="book-binding"></span><span class="book-crease"></span><span class="book-sheen"></span>
      </span>
    </span>
  </span>`;
}

export const suggestedBooks = [
  {title:'Pride and Prejudice', author:'Jane Austen', subjects:['Romance']},
  {title:'Moby-Dick', author:'Herman Melville'},
  {title:'Walden', author:'Henry David Thoreau', subjects:['Nature']},
];

export function suggestedMarkup() {
  return suggestedBooks.map(book => `<li><button class="suggested-book" type="button" data-search-query="${escape(book.title)}" aria-label="Search for ${escape(book.title)}">
    ${coverMarkup(book, {eager:true})}
    <span class="suggested-meta"><strong>${escape(book.title)}</strong><span>${escape(book.author)}</span><span class="suggested-action">Find this book <span class="icon i-arrow-right" aria-hidden="true"></span></span></span>
  </button></li>`).join('\n');
}
