# Portfolio — Paolo Lancellotti

Design spec for a portfolio site inspired by carlosprado.dev: a fixed,
non-scrollable landing page that is a single infinite horizontal carousel of
project bars, and per-project pages with normal vertical scroll.

## Goals

- Landing page is one screen, no vertical scroll, with 5 vertical image bars
  forming an infinite horizontal carousel driven by trackpad horizontal swipe
  and pointer drag.
- Clicking a bar morphs that image into the hero of the project page (shared
  element transition).
- Project pages are normal scrolling pages: title, hero, meta + intro, then a
  vertical sequence of full-width images and text blocks authored in MDX.
- About and Contact exist as stub routes so the nav never 404s.

## Non-goals

- Custom animated cursor (defer).
- CMS or runtime content editing — content is static MDX in the repo.
- Unit / integration tests — this is a visual portfolio; manual QA only.
- Internationalization, dark mode toggle, analytics — out of scope for v1.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- Framer Motion (carousel drag/momentum + `layoutId` shared-element morph)
- `@next/mdx` + `gray-matter` for project content
- `next/font` with Geist Sans and Geist Mono

## Project structure

```
Portfolio_PaoloLancellotti/
├── app/
│   ├── layout.tsx              # html, fonts, top nav slot, AnimatePresence wrapper
│   ├── page.tsx                # landing (carousel)
│   ├── works/[slug]/page.tsx   # project page (MDX-rendered)
│   ├── about/page.tsx          # stub
│   ├── contact/page.tsx        # stub
│   └── globals.css
├── components/
│   ├── Carousel.tsx            # infinite drag/swipe track
│   ├── CarouselBar.tsx         # one bar (image + hover title overlay)
│   ├── Nav.tsx                 # top nav row (PL / Projects About Contact)
│   ├── LandingFooter.tsx       # name | dashes | active title + "Scroll / Drag"
│   └── ProjectMeta.tsx         # Type / Year / Visit site stack
├── content/works/
│   ├── ubiq.mdx
│   ├── jugaad-events.mdx
│   ├── homy.mdx
│   └── dad-young-ones.mdx
├── lib/
│   ├── works.ts                # readWorks() → Work[] with Coming-soon sentinel
│   └── types.ts
├── public/works/<slug>/...     # per-project image assets
└── docs/superpowers/specs/2026-05-11-portfolio-design.md
```

## Content model

Each project is one MDX file in `content/works/`. Frontmatter:

```yaml
---
title: "UBIQ"
slug: "ubiq"
type: "Web"
year: 2025
visitSite: "https://example.com"   # optional
cover: "/works/ubiq/cover.jpg"
order: 1
---
```

`readWorks()` reads all MDX files at build time, validates frontmatter, sorts
by `order`, and appends a hard-coded sentinel:

```ts
{ slug: null, title: "Coming soon...", cover: "/works/coming-soon.jpg",
  clickable: false }
```

The `coming-soon.jpg` image is user-provided (placeholder OK in dev; ship a
real image before launch). Build fails loud if it's missing, same as any
other cover.

If any MDX is missing a required field or the cover image is missing, the
build fails loudly — we never ship a broken bar.

Initial projects (5 bars): UBIQ, Jugaad Events, Homy, D&AD and Young Ones,
Coming soon...

## Landing carousel

### Visual layout (desktop, ≥1024px)

- `<body>` for `/` has `overflow: hidden; height: 100vh`.
- 5 bars visible. Bar width = `(100vw − 4 × gap) / 5`, gap ≈ 12px.
- Bar height ≈ 70vh, vertically centered.
- Top nav absolute at top (≈24px padding). Landing footer absolute at bottom.

### Mechanics (Framer Motion)

- Render `bars × 3` (15 elements) in a horizontal flex track. The middle copy
  is the "real" one; left and right copies exist only so wrap-around is
  invisible.
- One `motion.div` with `style={{ x }}` slides the track. `trackWidth = 5 ×
  (barWidth + gap)`. The neutral position is `x = -trackWidth` (middle copy
  centered).
- Input:
  - `drag="x"` with `dragMomentum`, `dragElastic: 0.1`.
  - A `wheel` listener on the carousel container reads `e.deltaX` only and
    adds to `x`. `deltaY` is ignored — no vertical-wheel mapping.
- After each input ends (drag end, wheel idle after 120ms debounce), normalize:
  `x.set(((x.get() % trackWidth) + trackWidth) % trackWidth − trackWidth)`.
  Visually identical, but `x` stays bounded so the loop is truly infinite.

### Active project tracking

