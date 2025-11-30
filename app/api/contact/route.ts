import { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } from "@/lib/constants";
import { TELEGRAM_EP } from "@/lib/constants/api-endpoint";
import { NextResponse } from "next/server";

function escapeHtml(str: string) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
    }

    // Simple email validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
    }

    // Telegram has a message length limit (~4096). Cap the message at 4000 chars.
    const maxLen = 4000;
    let messageSafe = message;
    if (messageSafe.length > maxLen) messageSafe = messageSafe.slice(0, maxLen) + "...";

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      return NextResponse.json({ ok: false, error: "Telegram not configured" }, { status: 500 });
    }

    // Build a succinct message for Telegram. Use HTML parse mode and escape values.
    const htmlMsg = `
      <b>New contact form submission</b>\n
      <b>Name:</b> ${escapeHtml(name)}\n
      <b>Email:</b> ${escapeHtml(email)}\n
      <b>Subject:</b> ${escapeHtml(subject ?? "")}\n
      <b>Message:</b>\n${escapeHtml(messageSafe)}
    `;

    // Telegram expects POST to sendMessage endpoint
    const telegramUrl = `${TELEGRAM_EP}${TELEGRAM_BOT_TOKEN}/sendMessage`;

    const telegramRes = await fetch(telegramUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: htmlMsg, parse_mode: "HTML" }),
    });

    if (!telegramRes.ok) {
      const errorText = await telegramRes.text();
      return NextResponse.json({ ok: false, error: `Telegram error: ${errorText}` }, { status: 500 });
    }

    // Optional: send email as backup if SMTP or sendgrid is configured
    // NOTE: Keep email sending optional (uncomment or implement later)

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("/api/contact error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message ?? "Unknown error" }, { status: 500 });
  }
}
