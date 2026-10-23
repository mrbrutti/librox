# Native Librox cover artwork

These are delivery-size WebP copies of the artwork already used by the app:

- `ocean.webp`: `Libros/Resources/CoverArtwork.xcassets/CoverOcean.imageset/cover-ocean.png`
- `botanical.webp`: `Libros/Resources/CoverArtwork.xcassets/CoverBotanical.imageset/cover-botanical.png`

Source repository: `/Users/matt/Code/swift/Libros`. Converted with cwebp,
600 × 900, quality 88, alpha quality 100. The plates retain their transparency.
No new artwork was generated for the website.

`book-cover.mjs` ports the current `LibroxCoverPalette` title hash, subject-word
classification and cloth colors. `books.css` translates the app's 2:3 boards,
binding crease, inset paper block, restrained shoulder highlight and separate
contact/cast shadows. Suggested titles demonstrate the native engraved
covers. Live catalog results retain the complete supplied jacket; the same
engraved treatment remains behind it if that jacket is absent or fails.
