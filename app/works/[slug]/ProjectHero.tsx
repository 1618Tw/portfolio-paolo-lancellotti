"use client";

import Image from "next/image";
import { motion } from "framer-motion";

type Props = {
  slug: string;
  cover: string;
  alt: string;
  /** When the page hero matches the carousel cover, enable the shared-element morph. */
  morph?: boolean;
};

export function ProjectHero({ slug, cover, alt, morph = true }: Props) {
  return (
    <motion.div
      layoutId={morph ? `hero-${slug}` : undefined}
      className="relative h-[70vh] w-full overflow-hidden"
    >
      <Image src={cover} alt={alt} fill priority sizes="100vw" className="object-cover" />
    </motion.div>
  );
}
