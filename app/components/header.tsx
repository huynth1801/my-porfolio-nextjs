"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { profile } from "@/lib/content";

const sectionLinks = [
  { name: "About", hash: "#about" },
  { name: "Experience", hash: "#experience" },
  { name: "Projects", hash: "#projects" },
];

export function Header() {
  const pathname = usePathname();
  const onHome = pathname === "/";

  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-white/5 bg-[#0d0d0f]/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/huy-nguyen-logo.svg"
            alt="Huy Nguyen Logo"
            width={32}
            height={32}
            className="size-8"
            priority
          />
          <span className="text-lg font-semibold text-white">Huy Nguyen</span>
        </Link>

        {/* Section anchors — only meaningful on the home journey */}
        {onHome && (
          <nav className="hidden items-center gap-7 md:flex" aria-label="Sections">
            {sectionLinks.map((item) => (
              <a
                key={item.hash}
                href={item.hash}
                className="text-sm font-medium text-gray-400 transition-colors hover:text-white"
              >
                {item.name}
              </a>
            ))}
          </nav>
        )}

        {/* Always-visible actions: CV + Contact */}
        <nav className="flex items-center gap-5">
          <a
            href={profile.resume}
            download
            className="text-sm font-medium text-gray-400 transition-colors hover:text-white"
          >
            Resume
          </a>
          <Link
            href="/contact"
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
              pathname === "/contact"
                ? "bg-white/15 text-white"
                : "bg-linear-to-r from-cyan-400 to-violet-400 text-gray-950 hover:brightness-110",
            )}
          >
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
