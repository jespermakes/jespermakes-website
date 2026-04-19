import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { subscribeToNewsletter, unsubscribeFromNewsletter } from "@/lib/newsletter";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const subscribed = !!body.subscribed;

    if (subscribed) {
      await subscribeToNewsletter({
        email: session.user.email,
        firstName: session.user.name ?? null,
        source: "account_toggle",
        userId: session.user.id,
      });
    } else {
      await unsubscribeFromNewsletter({
        email: session.user.email,
        userId: session.user.id,
      });
    }

    return NextResponse.json({ ok: true, subscribed });
  } catch (e) {
    console.error("Newsletter toggle error:", e);
    return NextResponse.json({ error: "Toggle failed" }, { status: 500 });
  }
}
