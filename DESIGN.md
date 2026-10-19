---
name: "Librox"
description: "A forest reading studio with cream literary type, restrained coral, and the app in view."
colors:
  studio: "#0b1913"
  studio-ink: "#f2eddf"
  studio-coral: "#e4ab8d"
  studio-focus: "#efac91"
  studio-hover: "#e79a7e"
  bg: "#eee9df"
  paper: "#f8f5ed"
  ink: "#212720"
  muted: "#6a7068"
  line: "#caccc0"
  red: "#c64a36"
  catalog-muted: "#566154"
  catalog-red: "#b13e2c"
typography:
  display:
    fontFamily: "\"Newsreader\", \"Iowan Old Style\", Georgia, serif"
    fontSize: "clamp(64px, 6.4vw, 112px)"
    fontWeight: 400
    lineHeight: 0.97
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "\"Newsreader\", \"Iowan Old Style\", Georgia, serif"
    fontSize: "clamp(50px, 4.4vw, 76px)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.04em"
  closing:
    fontFamily: "\"Newsreader\", \"Iowan Old Style\", Georgia, serif"
    fontSize: "clamp(40px, 4vw, 65px)"
    fontWeight: 400
    lineHeight: 1.04
    letterSpacing: "-0.055em"
  title:
    fontFamily: "\"Manrope\", -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "16px"
    fontWeight: 550
    lineHeight: 1.4
  body:
    fontFamily: "\"Manrope\", -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "\"Manrope\", -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.55
  control:
    fontFamily: "\"Manrope\", -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "11px"
    fontWeight: 650
    lineHeight: 1.55
    letterSpacing: "0.035em"
  navigation:
    fontFamily: "\"Manrope\", -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.55
  search:
    fontFamily: "\"Newsreader\", \"Iowan Old Style\", Georgia, serif"
    fontSize: "clamp(21px, 2.8vw, 32px)"
    fontWeight: 400
    lineHeight: "normal"
  result:
    fontFamily: "\"Newsreader\", \"Iowan Old Style\", Georgia, serif"
    fontSize: "22px"
    fontWeight: 400
    lineHeight: 1.2
rounded:
  flat: "0px"
  mark: "2px"
  reader: "13px"
  mac: "11px"
  playback: "50%"
spacing:
  control-gap: "18px"
  inline-gap: "24px"
  wide-gutter: "36px"
  studio-mobile-gutter: "20px"
components:
  navigation-studio:
    textColor: "#cad2c7"
    typography: "{typography.navigation}"
  button-chapter:
    backgroundColor: "transparent"
    textColor: "#b3c0af"
    typography: "{typography.label}"
    rounded: "{rounded.flat}"
    padding: "12px 0"
  button-chapter-selected:
    backgroundColor: "transparent"
    textColor: "#fff9e9"
    typography: "{typography.label}"
    rounded: "{rounded.flat}"
    padding: "12px 0"
  button-playback:
    backgroundColor: "transparent"
    textColor: "#dce3d5"
    typography: "{typography.control}"
    padding: "12px 0"
  button-preview:
    backgroundColor: "transparent"
    textColor: "#a5b39f"
    rounded: "{rounded.flat}"
    padding: "22px 0"
  button-preview-selected:
    backgroundColor: "transparent"
    textColor: "#f4ecda"
    rounded: "{rounded.flat}"
    padding: "22px 0"
  card-plus:
    textColor: "#f1e8d8"
    rounded: "{rounded.flat}"
    padding: "30px 34px"
  input-catalog:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.search}"
    padding: "18px 0"
  chip-source:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.flat}"
    padding: "9px 14px"
  chip-source-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.bg}"
    typography: "{typography.label}"
    rounded: "{rounded.flat}"
    padding: "9px 14px"
  button-add:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.bg}"
    typography: "{typography.label}"
    padding: "10px 13px"
  button-epub:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
---

# Design System: Librox

## Overview

**Creative North Star: "The Forest Reading Studio"**

Librox places cream literary typography and the app's books inside a dark forest studio. Newsreader supplies the book-like headings; Manrope keeps navigation and controls quiet. Coral appears in italic phrases, fine progress marks and the small bookmark in the wordmark. The result is spacious around the media and compact around the controls.

