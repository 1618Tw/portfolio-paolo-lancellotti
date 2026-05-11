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
