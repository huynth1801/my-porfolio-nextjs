import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Huy Nguyen — Frontend Developer in Ho Chi Minh City. Open for web app and creative engineering opportunities.",
  openGraph: {
    title: "Contact — Huy Nguyen",
    description: "Get in touch with Huy Nguyen — Frontend Developer in Ho Chi Minh City.",
    url: "/contact",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
