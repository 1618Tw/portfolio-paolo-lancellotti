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
