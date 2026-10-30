import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Huy Nguyen — Frontend Developer in Ho Chi Minh City. Open for web app, frontend architecture, and creative engineering opportunities.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact — Huy Nguyen",
    description:
      "Get in touch with Huy Nguyen — Frontend Developer in Ho Chi Minh City. Open for web app and creative engineering opportunities.",
    url: "/contact",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact — Huy Nguyen",
    description: "Get in touch with Huy Nguyen — Frontend Developer in Ho Chi Minh City.",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
