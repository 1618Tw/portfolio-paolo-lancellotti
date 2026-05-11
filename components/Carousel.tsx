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

  // Wheel input — vertical mouse wheel drives horizontal carousel motion,
  // and horizontal trackpad swipe also works. Whichever axis has the larger
  // delta wins.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let wheelTimer: number | null = null;
    const onWheel = (e: WheelEvent) => {
      const delta =
        Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(delta) < 1) return;
      e.preventDefault();
      x.set(x.get() - delta);
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
