import { NextResponse } from "next/server";

const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const AUDIENCE_NAME = "Newsletter";

async function getOrCreateAudience(): Promise<string> {
  const res = await fetch("https://api.resend.com/audiences", {
    headers: { Authorization: `Bearer ${RESEND_API_KEY}` },
  });
  const data = await res.json();
  const existing = data.data?.find((a: { name: string; id: string }) => a.name === AUDIENCE_NAME);
  if (existing) return existing.id;

  const create = await fetch("https://api.resend.com/audiences", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name: AUDIENCE_NAME }),
  });
  const created = await create.json();
  return created.id;
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const audienceId = await getOrCreateAudience();

    await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ email, unsubscribed: false }),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
