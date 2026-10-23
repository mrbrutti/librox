# Catalog and shared craft pass — October 22, 2026

## Direction and source

The Books page now uses the same cover language as the native app. Its visual
authority is `LibroxBookView.swift`, `LibroxCoverPalette`, and the app's actual
CoverOcean / CoverBotanical illustrations, inspected in the current Libros
checkout. The illustrations are reused, not regenerated. Supplied catalog
jackets remain complete and retain their original aspect ratio within a 2:3
board. The native illustrated cover is used when artwork is absent or fails.

The initial three books are explicitly suggested searches, not fabricated
catalog results. Selecting one runs the existing real catalog search. Public
Plus status, purchase wording, privacy policy, contact address and App Store
destination have not changed.

## Emil review

| Before | After | Why |
| --- | --- | --- |
| Small flat cover thumbnails | Larger cloth-bound books with an inset paper edge, spine crease, shoulder light and separate contact/cast shadows | Match the app's physical book language |
| Empty search arrival with two text suggestions | A native illustrated shelf for Pride and Prejudice, Moby-Dick and Walden | Let visitors recognize a book and begin a real search |
| Initial-letter artwork fallback | The app's engraved plate, deterministic cloth palette, title and author | Missing remote images remain useful and recognizable |
| A tall heading and full-width search stacked above the books | Heading beside the search on desktop; compact stacked flow on phones | Bring the actual books into view sooner |
| Long words breaking inside tiny covers | Lettering scales with the longest word; full titles remain below the covers | Preserve the title's shape and readability |
| 500–650 ms film caption transitions | 240 ms opacity / 280 ms movement, four-pixel travel | Keep captions connected to the film's chapter changes |
| Generic easing and incomplete press feedback | Shared exponential ease-out, 140–260 ms interactions, fine-pointer-only cover lift | Make actions immediate and interruptible |
| Animated transitions during keyboard navigation | Keyboard modality disables CSS transitions; keyboard searches skip result entrances | Keep repeated keyboard actions immediate |
| Normal-only Newsreader font declaration | The real self-hosted italic face, optical sizing and less cramped heading tracking | Improve the literary typography without changing the font family |
| Different top-level navigation on different subpages | The app / Plus / Find books / Privacy throughout | Keep orientation stable; Terms and Support remain in the footer |
| Search behavior included on every page | A Books-only bundle and stylesheet | Reduce shared code while keeping catalog concerns together |
| An older timed-out request could finish after a newer one | Completion checks request identity; clearing the query invalidates the request | Prevent stale statuses or recovery links replacing the current search |

The only new decorative movement is a restrained hover lift of a book and its
arrow. Result entry is a short, bounded stagger after pointer interaction.
There is no endless shelf animation, intro loader or scroll locking. Existing
reduced-motion rules remove the movement. The approved films and scene meshes
are unchanged.

## Impeccable pass

Used the context loader once for `books.html`, the polish playbook and craft
floor, then one manual detector scan. The scan returned **85 advisories and no
non-advisory findings**: 28 colors, 18 radii, 39 type sizes.

These advisories compare against the older DESIGN.md frontmatter. The current
shared paper/dark palette, button radii and responsive type sizes predate this
pass. The new narrow material exceptions are the native cloth palette,
ivory lettering, recessed paper colors, asymmetric board corners and small
book-proportional lettering. They describe books, not new generic interface
tokens. No global detector suppression or unrelated design-system rewrite was
introduced.

Visual inspection found and corrected whole-word fitting on phone covers,
excess space above the shelf, visible boundaries on the reflected-light field,
unnecessary preserve-3d compositing and implicit layer order that could hide
lettering after theme changes, and horizontal overflow from decorative light
beyond the last cover. Artwork, type, jacket and material lighting now have
explicit isolated layer order; the final paper-theme check retained all text.

## Verification

- Built committed bundles and synchronized homepage inline CSS successfully.
- Checked syntax, whitespace, all six HTML pages and 128 local asset/fragment
  references; no missing targets or duplicate IDs.
- Security checks cover hostile catalog titles/authors, attribute escaping,
  non-HTTPS URLs and URLs containing credentials at the new cover HTML boundary.
- Browser inspected the initial shelf and live Gutenberg / Standard Ebooks
  results at desktop and 390 × 844 phone sizes. Tested a long real result title,
  empty search, no matches, partial-catalog recovery links, query reset,
  radio-group arrow keys, mobile menu and Escape dismissal.
- At the final phone results check: 390 px document width for a 390 px viewport,
  three real Gutenberg results, zero broken loaded images.
- At 820 × 1180, the tablet shelf remained within the 820 px document width;
  all three illustrations and their full metadata remained visible.
- Verified dark and paper surfaces. Shared body, muted text and accent contrasts
  are at least 4.82:1 on paper and 7.43:1 in dark mode.
- Homepage native footage and spatial lettering still rendered; its browser
  console had no errors or warnings in the observed check. Plus mobile layout
  retained its feature-only content and working navigation.

This is browser verification on the development Mac, including responsive
viewport sizes. It is not physical iPhone/iPad testing or an exhaustive Safari
compositing audit. Reduced motion is source-checked. Native app import handoff
and EPUB downloads were preserved and inspected as links, not executed. The
external catalogs can still be unavailable; direct search links remain the
recovery path. No new Lighthouse score is claimed for this revision.
