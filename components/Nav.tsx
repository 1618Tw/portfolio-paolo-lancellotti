"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { COPY } from "@/lib/copy";

export function Nav() {
  const pathname = usePathname();
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/" || pathname.startsWith("/works/");
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-5 text-sm">
      <Link href="/" className="font-semibold tracking-wide">
        {COPY.logo}
      </Link>
      <nav className="flex items-center gap-8">
        {COPY.nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={isActive(item.href) ? "font-semibold" : "text-neutral-500 hover:text-black"}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
