"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { profile } from "@/lib/content";
import { lofi } from "@/lib/audio";

export function Header() {
  const pathname = usePathname();
  const [musicOn, setMusicOn] = useState(false);

  const toggleMusic = async () => {
    const on = await lofi.toggle();
    setMusicOn(on);
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 pointer-events-none">
      {/* Top gradient shield prevents scrolling text from clashing with navigation */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-linear-to-b from-[#0a0a0c]/85 via-[#0a0a0c]/40 to-transparent"
      />
      <div className="relative mx-auto flex max-w-5xl items-center justify-between p-3.5 sm:px-6 sm:py-5">
        {/* Left Floating Brand Pill */}
        <div className="pointer-events-auto">
          <Link
            href="/"
            className="group flex min-h-[44px] items-center gap-2.5 rounded-full border border-white/10 bg-black/55 px-3.5 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all duration-200 hover:border-white/25 hover:bg-black/75 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <Image
              src="/huy-nguyen-logo.svg"
              alt="Huy Nguyen Logo"
              width={22}
              height={22}
              className="size-5.5 transition-transform duration-300 group-hover:rotate-6"
              priority
            />
            <span className="text-xs sm:text-sm font-semibold tracking-wide text-white">
              Huy Nguyen
            </span>
          </Link>
        </div>

        {/* Right Floating Actions Capsule */}
        <nav
          className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/10 bg-black/55 p-1 pl-2 shadow-[0_8px_24px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all duration-200"
          aria-label="Quick Actions"
        >
          {/* Lo-fi Music Toggle */}
          <button
            onClick={toggleMusic}
            aria-label={musicOn ? "Turn lo-fi music off" : "Turn lo-fi music on"}
            aria-pressed={musicOn}
            title={musicOn ? "Lo-fi: Đang phát" : "Lo-fi: Đã tắt"}
            className={cn(
              "flex size-9 sm:size-9 cursor-pointer items-center justify-center rounded-full border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400",
              musicOn
                ? "border-cyan-400/60 bg-cyan-400/15 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.4)]"
                : "border-white/10 bg-white/[0.04] text-neutral-400 hover:border-white/30 hover:text-white",
            )}
          >
            {musicOn ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
          </button>

          {/* Quick CV Download */}
          <a
            href={profile.resume}
            download
            className="hidden sm:inline-flex min-h-[36px] items-center text-xs font-mono font-medium text-neutral-300 hover:text-white transition-colors px-2.5 py-1 rounded-md hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            CV
          </a>

          {/* Contact Pill Button */}
          <Link
            href="/contact"
            className={cn(
              "flex min-h-[36px] items-center rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400",
              pathname === "/contact"
                ? "bg-white/20 text-white border border-white/25"
                : "bg-white text-neutral-950 hover:bg-neutral-100 hover:shadow-[0_0_16px_rgba(255,255,255,0.25)] active:scale-95",
            )}
          >
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
