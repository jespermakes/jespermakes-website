import Link from "next/link";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Notifications — My Account",
};

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/notifications");
  }
  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, session.user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(100);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-serif text-3xl text-wood">Notifications</h1>
      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-wood-light">
          You don&apos;t have any notifications yet.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-wood/[0.06] rounded-2xl border border-wood/[0.08] bg-white">
          {rows.map((n) => {
            const href = n.designId
              ? `/workbench/${n.designId}`
              : n.actorId
                ? `/profile/${n.actorId}`
                : "#";
            return (
              <li key={n.id}>
                <Link
                  href={href}
                  className={`block px-4 py-3 text-sm hover:bg-wood/[0.04] ${
                    n.read ? "text-wood-light" : "text-wood font-medium"
                  }`}
                >
                  {n.message}
                  <span className="mt-0.5 block text-[11px] text-wood-light/50">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