Depth comes from paper, light, device glass and reflective metal. The homepage expresses this world through an original rendered device film and native app recordings. Books and Plus retain the warm paper context for search and explanation. These are distinct surface expressions of the same reading identity.

This records the active implementation in `index.html`, `experience.css`, `experience.js`, `librox.css`, `books.html` and `plus.html`, including the Plus page's `commerce.css` dependency. The shared base stylesheet contains earlier homepage studies; their unused layouts, colors and ornaments are not this system. The accepted direction is recorded in [the studio direction contract](docs/studio-direction-contract.md). Existing desktop and mobile captures support the visual record; [studio verification](docs/studio-verification.md) states the local-browser, simulator and development-build boundaries.

**Key Characteristics:**

- Forest studio surfaces, cream type and restrained coral emphasis.
- Newsreader headings paired with small, clear Manrope controls.
- Real app imagery contained in its screen, with visible capture or preview labels.
- Soft material depth around media; flat controls and fine dividing rules.
- Compact responsive stages with direct playback controls.

**The Screen Rule.** Keep book artwork inside the Librox screen when it is presented as part of the app.

## Colors

The palette combines a near-black forest studio, warm reading paper and coral accents; the frontmatter is the normative color list. The sidecar's synthesized color strips are display aids, not an additional production tonal scale.

### Primary

- **Studio forest** (`studio`) is the continuous homepage background and footer field. It lets pale pages, glass edges and film lighting carry the visual weight.
- **Reading ink** (`ink`) supplies the paper context's text and selected catalog controls.

### Secondary

- **Studio coral** (`studio-coral`) accents the main headline's italic word. Related warm accents in progress rules and the Plus invitation remain component-specific values rather than a fabricated single accent scale.
- **Bookmark coral** (`red`) appears in the wordmark's bookmark and the shared paper interface.
- **Catalog coral** (`catalog-red`) is the darker Books-page override for emphasis and controls.
- **Studio hover** (`studio-hover`) and **studio focus** (`studio-focus`) identify interactive states against the dark background.

### Neutral

- **Studio cream** (`studio-ink`) carries the homepage's principal text.
- **Warm background** (`bg`) and **paper** (`paper`) support the existing reading and information pages.
- **Muted ink** (`muted`) and **catalog muted ink** (`catalog-muted`) distinguish secondary text in their respective paper contexts.
- **Paper rule** (`line`) separates catalog controls, results and document navigation.

**The Context Rule.** Use the forest palette for the studio and the paper palette for reading and catalog tasks; do not promote a leftover stylesheet value into a new global theme.

## Typography

**Display Font:** Newsreader, with Iowan Old Style and Georgia fallbacks.

**Body Font:** Manrope, with Apple system sans-serif fallbacks.

Both families are served locally as variable fonts. Newsreader has separate normal and italic files. Italics provide emphasis within literary headings; Manrope handles functional information without competing with the app imagery. There is no separate mono face or single mathematical type scale.

### Hierarchy

- **Display:** The main film title uses `display`, with balanced wrapping and normal-weight italic emphasis. At the mobile breakpoint it becomes `clamp(57px, 13vw, 82px)` with unit line height.
- **Headline:** The native showcase uses `headline`. It steps to (54px) at the compact desktop breakpoint and (46px) on mobile, retaining its established tracking.
- **Closing:** The download heading uses `closing` and becomes (44px) on mobile. Its tighter tracking is local to that heading, not the default for all display type.
- **Title:** Native preview names use `title`; the horizontal mobile selectors use (11px) with (1.5) line height.
- **Body:** The base reading UI uses `body`. Studio supporting copy is typically (12–14px); the Plus invitation description is (14px) with (1.7) line height.
- **Label and control:** Chapters and catalog chips use `label`; film playback uses `control`. Capture captions use (11px) with (1.4) line height and remain outside the image. These roles describe information, not decorative heading prefixes.
- **Navigation:** Links use `navigation`. The wordmark is a separate brand treatment: Manrope (700), (14px), with (.17em) tracking; on the homepage it becomes (12px) on mobile.
- **Catalog:** Search uses `search`, results use `result`, and the Books heading uses Newsreader at `clamp(48px, 5.3vw, 82px)` with unit line height.

