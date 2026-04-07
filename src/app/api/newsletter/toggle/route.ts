import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { subscribed } = await request.json();

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update in database
    await db
      .update(users)
      .set({ newsletterSubscribed: subscribed, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    // Update in Resend audience
    try {
      // Get audience
      const audRes = await fetch("https://api.resend.com/audiences", {
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      });
      const audData = await audRes.json();
      const audience = audData.data?.find(
        (a: { name: string }) => a.name === "Customers"
      );

      if (audience) {
        await fetch(
          `https://api.resend.com/audiences/${audience.id}/contacts`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: user.email,
              unsubscribed: !subscribed,
            }),
          }
        );
      }
    } catch (err) {
      console.error("Failed to update Resend subscription:", err);
    }

    return NextResponse.json({ success: true, subscribed });
  } catch (error) {
    console.error("Newsletter toggle error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
