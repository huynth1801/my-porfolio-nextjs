import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Huy Nguyen — Frontend Developer Portfolio",
    short_name: "Huy Nguyen",
    description:
      "Frontend developer in Ho Chi Minh City building playful, high-performance web experiences with React, Next.js and WebGL.",
    start_url: "/",
    display: "standalone",
    background_color: "#0d0d0f",
    theme_color: "#0d0d0f",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
