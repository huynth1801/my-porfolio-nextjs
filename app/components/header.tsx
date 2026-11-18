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
            className="group flex min-h-[44px] items-center gap-2.5 rounded-full border border-white/12 bg-[#090a0f]/80 px-3.5 py-2 shadow-[0_8px_28px_rgba(0,0,0,0.65)] backdrop-blur-2xl transition-all duration-200 hover:border-cyan-400/40 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <div className="relative">
              <Image
                src="/huy-nguyen-logo.svg"
                alt="Huy Nguyen Logo"
                width={22}
                height={22}
                className="size-5.5 transition-transform duration-300 group-hover:rotate-12"
                priority
              />
              <span className="absolute -bottom-0.5 -right-0.5 size-1.5 rounded-full bg-emerald-400 ring-2 ring-black animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                Huy Nguyen
              </span>
              <span className="hidden sm:inline font-mono text-[9px] uppercase tracking-wider text-cyan-400/70 -mt-0.5">
                DEV // LVL.4
              </span>
            </div>
          </Link>
        </div>

        {/* Right Floating Actions Capsule */}
        <nav
          className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/12 bg-[#090a0f]/80 p-1 pl-2 sm:pl-3 shadow-[0_8px_28px_rgba(0,0,0,0.65)] backdrop-blur-2xl transition-all duration-200"
          aria-label="Quick Navigation"
        >
          {/* Quick Section Anchor Links for Desktop */}
          <div className="hidden md:flex items-center gap-1 text-[11px] font-mono tracking-wider uppercase text-gray-400 pr-1.5 border-r border-white/10">
            <a
              href="#about"
              className="px-2.5 py-1 rounded-md transition-colors hover:text-cyan-300 hover:bg-white/5"
            >
              About
            </a>
            <a
              href="#experience"
              className="px-2.5 py-1 rounded-md transition-colors hover:text-cyan-300 hover:bg-white/5"
            >
              Exp
            </a>
            <a
              href="#projects"
              className="px-2.5 py-1 rounded-md transition-colors hover:text-cyan-300 hover:bg-white/5"
            >
              Work
            </a>
            <a
              href="#skills"
              className="px-2.5 py-1 rounded-md transition-colors hover:text-cyan-300 hover:bg-white/5"
            >
              Skills
            </a>
          </div>

          {/* Lo-fi Music Toggle */}
          <button
            onClick={toggleMusic}
            aria-label={musicOn ? "Turn lo-fi music off" : "Turn lo-fi music on"}
            aria-pressed={musicOn}
            title={musicOn ? "Lo-fi: Đang phát" : "Lo-fi: Đã tắt"}
            className={cn(
              "flex size-9 sm:size-9 cursor-pointer items-center justify-center rounded-full border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400",
              musicOn
                ? "border-cyan-400/60 bg-cyan-400/20 text-cyan-300 shadow-[0_0_14px_rgba(34,211,238,0.45)]"
                : "border-white/10 bg-white/[0.04] text-neutral-400 hover:border-white/30 hover:text-white",
            )}
          >
            {musicOn ? (
              <Volume2 className="size-3.5 animate-pulse" />
            ) : (
              <VolumeX className="size-3.5" />
            )}
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
              "flex min-h-[36px] items-center rounded-full px-4 py-1.5 text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400",
              pathname === "/contact"
                ? "bg-cyan-400 text-neutral-950 font-black shadow-[0_0_16px_rgba(34,211,238,0.5)]"
                : "bg-white text-neutral-950 hover:bg-cyan-300 hover:shadow-[0_0_16px_rgba(34,211,238,0.35)] active:scale-95",
            )}
          >
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
