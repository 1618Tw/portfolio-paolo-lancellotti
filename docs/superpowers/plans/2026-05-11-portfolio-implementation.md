# Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Paolo Lancellotti's portfolio site: a fixed landing page that is an infinite horizontal carousel of project bars, plus per-project MDX-rendered pages with vertical scroll.

**Architecture:** Next.js 16 App Router. Landing is one screen, `overflow: hidden` on body. A `motion.div` track of (bars × 3) is dragged/swiped horizontally with `x` normalized modulo `trackWidth` after each input. Clicked bars morph into the project page hero via Framer Motion `layoutId`. Project content is authored as MDX in `content/works/` and compiled at request time with `next-mdx-remote/rsc`. About/Contact are stubs.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind v4, Framer Motion, `next-mdx-remote`, `gray-matter`, Geist Sans / Geist Mono via `next/font`.

**Testing convention:** This is a visual portfolio; the spec explicitly excludes automated tests. In place of TDD steps, each task has a **manual verification** step (browser check or build check) before the commit step. Keep these — they're how we catch regressions.

**Spec:** `docs/superpowers/specs/2026-05-11-portfolio-design.md`

---

## File map

```
Portfolio_PaoloLancellotti/
├── app/
│   ├── layout.tsx              # html, fonts, AnimatePresence wrapper, Nav slot
│   ├── page.tsx                # landing: body overflow:hidden, Carousel
│   ├── works/[slug]/page.tsx   # project page (MDX rendered)
│   ├── about/page.tsx          # stub
│   ├── contact/page.tsx        # stub
│   └── globals.css             # tailwind v4 + base styles
├── components/
│   ├── Nav.tsx                 # top nav, used in layout
│   ├── Carousel.tsx            # infinite drag/swipe track
│   ├── CarouselBar.tsx         # one bar (Image + hover overlay + layoutId)
│   ├── LandingFooter.tsx       # name / dashes / active title + "Scroll / Drag"
│   └── ProjectMeta.tsx         # Type / Year / Visit site stack
├── content/works/
│   ├── ubiq.mdx
│   ├── jugaad-events.mdx
│   ├── homy.mdx
│   └── dad-young-ones.mdx
├── lib/
│   ├── types.ts                # Work type
│   ├── works.ts                # readWorks() — load + validate + sort + sentinel
│   └── copy.ts                 # LOGO/NAME/ROLE placeholders + nav links
├── public/works/
│   ├── coming-soon.jpg
│   ├── ubiq/cover.jpg
│   ├── jugaad-events/cover.jpg
│   ├── homy/cover.jpg
│   └── dad-young-ones/cover.jpg
├── next.config.ts
├── tailwind.config.ts          # tailwind v4 uses CSS-first, but keep for paths
├── tsconfig.json
└── package.json
```

---

## Task 1: Bootstrap project + git

**Files:**
- Create: `/Users/paololancellotti/Portfolio_PaoloLancellotti/package.json` (via create-next-app)
- Create: `.gitignore` (created by Next), confirm includes `node_modules`, `.next`

- [ ] **Step 1: Initialize Next.js app in place**

The directory already contains a `docs/` folder and the screenshots. `create-next-app` refuses non-empty dirs, so initialize in a temp folder and move the files in.

```bash
cd /Users/paololancellotti
npx create-next-app@latest portfolio-tmp --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm --no-turbopack
```

Accept defaults. Then merge:

```bash
cd /Users/paololancellotti
# Move generated files into the real dir, except the things that already exist
shopt -s dotglob
for f in portfolio-tmp/*; do
  name=$(basename "$f")
  if [ ! -e "Portfolio_PaoloLancellotti/$name" ]; then
    mv "$f" "Portfolio_PaoloLancellotti/$name"
  fi
done
rmdir portfolio-tmp || true
cd Portfolio_PaoloLancellotti
```

- [ ] **Step 2: Initialize git and ignore screenshots**

```bash
cd /Users/paololancellotti/Portfolio_PaoloLancellotti
git init
```

Append to `.gitignore`:

```
# Local reference screenshots (not part of the site)
/Screenshot*.png
```

- [ ] **Step 3: Verify dev server boots**

```bash
npm run dev
```

