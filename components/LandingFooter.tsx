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
