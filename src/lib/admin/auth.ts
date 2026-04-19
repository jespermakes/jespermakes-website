import { auth } from "@/lib/auth";

export async function isAdmin() {
  const session = await auth();
  return !!(session?.user?.email && session.user.email === process.env.ADMIN_EMAIL);
}

export async function checkAdminApi() {
  const session = await auth();
  if (!session?.user?.email) {
    return { ok: false as const, error: "Unauthorized", status: 401 };
  }
  if (session.user.email !== process.env.ADMIN_EMAIL) {
    return { ok: false as const, error: "Forbidden", status: 403 };
  }
  return { ok: true as const, session };
}