- The "active" bar is the one in the visual center of the viewport.
- Compute it from `x`: figure out which bar index (mod `bars.length`) sits
  closest to the viewport center given the current `x` offset and the per-bar
  step `barWidth + gap`. Exact formula gets nailed down at implementation
  time — the constraint is just "round to nearest bar, then mod 5".
- Update via `useMotionValueEvent(x, "change", ...)`.
- LandingFooter and the centered dashes read this value.

### Hover state

Each clickable `CarouselBar` shows its project title as a large bold Geist
overlay on hover (opacity + small y translate via Framer). Cursor: pointer.
The "Coming soon..." sentinel has no overlay and keeps the default cursor.

### Mobile / tablet

Same carousel; bar count breakpoints:

- `<640px`: 2 bars visible
- `<1024px`: 3 bars visible
- `≥1024px`: 5 bars visible

Touch drag works because Framer's `drag` already handles pointer events.
`onWheel` is desktop-only.

## Click → project page transition

- Each `CarouselBar` wraps its image in `motion.div` with
  `layoutId={`hero-${slug}`}`.
- On click: `router.push(`/works/${slug}`)`. The project page's hero `<Image>`
  is also wrapped in `motion.div` with the same `layoutId`.
- `app/layout.tsx` wraps `{children}` in `<AnimatePresence mode="popLayout">`
  so Framer can interpolate position/size between the bar and the hero across
  the route change.
- If `prefers-reduced-motion`, skip the morph and navigate immediately.

## Project page (`/works/[slug]`)

Normal vertical scroll. Top to bottom:

1. **Top nav** — `Nav.tsx`. `PL` logo links to `/`. Right side: Projects,
   About, Contact.
2. **Title block** — project title in huge bold italic Geist (≈ `text-8xl
   font-bold italic`), left-aligned, generous top padding.
3. **Hero image** — full-width, ≈70vh. The `layoutId` target. From frontmatter
   `cover`.
4. **Meta + description row** — two columns:
   - Left ≈25% width: `ProjectMeta` (Type / Year / Visit site) stacked. Each
     row is a small label + value pair. The "Visit site" row always renders
     the text "Visit site" — as a link in normal color if `visitSite` is set,
     or as plain gray text (no link, no underline) if it isn't.
   - Right ≈75% width: the opening paragraph from the MDX body.
5. **Body** — the rest of the MDX renders below: alternating full-width images
   and text blocks, authored in the .mdx file in whatever order the writer
   chooses. Custom MDX components style `<img>` (full-width, no rounding) and
   `<p>` (large Geist, `max-w-prose`, generous vertical spacing).

`generateStaticParams()` pre-renders one route per MDX slug. Unknown slug →
`notFound()`. The `Coming soon` sentinel has `slug: null` so no route exists.

## Navigation, footer, copy

- **Top nav (both layouts)**: `{LOGO}` placeholder on left (default `PL`),
  links `Projects` / `About` / `Contact` on right. No availability tag.
  Active link gets a subtle weight bump.
- **Landing footer (only `/`)**: left `{NAME}` / `{ROLE}` placeholders; center
  5 short dashes with the active one filled/longer; right active project
  title (bold) above "Scroll / Drag" caption in Geist Mono.
- All copy strings live in a single `lib/copy.ts` file so they can be swapped
  before launch.

## Stubs

- `/about/page.tsx`: nav + centered `<p>About page — coming soon.</p>`.
- `/contact/page.tsx`: nav + centered `<p>Contact page — coming soon.</p>`.

These exist only so the top nav doesn't 404.

## Error handling

- `readWorks()` throws at build time on:
  - missing required frontmatter fields,
  - missing `cover` image on disk,
  - duplicate `slug`,
  - duplicate `order`.
- Route-level: unknown `/works/<slug>` → Next's `notFound()`.
- Image loading errors: Next/Image's default fallback. No custom UI.
- No runtime error states beyond Next defaults.

## Testing

No automated tests. Manual checks before each merge:

- Carousel loops smoothly on trackpad horizontal swipe.
- Drag has momentum and rubber-bands at the (non-existent) edge.
- Vertical mouse wheel does nothing on the landing page.
- Hover on a clickable bar shows the title overlay; hover on "Coming soon"
  does not.
- Click → hero morph runs end to end without a flash.
- Project pages scroll vertically and lay out as described.
- About and Contact return 200, not 404.
- Mobile (`<640px`) shows 2 bars and responds to touch swipe.
- `prefers-reduced-motion`: no morph, plain navigation.

## Open follow-ups (not in this spec)

- Custom cursor component.
- Fully designed About and Contact pages.
- Per-project case-study layout variants (if MDX flow turns out too rigid).
- Analytics, OG images, sitemap.
