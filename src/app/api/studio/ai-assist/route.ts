import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  AI_SYSTEM_PROMPT,
  buildUserMessage,
  coerceAIShape,
  parseAIResponse,
  type AIRequestContext,
} from "@/lib/studio/ai-prompts";
import type { Shape } from "@/lib/studio/types";

export const dynamic = "force-dynamic";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "anthropic/claude-sonnet-4";

// Simple in-memory rate limiter: 10 requests per minute per user.
// Resets when the process restarts; good enough for cost control.
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 10;
const recentByUser = new Map<string, number[]>();

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const list = (recentByUser.get(key) ?? []).filter(
    (t) => now - t < RATE_WINDOW_MS,
  );
  if (list.length >= RATE_MAX) {
    recentByUser.set(key, list);
    return false;
  }
  list.push(now);
  recentByUser.set(key, list);
  return true;
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!OPENROUTER_API_KEY) {
    return NextResponse.json(
      { error: "AI is not configured on this server." },
      { status: 503 },
    );
  }
  if (!checkRateLimit(session.user.id)) {
    return NextResponse.json(
      { error: "Please wait a moment before making another request." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const obj = (body ?? {}) as Record<string, unknown>;
  const prompt =
    typeof obj.prompt === "string" ? obj.prompt.trim() : "";
  if (!prompt) {
    return NextResponse.json(
      { error: "prompt is required" },
      { status: 400 },
    );
  }
  const existingShapes = Array.isArray(obj.existingShapes)
    ? (obj.existingShapes as Shape[])
    : [];
  const material =
    obj.material && typeof obj.material === "object"
      ? (obj.material as AIRequestContext["material"])
      : { width: 600, height: 400, thickness: 6, name: "Plywood" };
  const conversationHistory = Array.isArray(obj.conversationHistory)
    ? (obj.conversationHistory as AIRequestContext["conversationHistory"])
    : [];

  const userMessage = buildUserMessage({
    prompt,
    existingShapes,
    material,
    conversationHistory,
  });

  const messages = [
    { role: "system", content: AI_SYSTEM_PROMPT },
    ...((conversationHistory ?? []).map((m) => ({
      role: m.role,
      content: m.content,
    })) as { role: "user" | "assistant"; content: string }[]),
    { role: "user", content: userMessage },
  ];

  let response: Response;
  try {
    response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://jespermakes.com",
          "X-Title": "Jesper Makes Studio AI",
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 4000,
          temperature: 0.4,
          messages,
        }),
      },
    );
  } catch (err) {
    console.error("studio/ai-assist fetch error:", err);
    return NextResponse.json(
      { error: "Couldn't reach the AI service." },
      { status: 502 },
    );
  }

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    console.error("studio/ai-assist OpenRouter error:", errText);
    return NextResponse.json(
      { error: "The AI returned an error. Try again." },
      { status: 502 },
    );
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content ?? "";
  const parsed = parseAIResponse(text);
  if (!parsed) {
    return NextResponse.json(
      {
        error:
          "I had trouble generating that design. Try rephrasing your request.",
        rawText: text.slice(0, 4000),
      },
      { status: 502 },
    );
  }

  const validShapes: Shape[] = [];
  for (const raw of parsed.shapes) {
    const s = coerceAIShape(raw);
    if (s) validShapes.push(s);
  }

  return NextResponse.json({
    shapes: validShapes,
    message: parsed.message,
    modifications: parsed.modifications ?? [],
    rawShapeCount: parsed.shapes.length,
  });
}
