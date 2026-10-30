import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export const alt = "Huy Nguyen — Frontend Developer Portfolio";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "60px 80px",
        backgroundColor: "#09090b",
        backgroundImage:
          "radial-gradient(circle at 15% 20%, rgba(34, 211, 238, 0.15) 0%, transparent 45%), radial-gradient(circle at 85% 80%, rgba(245, 158, 11, 0.12) 0%, transparent 50%)",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#ffffff",
        border: "12px solid #18181b",
      }}
    >
      {/* Top Header Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "8px 18px",
            borderRadius: "9999px",
            backgroundColor: "rgba(255, 255, 255, 0.06)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
          }}
        >
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: "#22d3ee",
            }}
          />
          <span
            style={{
              fontSize: "15px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              color: "#67e8f9",
              textTransform: "uppercase",
            }}
          >
            Interactive 3D Diorama Portfolio
          </span>
        </div>

        <div
          style={{
            fontSize: "16px",
            fontWeight: 500,
            color: "#a1a1aa",
            letterSpacing: "0.05em",
          }}
        >
          Ho Chi Minh City, Vietnam
        </div>
      </div>

      {/* Center Main Typography */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div
          style={{
            fontSize: "72px",
            fontWeight: 900,
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
            background: "linear-gradient(to right, #ffffff, #e4e4e7, #a1a1aa)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Huy Nguyen
        </div>
        <div
          style={{
            fontSize: "28px",
            fontWeight: 600,
            color: "#38bdf8",
            letterSpacing: "-0.01em",
          }}
        >
          Frontend Developer & Creative Engineer
        </div>
        <div
          style={{
            fontSize: "20px",
            fontWeight: 400,
            color: "#d4d4d8",
            maxWidth: "880px",
            lineHeight: 1.45,
          }}
        >
          Building playful, high-performance web experiences with React, Next.js, and WebGL with a
          game developer&apos;s sense of feel.
        </div>
      </div>

      {/* Bottom Tech Pills & Domain */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          paddingTop: "28px",
        }}
      >
        <div style={{ display: "flex", gap: "12px" }}>
          {["Next.js 16", "React 19", "Three.js / WebGL", "TypeScript", "GSAP"].map((tag) => (
            <div
              key={tag}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                fontSize: "14px",
                fontWeight: 600,
                color: "#cbd5e1",
              }}
            >
              {tag}
            </div>
          ))}
        </div>

        <div
          style={{
            fontSize: "15px",
            fontWeight: 600,
            color: "#71717a",
            letterSpacing: "0.05em",
          }}
        >
          my-porfolio-nextjs.vercel.app
        </div>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