**The Two Voices Rule.** Use Newsreader for display and reading-led headings, and Manrope for navigation, controls and supporting information.

## Layout

The shared wide container centers content at a maximum of (1370px), with the desktop gutters recorded in the frontmatter. The studio mobile gutter applies at (700px) and below; the paper catalog uses its existing (18px) mobile gutter. The Plus and document shell caps at (1080px), with (28px) internal side padding. These are observed context rules, not a universal spacing scale.

The homepage moves through a full-height film, one native showcase, a download/Plus row and a legal footer. Ordinary page scrolling remains available. The film uses (100svh), a desktop minimum of (720px), and a mobile range of (740–1000px). Above a (2:1) viewport aspect ratio, its height follows the wide film ratio. A portrait source is selected below the (6:5) aspect threshold or at the mobile width breakpoint; the portrait media uses contain sizing with the implemented scale treatment.

The native showcase uses two columns: a narrower text column and a wider media column, with a gap of `clamp(50px, 7vw, 110px)`. Its desktop vertical padding is (110px) above and (90px) below. At (1100px) the gap is (45px) and the stage is (500px) high instead of (540px). On mobile the stage follows the copy, the selectors become three horizontal choices, the stage is (350px) high, and section padding contracts to (68px) above and (58px) below.

The download/Plus row uses a (1.3fr / .7fr) split, becoming one column on mobile. The invitation itself changes from a vertical stack to a compact two-column title/price row. Books uses a ruled search field and result list; mobile result actions move beneath their metadata. Full Plus details use the existing paper surface and collapse to a single column at the mobile breakpoint.

**The Caption Clearance Rule.** Keep capture captions outside the media bounds and preserve the reserved caption strip.

The native panels reserve (44px) below their media. Frame widths are limited by both stage height and media ratio, so a wider viewport does not push footage through its caption. The listening device scales down within this same stage instead of creating a second tall mobile section.

## Elevation & Depth

The system combines real material lighting inside the imagery with soft shadows around the media frames. Fine translucent rules separate interface groups. Navigation uses a dark-to-transparent overlay so it stays legible over bright paper in the film. During the macro passage, a dark gradient covers the lower (30%) of the film to preserve contrast for the controls over close paper detail. The final gradients and shadow values live in the sidecar snippets. The Plus invitation uses a subtle tonal gradient and an inset highlight, with square outer corners.

### Shadow Vocabulary

- **Reader frame:** A fine pale edge with two diffuse black shadows separates the native reading spread from the studio.
- **Mac frame:** One diffuse shadow grounds the native desktop capture.
- **Invitation inset:** A faint top highlight gives the compact Plus link a quiet material edge.
- **Catalog cover:** A small diffuse shadow supports the book thumbnail as an object.

**The Quiet Frame Rule.** Let app imagery carry the physical depth; keep surrounding controls flat.

The retained full Plus card has a book-like spine and layered offset shadows. That existing treatment is not a reusable shadow token for new surfaces; only the soft media and thumbnail shadows are included in the sidecar vocabulary.

## Shapes

Controls, chips, result rows and the compact Plus invitation use straight edges and fine rules. Rounded shapes are tied to objects: the wordmark's small outlined book, the native reader and Mac frames, and the circular playback icon. Their observed radii are recorded in the frontmatter; there is no generic rounded-card family.

The listening device keeps its source bezel proportions. Its screen mask follows the device's curved corners, while the image stays inside the bezel. Inline SVG strokes supply the homepage's arrows; filled SVG paths supply play and pause.

## Components

### Navigation

The wordmark, centered links and quiet underlined download link sit over the film. The desktop header is (82px) high and the mobile header is (72px). The final dark gradient protects navigation contrast during close paper shots. At the mobile breakpoint the homepage hides the center link group and keeps the wordmark and download action; the wrapping footer still provides the page links. Paper subpages retain their own document navigation.

### Buttons

Film chapters are flat text buttons with a fine baseline and a coral progress line. The selected chapter has warmer, brighter text. Playback pairs an inline SVG with a text label and keeps a minimum hit height of (44px); sound is off until explicitly enabled. Hover brightens the playback text. The homepage keyboard outline uses the studio focus color with a (2px) stroke and (6px) offset. With the film play/pause button focused, ArrowLeft and ArrowRight seek backward or forward by (5 seconds) once video metadata is available, clamped to the clip bounds. The button exposes these keys through `aria-keyshortcuts` and explains them in its title; seeking preserves the current play/pause state.

