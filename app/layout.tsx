import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Header } from "./components/header";
import { JsonLd } from "./components/seo/json-ld";
import { Analytics } from "@vercel/analytics/next";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

const description =
  "Frontend developer in Ho Chi Minh City building playful, high-performance web experiences with React, Next.js and WebGL.";

export const metadata: Metadata = {
  metadataBase: new URL("https://my-porfolio-nextjs.vercel.app"),
  title: {
    default: "Huy Nguyen · Frontend Developer",
    template: "%s · Huy Nguyen",
  },
  description,
  applicationName: "Huy Nguyen Portfolio",
  authors: [{ name: "Huy Nguyen", url: "https://github.com/huynth1801" }],
  creator: "Huy Nguyen",
  publisher: "Huy Nguyen",
  category: "technology",
  keywords: [
    "Frontend Developer",
    "Frontend Engineer",
    "Creative Developer",
    "React",
    "Next.js",
    "TypeScript",
    "WebGL",
    "Three.js",
    "React Three Fiber",
    "GSAP",
    "Tailwind CSS",
    "3D Portfolio",
    "Interactive Portfolio",
    "Ho Chi Minh City",
    "Vietnam Developer",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Huy Nguyen · Frontend Developer",
    description,
    url: "/",
    siteName: "Huy Nguyen · Portfolio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Huy Nguyen · Frontend Developer",
    description,
    creator: "@huuhuy1801",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icon.svg" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0d0d0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${display.variable}`}>
      <head>
        <JsonLd />
      </head>
      <body className="antialiased">
        <a
          href="#home"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-cyan-400 focus:px-4 focus:py-2 focus:text-xs focus:font-bold focus:text-neutral-950 focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-white"
        >
          Skip to main content
        </a>
        <Header />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
