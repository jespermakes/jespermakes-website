import { db } from "./db";
import { notifications } from "./db/schema";

interface CreateNotificationInput {
  userId: string;
  type: "like" | "comment" | "remix" | "follow" | "new_design";
  actorId?: string | null;
  actorName?: string | null;
  designId?: string | null;
  commentId?: string | null;
  message: string;
}

/** Fire-and-forget notification insert. Failures are logged and swallowed. */
export async function createNotification(input: CreateNotificationInput) {
  try {
    if (input.actorId && input.actorId === input.userId) return; // don't notify self
    await db.insert(notifications).values({
      userId: input.userId,
      type: input.type,
      actorId: input.actorId ?? null,
      actorName: input.actorName ?? null,
      designId: input.designId ?? null,
      commentId: input.commentId ?? null,
      message: input.message,
    });
  } catch (err) {
    console.error("createNotification failed:", err);
  }
}
