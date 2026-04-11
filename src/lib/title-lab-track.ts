import { db } from "@/lib/db";
import { titleLabEvents } from "@/lib/db/schema";
import { headers } from "next/headers";

interface TrackEventParams {
  eventType: "url_analyze" | "guided_brainstorm" | "playbook_view";
  inputTitle?: string;
  inputUrl?: string;
  inputDescription?: string;
  inputPromise?: string;
  inputStory?: string;
  inputHook?: string;
  aiResponse?: unknown;
}

export async function trackTitleLabEvent(params: TrackEventParams) {
  try {
    const headersList = headers();
    const userAgent = headersList.get("user-agent") || undefined;
    const country = headersList.get("x-vercel-ip-country") || undefined;
    const sessionId = headersList.get("x-vercel-id") || undefined;

    await db.insert(titleLabEvents).values({
      eventType: params.eventType,
      inputTitle: params.inputTitle,
      inputUrl: params.inputUrl,
      inputDescription: params.inputDescription,
      inputPromise: params.inputPromise,
      inputStory: params.inputStory,
      inputHook: params.inputHook,
      aiResponse: params.aiResponse as Record<string, unknown>,
      sessionId,
      userAgent,
      country,
    });
  } catch (error) {
    console.error("Title Lab tracking error:", error);
  }
}
