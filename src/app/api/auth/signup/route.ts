import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await db.query.users.findFirst({
      where: eq(users.email, normalizedEmail),
    });

    if (existing) {
      if (existing.passwordHash) {
        return NextResponse.json(
          { error: "An account with this email already exists. Try signing in." },
          { status: 409 }
        );
      }
      // Existing user from magic link or Stripe purchase — let them set a password
      const passwordHash = await bcrypt.hash(password, 12);
      await db
        .update(users)
        .set({
          passwordHash,
          name: name || existing.name,
          provider: "credentials",
          updatedAt: new Date(),
        })
        .where(eq(users.id, existing.id));

      return NextResponse.json({ success: true, upgraded: true });
    }

    // Create new user
    const passwordHash = await bcrypt.hash(password, 12);
    await db.insert(users).values({
      email: normalizedEmail,
      name: name || null,
      passwordHash,
      provider: "credentials",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
