---
name: "Librox"
description: "The app's book, paper, ink and bookmark language, carried through the web."
colors:
  bg: "#f7f6f2"
  paper: "#fffefa"
  ink: "#252825"
  muted: "#666b63"
  line: "#dcded6"
  red: "#c64433"
  night: "#222222"
  ivory: "#eeeede"
  night-accent: "#f28a70"
  studio: "#0b1914"
  studio-soft: "#c2c9bd"
typography:
  display:
    fontFamily: '"Source Serif 4", Georgia, serif'
    fontWeight: 600
    fontSize: "clamp(44px, 4.8vw, 68px)"
    lineHeight: 1.06
    letterSpacing: "-0.014em"
  headline:
    fontFamily: '"Source Serif 4", Georgia, serif'
    fontWeight: 600
    fontSize: "28px"
    lineHeight: 1.2
    letterSpacing: "-0.014em"
  brand:
    fontFamily: '"Source Serif 4", Georgia, serif'
    fontWeight: 600
    fontSize: "26px"
    lineHeight: 1
    letterSpacing: "-0.014em"
  body:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  navigation:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.6
rounded:
  control: "12px"
  compact: "8px"
  sheet: "16px"
  circular: "50%"
---

# Librox visual language

## Authority

The native app is the reference: `LibroxTheme.swift`, `LibrosStyle.swift`,
`LibroxBookView.swift` and the primary AppIcon asset in the Libros checkout.
The website should be recognizable as that same reading product.

The current correction follows the user's distinction: reuse the **3D book
design**, preserving each catalog edition's original artwork. It also corrects
the unrelated website logo and the decorative lettering's separate identity.

## Identity

Use the actual red bookmark, folded ivory page and green cloth app icon.
`assets/librox-app-icon.png`, the touch icon and `favicon.png` are resized
copies of `AppIcon.appiconset/icon-librox-bookmark-1024.png`. Do not recreate
an L monogram or substitute an alternate icon. The adjacent name is `Librox`,
in the same serif used for headings.

## Type roles

- Source Serif 4 at 600: headings, book titles, the name, and dimensional film
  lettering. Its upright, sturdy forms are the web counterpart to the native
  system serif. It is not claimed to be Apple's New York font.
- System sans: controls, navigation, descriptions, status and metadata. This
  follows the app's distinction between book language and interface language.
- Display tracking is -0.014em, matching the native type role. Avoid the previous
  tight -0.04em setting and isolated ornamental italic headlines.
- The dimensional glyphs are generated from the **same** self-hosted font at
  the **same** 600 weight with `scripts/scene-font.py`.

Fonts are self-hosted. Source Serif 4's OFL is in `assets/fonts`.

## Color and surfaces

Paper, ink, ivory and vermilion come from the native tokens. Small vermilion
labels use #c64433, one RGB step darker for 4.54:1 contrast on paper. The app's neutral
night surface is the dark subpage background. E-ink, Paper and Dark remain
available on catalog and information pages.

The homepage is one continuous forest atmosphere from the approved app films,
including the download area and footer. This is the listening/book atmosphere,
not a second general interface palette. The same ivory, accent, serif, icon,
controls and spacing connect it with the neutral app surfaces. Homepage theme
controls are omitted because its cinematography has a fixed lighting setup.

## Material and depth

An edition's original jacket stays intact, fitted in full within the board.
CSS 3D surfaces form front, back, spine, fore-edge, top and bottom page blocks.
The app's narrow binding crease, shoulder highlight, warm recessed paper and
offset contact/cast shadows supply the material treatment. Do not generate
replacement illustrations or place artwork over a jacket. Missing artwork gets
a plain cloth board with title and author, not a fictional edition.

The existing native screen footage and device films remain the scene content.
Typography is matte ivory paper or dark ink over bright pages, with a shallow
edge and the film's real depth occlusion. It keeps a stable baseline: motion
comes from the camera and chapter transition, not independent sine-wave sway.

## Controls and layout

Shared navigation has an 80px desktop height and 76px phone height. Primary
buttons and menus use the 12px control radius; compact inset search buttons
use 8px. Hit targets remain at least 44px. Use the established Phosphor icons.

The Books arrival is a search and three suggested searches. Results show the
actual catalog editions with title, author, source and import/download actions.
The original jackets on the arrival shelf are local copies for reliable loading;
live results use the full OPDS cover where available.

## Motion and accessibility

Cover hover exposes the paper depth with a 280ms interruptible transition,
only for fine pointers. Press feedback is 120ms. Reduced motion preserves a
static angled book and removes hover/press movement. Keyboard interactions
remain immediate. Existing film playback, mute, chapter and keyboard controls
remain intact. All information remains outside decorative, aria-hidden art.

## Product truth

Routes, store destination, policy wording and contact address are preserved.
Plus has a Free/Plus comparison, three USD launch prices, and a coming-soon status.
The pricing ledger distinguishes monthly/yearly renewal from a one-time Lifetime
purchase. Its paper surface, serif numerals, quiet rules and bookmark accent share
the reader's hierarchy. Prices are informative until purchases are publicly available.
No additional device footage, app release or native import acceptance is implied.

See `docs/brand-language-correction.md` for review and verification evidence.