The App Store action uses the existing badge asset rather than a newly drawn button; it is (150px) wide in the download row. Catalog result actions retain the dark rectangular Add to Librox link and the quieter underlined EPUB link. No extra hover movement is added to those result links.

### Native preview selector

The desktop selector is a ruled vertical list. Only the active row shows its supporting sentence and arrow; the progress line follows the active media time. On mobile the row labels become three compact columns and supporting sentences are hidden. Selection resets the chosen clip to the beginning, pauses inactive videos and marks inactive panels inert.

### Cards / Containers

The homepage Plus invitation is a single linked rectangle with the frontmatter padding, a subtle green gradient and a fine translucent border. Newsreader carries its name and annual price; Manrope carries the description and planned-membership link. On mobile padding becomes (26px), the price becomes (32px), and the content forms a compact grid. Its arrow shifts slightly on hover; the whole card receives the shared keyboard focus ring.

The full Plus page is an existing book-like explanation surface. Its proposed status, price note and benefits remain readable content, but its legacy decoration is not the homepage container pattern.

### Inputs / Fields

The Books search field is a transparent, serif input on the paper background, with a ruled lower edge and a separate submit button. Placeholder text uses the Books muted color. The implemented keyboard state adds a (2px) coral outline inset by (4px); its exact color and CSS are in the sidecar. This field has no separate error or disabled visual variant in the inspected source. Search status and fallback links appear below the field.

### Chips

Catalog source choices use flat outlined rectangles. The selected choice reverses reading ink and background; hover changes the outline to catalog coral. Selection is exposed with radio semantics and the normal paper-context keyboard ring.

### Film and motion

The original film is a (22-second) local rendered study with separate wide and portrait compositions. Live HTML headings give way to the detail view, with the detail title hidden during the macro passage. On wide layouts, the subtitle fades out during listening so the tilted device clears the text. The poster remains visible until playback is ready and returns if the film errors. Hardware orientation and proportions follow the linked Apple views in `docs/duo-hardware-reference.md`; the geometry remains an original visual model.

The native stage cycles through reading, the listening design preview and the Mac development capture. Video duration drives reading and Mac progress; the static listening preview has its own dwell. The sidecar records the actual fade, translation and interaction timings. Soft light gradients support the physical subject; they are part of this world.

**The Playback Choice Rule.** Preserve pause, keyboard seeking, opt-in sound, visible-state playback and explicit play under reduced motion.

Both media sequences stop when the page is hidden or their stage is offscreen. The reduced-motion path disables automatic playback and CSS transitions; a visitor can still explicitly start a demonstration. Capture labels distinguish native development recordings and design previews. The local verification record does not establish physical-device Safari, VoiceOver or OS reduced-motion acceptance.

## Do's and Don'ts

### Do:

- **Do** keep app artwork in its screen and retain the capture or design-preview label.
- **Do** pair Newsreader headings with Manrope controls and supporting information.
- **Do** use the studio and paper contexts deliberately instead of mixing their defaults.
- **Do** reserve space below native footage for captions at every supported width.
- **Do** retain direct playback controls, five-second keyboard seeking, opt-in sound and a visible keyboard focus state.
- **Do** use inline SVG for new interface arrows and playback icons, following the current homepage.

### Don't:

- **Don't** turn unused earlier homepage styles into reusable system tokens.
- **Don't** use decorative eyebrows, text-glyph interface icons or hard offset card shadows as new house rules.
- **Don't** let headline overlays or captions obscure the app's paper detail.
- **Don't** present a rendered device study or labeled design preview as a capture of shipping hardware or verified production UI.
- **Don't** inherit a long pinned or scroll-locked sequence when extending the compact studio surface.

Not canonized or repaired: the retained Books/Plus decorative eyebrows and text-glyph arrows, and the full Plus card's hard offset shadows, remain inherited subpage drift outside this documentation pass. The corrected catalog keyboard outline, final studio header and macro gradients, and film keyboard seeking are included.
