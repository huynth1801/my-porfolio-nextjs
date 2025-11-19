"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";

const navItems = [
  { name: "Home", href: "/" },
  { name: "Resume", href: "/huy-nguyen-resume.pdf", download: true },
  { name: "Contact", href: "/contact" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0d0d0f] border-b border-[#1a1a1a]">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/huy-nguyen-logo.svg"
            alt="Huy Nguyen Logo"
            width={32}
            height={32}
            className="w-8 h-8"
            priority
          />

          <span className="text-white font-semibold text-lg">Huy Nguyen</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            if (item.download) {
              return (
                <a
                  key={item.href}
                  href={item.href}
                  download
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-white",
                    "text-gray-400",
                  )}
                >
                  {item.name}
                </a>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-white",
                  isActive ? "text-white" : "text-gray-400",
                )}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
