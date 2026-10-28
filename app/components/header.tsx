"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { profile } from "@/lib/content";
import { lofi } from "@/lib/audio";

const sectionLinks = [
  { name: "About", hash: "#about" },
  { name: "Experience", hash: "#experience" },
  { name: "Projects", hash: "#projects" },
];

export function Header() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [musicOn, setMusicOn] = useState(false);

  const toggleMusic = async () => {
    const on = await lofi.toggle();
    setMusicOn(on);
  };

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

        {/* Always-visible actions: music, Resume, Contact */}
        <nav className="flex items-center gap-4">
          <button
            onClick={toggleMusic}
            aria-label={musicOn ? "Turn lo-fi music off" : "Turn lo-fi music on"}
            aria-pressed={musicOn}
            title={musicOn ? "Lo-fi: on" : "Lo-fi: off"}
            className={cn(
              "flex size-9 cursor-pointer items-center justify-center rounded-full border transition-colors",
              musicOn
                ? "border-cyan-400/50 text-cyan-300 shadow-[0_0_16px_-4px_rgba(34,211,238,0.6)]"
                : "border-white/10 text-gray-400 hover:border-white/30 hover:text-white",
            )}
          >
            {musicOn ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          </button>
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
                : "btn-solid",
            )}
          >
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
