import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Header } from "./components/header";

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
    default: "Huy Nguyen — Frontend Developer",
    template: "%s — Huy Nguyen",
  },
  description,
  keywords: [
    "Frontend Developer",
    "React",
    "Next.js",
    "TypeScript",
    "WebGL",
    "React Three Fiber",
    "Portfolio",
    "Ho Chi Minh City",
  ],
  openGraph: {
    title: "Huy Nguyen — Frontend Developer",
    description,
    url: "/",
    siteName: "Huy Nguyen — Portfolio",
    locale: "en_US",
    type: "website",
    images: [{ url: "/huy.jpg", width: 800, height: 800, alt: "Huy Nguyen" }],
  },
  twitter: {
    card: "summary",
    title: "Huy Nguyen — Frontend Developer",
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#0d0d0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${display.variable}`}>
      <body className="antialiased">
        <Header />
        {children}
      </body>
    </html>
  );
}
