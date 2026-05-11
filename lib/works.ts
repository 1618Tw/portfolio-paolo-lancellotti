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
