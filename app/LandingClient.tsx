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
