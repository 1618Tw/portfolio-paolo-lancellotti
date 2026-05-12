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

  // Render items five times so even at the edges of the middle copy there are
  // always real bars on screen. Wrap-around stays in the middle (2..3 copy span).
  const COPIES = 5;
  const tripled = Array.from({ length: COPIES }).flatMap(() => items);

  useEffect(() => {
    const measure = () => {
      const vw = window.innerWidth;
      const barWidth = vw / barsVisible;
      setTrackWidth(barWidth * N);
      // Neutral start: position so the middle copy is centered in viewport.
      x.set(-barWidth * N * Math.floor(COPIES / 2));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [N, barsVisible, x]);

  // Single change listener: wrap immediately so x stays in the middle copy
  // range, then emit the active index. Because every copy is visually
  // identical, the wrap is invisible — but it guarantees bars are always on
  // screen no matter how far the user scrolls or drags.
  useMotionValueEvent(x, "change", (latest) => {
    if (trackWidth === 0) return;
    const tw = trackWidth;
    // Target range: middle copy. With COPIES=5, that's indices 2..3, i.e.
    // x in [-3*tw, -2*tw]. Wrap by adding/subtracting tw until in range.
    const lower = -Math.floor(COPIES / 2 + 1) * tw; // -3*tw
    const upper = -Math.floor(COPIES / 2) * tw;     // -2*tw
    let nx = latest;
    if (nx > upper || nx < lower) {
      while (nx > upper) nx -= tw;
      while (nx < lower) nx += tw;
      x.set(nx);
      return; // the new set fires another change event; index update happens there
    }

    if (!onActiveChange) return;
    const barWidth = tw / N;
    const viewportCenter = window.innerWidth / 2;
    const raw = (viewportCenter - latest - barWidth / 2) / barWidth;
    const idx = ((Math.round(raw) % N) + N) % N;
    onActiveChange(idx);
  });

  // Wheel input — vertical mouse wheel drives horizontal carousel motion,
  // and horizontal trackpad swipe also works. Whichever axis has the larger
  // delta wins. Wrapping happens in the change listener above.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const delta =
        Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(delta) < 1) return;
      e.preventDefault();
      x.set(x.get() - delta);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [x]);

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
        dragElastic={0}
      >
        {tripled.map((item, i) => (
          <CarouselBar
            key={`${item.slug}-${i}`}
            item={item}
            widthPct={100 / barsVisible}
          />
        ))}
      </motion.div>
    </div>
  );
}
