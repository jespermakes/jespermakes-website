import type { users } from "./db/schema";

type UserRow = typeof users.$inferSelect;

/** The display name we show on profile pages, comments, and Workbench cards. */
export function publicDisplayName(
  user: Pick<UserRow, "displayName" | "name" | "email"> | null,
): string {
  if (!user) return "Maker";
  if (user.displayName && user.displayName.trim().length > 0) {
    return user.displayName.trim();
  }
  if (user.name && user.name.trim().length > 0) return user.name.trim();
  if (user.email) return user.email.split("@")[0];
  return "Maker";
}

export function userInitial(displayName: string): string {
  const trimmed = displayName.trim();
  return trimmed.length > 0 ? trimmed[0].toUpperCase() : "·";
}
