import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, subject, message } = body as {
    name: string;
    email: string;
    subject: string;
    message: string;
  };

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!process.env.RESEND_API_KEY) {
    console.log("[contact] RESEND_API_KEY not set — logging submission:", { name, email, subject });
    return NextResponse.json({ ok: true });
  }

  const { error } = await resend.emails.send({
    from: "SMARTPATH AI <noreply@smartpathavatar.online>",
    to: "contact@smartpathavatar.online",
    replyTo: email,
    subject: `[Contact] ${subject?.trim() || "General Inquiry"} — ${name}`,
    html: `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
      <p><strong>Subject:</strong> ${subject || "N/A"}</p>
      <hr />
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, "<br/>")}</p>
    `,
  });

  if (error) {
    console.error("[contact] Resend error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
