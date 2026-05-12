"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

type Props = {
  /** Public-relative directory containing the slides, e.g. "/works/homy/slides". */
  dir: string;
  /** Number of slides (1..N). Files must be named "1.<ext>", "2.<ext>", … */
  count: number | string;
  /** File extension without the dot. Defaults to "jpg". */
  ext?: string;
  /** ms between auto-advance, default 3500. */
  interval?: number | string;
  /** Optional alt text prefix (e.g. "Homy slide"). */
  alt?: string;
};

export function Slideshow({ dir, count, ext = "jpg", interval = 3500, alt = "Slide" }: Props) {
  const n = typeof count === "string" ? parseInt(count, 10) : count;
  const ms = typeof interval === "string" ? parseInt(interval, 10) : interval;

  const images = useMemo(
    () => Array.from({ length: n }, (_, i) => `${dir}/${i + 1}.${ext}`),
    [dir, n, ext],
  );

  const [i, setI] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const id = window.setInterval(() => {
      setI((prev) => (prev + 1) % images.length);
    }, ms);
    return () => window.clearInterval(id);
  }, [images.length, ms]);

  if (images.length === 0) return null;

  return (
    <div className="relative my-12 w-full overflow-hidden rounded-sm bg-neutral-100">
      <div className="relative aspect-video w-full">
        {images.map((src, idx) => (
          <Image
            key={src}
            src={src}
            alt={`${alt} ${idx + 1}`}
            fill
            sizes="100vw"
            className={
              "object-contain transition-opacity duration-700 " +
              (idx === i ? "opacity-100" : "opacity-0")
            }
            priority={idx === 0}
          />
        ))}
      </div>
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2">
        {images.map((_, idx) => (
          <button
            key={idx}
            aria-label={`Go to slide ${idx + 1}`}
            onClick={() => setI(idx)}
            className={
              "h-1.5 rounded-full transition-all " +
              (idx === i ? "w-6 bg-black" : "w-1.5 bg-neutral-400")
            }
          />
        ))}
      </div>
    </div>
  );
}