Expected: server starts on http://localhost:3000, default Next welcome page renders. Stop the server (Ctrl+C).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: bootstrap next 16 app with tailwind and typescript"
```

---

## Task 2: Install runtime deps

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install Framer Motion, MDX, gray-matter**

```bash
npm install framer-motion next-mdx-remote gray-matter
```

- [ ] **Step 2: Verify versions installed**

```bash
npm ls framer-motion next-mdx-remote gray-matter
```

Expected: all three printed with concrete versions, no `UNMET DEPENDENCY` warnings.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add framer-motion, next-mdx-remote, gray-matter"
```

---

## Task 3: Geist fonts + globals + root layout shell

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Replace `app/layout.tsx` with Geist fonts + clean shell**

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Paolo Lancellotti — Portfolio",
  description: "Selected works by Paolo Lancellotti.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans bg-white text-black antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Replace `app/globals.css` with Tailwind v4 base**

```css
@import "tailwindcss";

@theme {
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

html, body { margin: 0; padding: 0; }
body { font-family: var(--font-sans), system-ui, sans-serif; }
```

- [ ] **Step 3: Verify in browser**

```bash
npm run dev
```

Open http://localhost:3000. Page renders without errors. Inspect — body should have `font-sans` set to Geist. Stop server.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx app/globals.css
git commit -m "feat: wire geist fonts and tailwind v4 base"
```

---

## Task 4: Types and copy constants

**Files:**
- Create: `lib/types.ts`
- Create: `lib/copy.ts`

- [ ] **Step 1: Create `lib/types.ts`**

```ts
export type Work = {
  slug: string;
  title: string;
  type: string;
  year: number;
  visitSite?: string;
  cover: string;
  order: number;
  body: string;
  clickable: true;
};

export type ComingSoonSentinel = {
  slug: null;
  title: string;
  cover: string;
  clickable: false;
};

