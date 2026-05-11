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