export type CarouselItem = Work | ComingSoonSentinel;
```

- [ ] **Step 2: Create `lib/copy.ts`**

```ts
export const COPY = {
  logo: "PL",
  name: "Paolo Lancellotti",
  role: "Creative Developer",
  scrollHint: "Scroll / Drag",
  comingSoonTitle: "Coming soon...",
  comingSoonCover: "/works/coming-soon.jpg",
  nav: [
    { label: "Projects", href: "/" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ] as const,
};
```

- [ ] **Step 3: Commit**

```bash
git add lib/types.ts lib/copy.ts
git commit -m "feat: add Work type and copy constants"
```

---

## Task 5: Content loader (`readWorks`)

**Files:**
- Create: `lib/works.ts`

- [ ] **Step 1: Implement `readWorks()`**

```ts
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { COPY } from "./copy";
import type { CarouselItem, Work } from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content", "works");
const PUBLIC_DIR = path.join(process.cwd(), "public");

function readOneWork(filename: string): Work {
  const filePath = path.join(CONTENT_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  const required = ["title", "slug", "type", "year", "cover", "order"] as const;
  for (const key of required) {
    if (data[key] === undefined || data[key] === null || data[key] === "") {
      throw new Error(`content/works/${filename}: missing frontmatter '${key}'`);
    }
  }

  const coverFsPath = path.join(PUBLIC_DIR, data.cover.replace(/^\//, ""));
  if (!fs.existsSync(coverFsPath)) {
    throw new Error(`content/works/${filename}: cover image not found at ${data.cover}`);
  }

  return {
    slug: String(data.slug),
    title: String(data.title),
    type: String(data.type),
    year: Number(data.year),
    visitSite: data.visitSite ? String(data.visitSite) : undefined,
    cover: String(data.cover),
    order: Number(data.order),
    body: content,
    clickable: true,
  };
}

export function readWorks(): Work[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx"));
  const works = files.map(readOneWork).sort((a, b) => a.order - b.order);

  const slugs = new Set<string>();
  const orders = new Set<number>();
  for (const w of works) {
    if (slugs.has(w.slug)) throw new Error(`duplicate slug: ${w.slug}`);
    if (orders.has(w.order)) throw new Error(`duplicate order: ${w.order}`);
    slugs.add(w.slug);
    orders.add(w.order);
  }

  return works;
}

export function readCarouselItems(): CarouselItem[] {
  const works = readWorks();
  const comingSoonFsPath = path.join(PUBLIC_DIR, COPY.comingSoonCover.replace(/^\//, ""));
  if (!fs.existsSync(comingSoonFsPath)) {
    throw new Error(`coming-soon cover not found at ${COPY.comingSoonCover}`);
  }
  return [
    ...works,
    { slug: null, title: COPY.comingSoonTitle, cover: COPY.comingSoonCover, clickable: false },
  ];
}

export function findWork(slug: string): Work | null {
  return readWorks().find((w) => w.slug === slug) ?? null;
}
```

- [ ] **Step 2: Type-check passes**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/works.ts
git commit -m "feat: add readWorks content loader with validation"
```

---

## Task 6: Seed placeholder images and MDX content

**Files:**
- Create: `public/works/coming-soon.jpg`
- Create: `public/works/{ubiq,jugaad-events,homy,dad-young-ones}/cover.jpg`
- Create: `content/works/{ubiq,jugaad-events,homy,dad-young-ones}.mdx`

- [ ] **Step 1: Make image directories and drop placeholder covers**

```bash
mkdir -p public/works/ubiq public/works/jugaad-events public/works/homy public/works/dad-young-ones
```

For dev, copy any local JPG into each path. If you have nothing, generate a 1200×1600 solid-color jpg with ImageMagick:

```bash
for s in coming-soon ubiq/cover jugaad-events/cover homy/cover dad-young-ones/cover; do
  mkdir -p "public/works/$(dirname $s)" 2>/dev/null || true
  magick -size 1200x1600 xc:#222 "public/works/${s}.jpg"
done
```

If `magick` (ImageMagick) is not installed: `brew install imagemagick` first, OR drop any JPG you have into each location with that exact filename.

- [ ] **Step 2: Create `content/works/ubiq.mdx`**

```mdx
---
title: "UBIQ"
slug: "ubiq"
type: "Web"
year: 2025
cover: "/works/ubiq/cover.jpg"
order: 1
---

UBIQ is a short opening paragraph describing this project. Replace this copy when you have the real content.

![UBIQ shot 1](/works/ubiq/cover.jpg)

Follow-up paragraph describing the work, the team, and the approach.

![UBIQ shot 2](/works/ubiq/cover.jpg)
```

- [ ] **Step 3: Create `content/works/jugaad-events.mdx`**

```mdx
---
title: "Jugaad Events"
slug: "jugaad-events"
type: "Web"
year: 2025
cover: "/works/jugaad-events/cover.jpg"
order: 2
---

Jugaad Events opening paragraph placeholder. Replace with real copy.

![Jugaad shot 1](/works/jugaad-events/cover.jpg)

Continuation paragraph placeholder.

![Jugaad shot 2](/works/jugaad-events/cover.jpg)
```

- [ ] **Step 4: Create `content/works/homy.mdx`**

```mdx
---
title: "Homy"
slug: "homy"
type: "Web"
year: 2024
cover: "/works/homy/cover.jpg"
order: 3
---

Homy opening paragraph placeholder.

![Homy shot 1](/works/homy/cover.jpg)

Continuation paragraph placeholder.
```

- [ ] **Step 5: Create `content/works/dad-young-ones.mdx`**

```mdx
---
title: "D&AD and Young Ones"
slug: "dad-young-ones"
type: "Award"
year: 2024
cover: "/works/dad-young-ones/cover.jpg"
order: 4
---

D&AD and Young Ones opening paragraph placeholder.

![D&AD shot 1](/works/dad-young-ones/cover.jpg)
```

- [ ] **Step 6: Verify loader works**

Create a one-off check script (deleted after):

```bash
node -e "process.env.NODE_ENV='development'; (async()=>{const {readCarouselItems}=await import('./lib/works.ts').catch(()=>null); if(!readCarouselItems){console.log('skip: ts not directly runnable; will validate in dev server')}else{console.log(readCarouselItems().map(i=>i.title))}})()" 2>/dev/null || echo "Skipping direct check; validate in dev server next."
```

Actual validation: in Task 7+ we'll see the dev server boot and read content. If frontmatter is wrong, the build will throw with the exact filename.

- [ ] **Step 7: Commit**

```bash
git add public/works content/works
git commit -m "feat: seed placeholder covers and 4 mdx project files"
```

---

## Task 7: Nav component

**Files:**
- Create: `components/Nav.tsx`

- [ ] **Step 1: Create `components/Nav.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { COPY } from "@/lib/copy";

export function Nav() {
  const pathname = usePathname();
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/" || pathname.startsWith("/works/");
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-5 text-sm">
      <Link href="/" className="font-semibold tracking-wide">
        {COPY.logo}
      </Link>
      <nav className="flex items-center gap-8">
        {COPY.nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={isActive(item.href) ? "font-semibold" : "text-neutral-500 hover:text-black"}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
```

- [ ] **Step 2: Wire Nav into root layout**

In `app/layout.tsx`, import and place `<Nav />` just inside `<body>` before `{children}`:

```tsx
import { Nav } from "@/components/Nav";
// ...
<body className={...}>
  <Nav />
  {children}
</body>
```

- [ ] **Step 3: Verify in browser**

```bash
npm run dev
```

Open `/`. Top nav visible with `PL` left, `Projects About Contact` right. `Projects` should be bold (active). Hover other links — color darkens.

- [ ] **Step 4: Commit**

```bash
git add components/Nav.tsx app/layout.tsx
git commit -m "feat: add top Nav with active-route highlight"
```

---

## Task 8: About + Contact stub pages

**Files:**
- Create: `app/about/page.tsx`
- Create: `app/contact/page.tsx`

- [ ] **Step 1: Create `app/about/page.tsx`**

```tsx
export default function AboutPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <p className="text-neutral-500">About page — coming soon.</p>
    </main>
  );
}
```

- [ ] **Step 2: Create `app/contact/page.tsx`**

```tsx
export default function ContactPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <p className="text-neutral-500">Contact page — coming soon.</p>
    </main>
  );
}
```

- [ ] **Step 3: Verify in browser**

With dev server running, visit `/about` and `/contact`. Both render with nav and the placeholder text. No 404. The nav link for the visited section becomes bold.

- [ ] **Step 4: Commit**

```bash
git add app/about app/contact
git commit -m "feat: add About and Contact stub routes"
```

---

## Task 9: CarouselBar component

**Files:**
- Create: `components/CarouselBar.tsx`

- [ ] **Step 1: Create `components/CarouselBar.tsx`**

```tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { CarouselItem } from "@/lib/types";

type Props = {
  item: CarouselItem;
  widthPct: number; // 100 / barsVisible
};

export function CarouselBar({ item, widthPct }: Props) {
  const isClickable = item.clickable;
  const layoutId = isClickable ? `hero-${item.slug}` : undefined;

  const inner = (
    <motion.div
      layoutId={layoutId}
      className="relative h-full w-full overflow-hidden bg-neutral-200"
    >
      <Image
        src={item.cover}
        alt={item.title}
        fill
        sizes={`${widthPct}vw`}
        priority
        className="object-cover pointer-events-none select-none"
        draggable={false}
      />
    </motion.div>
  );

  const overlay = isClickable && (
    <motion.span
      className="pointer-events-none absolute inset-0 z-10 flex items-end justify-center pb-8 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      initial={false}
    >
      <span className="text-3xl font-bold italic drop-shadow-lg">{item.title}</span>
    </motion.span>
  );

  const wrapperClass =
    "group relative flex-shrink-0 h-[70vh] " +
    (isClickable ? "cursor-pointer" : "cursor-default");

  const style = { width: `calc(${widthPct}vw - var(--bar-gap, 12px))` };

  if (isClickable) {
    return (
      <Link href={`/works/${item.slug}`} className={wrapperClass} style={style} draggable={false}>
        {inner}
        {overlay}
      </Link>
    );
  }

  return (
    <div className={wrapperClass} style={style} aria-disabled>
      {inner}
    </div>
  );
}
```

- [ ] **Step 2: Type-check passes**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/CarouselBar.tsx
git commit -m "feat: add CarouselBar with hover overlay and layoutId"
```

---

## Task 10: Carousel component

**Files:**
- Create: `components/Carousel.tsx`

- [ ] **Step 1: Create `components/Carousel.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useMotionValueEvent } from "framer-motion";
import { CarouselBar } from "./CarouselBar";
import type { CarouselItem } from "@/lib/types";

type Props = {
  items: CarouselItem[];
  onActiveChange?: (index: number) => void;
};

function useBarsVisible() {
  const [bars, setBars] = useState(5);
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      if (w < 640) setBars(2);
      else if (w < 1024) setBars(3);
      else setBars(5);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);
  return bars;
}

export function Carousel({ items, onActiveChange }: Props) {
  const barsVisible = useBarsVisible();
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [trackWidth, setTrackWidth] = useState(0);
  const N = items.length;

  // Render items three times so wrap-around is invisible.
  const tripled = [...items, ...items, ...items];

  useEffect(() => {
    const measure = () => {
      const vw = window.innerWidth;
      const barWidth = vw / barsVisible;
      setTrackWidth(barWidth * N);
      // Neutral start: middle copy aligned at viewport start.
      x.set(-barWidth * N);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [N, barsVisible, x]);

  // Wrap modulo trackWidth so x always lands in the middle copy range.
  const normalize = () => {
    if (trackWidth === 0) return;
    const cur = x.get();
    const tw = trackWidth;
    // We want x in [-2*tw, -tw] (middle copy aligned).
    let nx = cur;
    while (nx > -tw) nx -= tw;
    while (nx < -2 * tw) nx += tw;
    x.set(nx);
  };

  // Active index from x.
  useMotionValueEvent(x, "change", (latest) => {
    if (trackWidth === 0 || !onActiveChange) return;
    const barWidth = trackWidth / N;
    // Center bar in viewport: bar index where bar center == viewport center.
    const viewportCenter = window.innerWidth / 2;
    // Position of bar i in the track: i*barWidth + x. Bar center: i*barWidth + x + barWidth/2.
    // Solve for closest integer i: i = (viewportCenter - x - barWidth/2) / barWidth.
    const raw = (viewportCenter - latest - barWidth / 2) / barWidth;
    const idx = ((Math.round(raw) % N) + N) % N;
    onActiveChange(idx);
  });

  // Trackpad horizontal wheel.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let wheelTimer: number | null = null;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) < 1) return; // ignore pure vertical
      e.preventDefault();
      x.set(x.get() - e.deltaX);
      if (wheelTimer) window.clearTimeout(wheelTimer);
      wheelTimer = window.setTimeout(() => normalize(), 120);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      if (wheelTimer) window.clearTimeout(wheelTimer);
    };
    // normalize intentionally not in deps — closure captures trackWidth via state read at call time
  }, [x, trackWidth]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-screen overflow-hidden touch-pan-x"
      style={{ ["--bar-gap" as string]: "12px" }}
    >
      <motion.div
        className="absolute top-1/2 left-0 flex h-[70vh] -translate-y-1/2 items-stretch gap-3"
        style={{ x }}
        drag="x"
        dragMomentum
        dragElastic={0.1}
        onDragEnd={normalize}
      >
        {tripled.map((item, i) => (
          <CarouselBar
            key={`${item.slug ?? "coming-soon"}-${i}`}
            item={item}
            widthPct={100 / barsVisible}
          />
        ))}
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check passes**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/Carousel.tsx
git commit -m "feat: add infinite carousel with drag and horizontal-wheel"
```

---

## Task 11: LandingFooter component

**Files:**
- Create: `components/LandingFooter.tsx`

- [ ] **Step 1: Create `components/LandingFooter.tsx`**

```tsx
"use client";

import { COPY } from "@/lib/copy";
import type { CarouselItem } from "@/lib/types";

type Props = {
  items: CarouselItem[];
  activeIndex: number;
};

export function LandingFooter({ items, activeIndex }: Props) {
  const active = items[activeIndex];
  return (
    <footer className="pointer-events-none absolute bottom-0 left-0 right-0 z-30 flex items-end justify-between px-6 pb-6 text-sm">
      <div className="leading-tight">
        <div className="font-medium">{COPY.name}</div>
        <div className="text-neutral-500">{COPY.role}</div>
      </div>

      <div className="flex items-center gap-2">
        {items.map((_, i) => (
          <span
            key={i}
            className={
              "block h-px transition-all " +
              (i === activeIndex ? "w-8 bg-black" : "w-4 bg-neutral-400")
            }
          />
        ))}
      </div>

      <div className="text-right leading-tight">
        <div className="font-bold">{active?.title}</div>
        <div className="font-mono text-xs text-neutral-500">{COPY.scrollHint}</div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/LandingFooter.tsx
git commit -m "feat: add LandingFooter with progress dashes and active title"
```

---

## Task 12: Landing page

**Files:**
- Create: `app/page.tsx`
- Modify: `app/layout.tsx` (move Nav to per-page, OR leave global — see Step 1)

- [ ] **Step 1: Replace `app/page.tsx` with a server entrypoint**

`app/page.tsx` stays a server component so it can read MDX from the filesystem. It hands `items` to a client child that owns the interactive carousel.

```tsx
import { readCarouselItems } from "@/lib/works";
import { LandingClient } from "./LandingClient";

export default function Page() {
  const items = readCarouselItems();
  return <LandingClient items={items} />;
}
```

- [ ] **Step 2: Create `app/LandingClient.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { Carousel } from "@/components/Carousel";
import { LandingFooter } from "@/components/LandingFooter";
import type { CarouselItem } from "@/lib/types";

export function LandingClient({ items }: { items: CarouselItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-white text-black">
      <Carousel items={items} onActiveChange={setActiveIndex} />
      <LandingFooter items={items} activeIndex={activeIndex} />
    </main>
  );
}
```

- [ ] **Step 3: Verify in browser**

```bash
npm run dev
```

Open `/`. Expect:
- 5 bars across the viewport, vertically ≈70vh.
- Top nav and bottom footer visible.
- Two-finger horizontal swipe on trackpad scrolls the bars.
- Pointer drag works.
- Vertical mouse wheel does nothing (body has overflow hidden + we ignore deltaY).
- Hover on first 4 bars shows the bold title overlay; the 5th ("Coming soon...") does not.
- Bottom-right title updates as the centered bar changes.
- Click on a clickable bar navigates to `/works/<slug>` (page may 404 until Task 13 — that's expected).

Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx app/LandingClient.tsx
git commit -m "feat: wire landing page with carousel and footer"
```

---

## Task 13: ProjectMeta component

**Files:**
- Create: `components/ProjectMeta.tsx`

- [ ] **Step 1: Create `components/ProjectMeta.tsx`**

```tsx
import type { Work } from "@/lib/types";

export function ProjectMeta({ work }: { work: Work }) {
  const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="grid grid-cols-[80px_1fr] gap-4 py-1 text-sm">
      <dt className="text-neutral-500">{label}</dt>
      <dd>{value}</dd>
    </div>
  );

  const visit = work.visitSite ? (
    <a
      href={work.visitSite}
      target="_blank"
      rel="noreferrer"
      className="underline-offset-2 hover:underline"
    >
      Visit site
    </a>
  ) : (
    <span className="text-neutral-300">Visit site</span>
  );

  return (
    <dl className="font-mono">
      <Row label="Type" value={work.type} />
      <Row label="Year" value={String(work.year)} />
      <Row label="" value={visit} />
    </dl>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/ProjectMeta.tsx
git commit -m "feat: add ProjectMeta component"
```

---

## Task 14: Project page route

**Files:**
- Create: `app/works/[slug]/page.tsx`

- [ ] **Step 1: Create `app/works/[slug]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { readWorks, findWork } from "@/lib/works";
import { ProjectMeta } from "@/components/ProjectMeta";
import { ProjectHero } from "./ProjectHero";

export async function generateStaticParams() {
  return readWorks().map((w) => ({ slug: w.slug }));
}

type Params = Promise<{ slug: string }>;

export default async function ProjectPage({ params }: { params: Params }) {
  const { slug } = await params;
  const work = findWork(slug);
  if (!work) notFound();

  // Split MDX body: opening paragraph (everything before the first blank line)
  // becomes the intro, the rest is the body.
  const [intro, ...rest] = work.body.split(/\n\s*\n/);
  const bodyRest = rest.join("\n\n");

  return (
    <main className="min-h-screen w-full bg-white text-black">
      <section className="px-6 pt-28 pb-10">
        <h1 className="text-7xl font-bold italic leading-none md:text-8xl">{work.title}</h1>
      </section>

      <ProjectHero slug={work.slug} cover={work.cover} alt={work.title} />

      <section className="grid grid-cols-1 gap-8 px-6 py-12 md:grid-cols-[25%_1fr] md:gap-16">
        <ProjectMeta work={work} />
        <div className="prose max-w-prose text-xl leading-relaxed">
          <MDXRemote source={intro} />
        </div>
      </section>

      <section className="prose mx-auto max-w-prose px-6 pb-32 text-xl leading-relaxed [&_img]:my-12 [&_img]:w-full [&_p]:my-8">
        <MDXRemote source={bodyRest} />
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Create `app/works/[slug]/ProjectHero.tsx`**

```tsx
"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function ProjectHero({
  slug,
  cover,
  alt,
}: {
  slug: string;
  cover: string;
  alt: string;
}) {
  return (
    <motion.div layoutId={`hero-${slug}`} className="relative h-[70vh] w-full overflow-hidden">
      <Image src={cover} alt={alt} fill priority sizes="100vw" className="object-cover" />
    </motion.div>
  );
}
```

- [ ] **Step 3: Verify in browser**

```bash
npm run dev
```

From `/`, click the UBIQ bar. Expect:
- Navigation to `/works/ubiq`.
- Title, hero image, meta + intro side-by-side, then more body below.
- Page scrolls vertically normally.
- Nav still works; clicking `PL` returns home.

Visit a bogus URL `/works/not-real`. Expect Next's 404 page.

Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add app/works
git commit -m "feat: add dynamic project page with mdx rendering"
```

---

## Task 15: AnimatePresence + reduced motion

**Files:**
- Modify: `app/layout.tsx`
- Create: `components/MotionShell.tsx`

- [ ] **Step 1: Create `components/MotionShell.tsx`**

```tsx
"use client";

import { AnimatePresence, MotionConfig } from "framer-motion";
import { usePathname } from "next/navigation";

export function MotionShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="popLayout" initial={false}>
        <div key={pathname} className="contents">
          {children}
        </div>
      </AnimatePresence>
    </MotionConfig>
  );
}
```

- [ ] **Step 2: Wrap children in `app/layout.tsx`**

Update layout so its body looks like:

```tsx
<body className={`${geistSans.variable} ${geistMono.variable} font-sans bg-white text-black antialiased`}>
  <Nav />
  <MotionShell>{children}</MotionShell>
</body>
```

Import `MotionShell` at the top.

- [ ] **Step 3: Verify the morph in browser**

```bash
npm run dev
```

From `/`, click the UBIQ bar. The hero image should appear to grow from the bar's position into the page hero (Framer interpolates the `layoutId` match). The exact polish depends on layout — what matters is no flash/jump.

Toggle OS reduced motion (macOS: System Settings → Accessibility → Display → Reduce motion). Click a bar. The transition should be plain navigation, no morph.

Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add components/MotionShell.tsx app/layout.tsx
git commit -m "feat: wrap routes in AnimatePresence with reduced-motion config"
```

---

## Task 16: Production build + manual QA pass

**Files:** none.

- [ ] **Step 1: Production build succeeds**

```bash
npm run build
```

Expected: build completes with no errors. All 4 project routes appear in the route summary (`/works/dad-young-ones`, `/works/homy`, `/works/jugaad-events`, `/works/ubiq`) plus `/`, `/about`, `/contact`.

If the build fails: read the first error. Most likely culprits are missing cover images or bad frontmatter; the loader throws with a precise message.

- [ ] **Step 2: Production server check**

```bash
npm start
```

Open http://localhost:3000. Run the manual QA list:

- [ ] Carousel loops smoothly on trackpad horizontal swipe (try fast and slow).
- [ ] Pointer drag has momentum; release while moving — track keeps going then settles.
- [ ] Vertical mouse wheel on `/` does nothing.
- [ ] Hover a clickable bar — title overlay fades in. Move off — fades out.
- [ ] Hover the "Coming soon..." bar — no overlay, default cursor.
- [ ] Click a clickable bar — navigates to project page with hero morph (no white flash).
- [ ] Project page scrolls vertically. Title, hero, meta+intro, then alternating images/text.
- [ ] If `visitSite` is set, "Visit site" is a working link (open in new tab). With `visitSite` absent (try editing an MDX to remove it), the row shows as grayed text.
- [ ] `/about` and `/contact` return 200.
- [ ] Resize browser to <640px width: 2 bars visible. Touch swipe (or click-drag) works.
- [ ] Resize to between 640 and 1024px: 3 bars visible.
- [ ] Enable OS reduced motion: clicking a bar navigates without the morph.

- [ ] **Step 3: Commit any QA fixes**

If the QA pass surfaces issues, fix them in small commits with messages like `fix: <issue>`.

- [ ] **Step 4: Final commit (if nothing to fix)**

```bash
git log --oneline | head -20
```

You should see the history of feature commits. The portfolio is ready for content (replace placeholder copies and images).

---

## Done

After Task 16, the site is ready for real copy and real images. Replace the placeholder JPGs in `public/works/<slug>/` and the placeholder body copy in `content/works/<slug>.mdx`. No code changes needed to swap content.
