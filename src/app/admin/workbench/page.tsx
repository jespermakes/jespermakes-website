import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, workbenchDesigns } from "@/lib/db/schema";
import { ModerationActions } from "./moderation-actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Workbench Moderation — Admin",
};

export default async function WorkbenchModerationPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin/workbench");
  }
  const [me] = await db
    .select({ isAdmin: users.isAdmin })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);
  if (!me?.isAdmin) {
    redirect("/");
  }

  const flagged = await db
    .select({
      id: workbenchDesigns.id,
      name: workbenchDesigns.name,
      authorId: workbenchDesigns.authorId,
      authorName: workbenchDesigns.authorName,
      thumbnail: workbenchDesigns.thumbnail,
      publishedAt: workbenchDesigns.publishedAt,
      status: workbenchDesigns.status,
    })
    .from(workbenchDesigns)
    .where(eq(workbenchDesigns.status, "flagged"))
    .orderBy(desc(workbenchDesigns.publishedAt))
    .limit(100);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-serif text-3xl text-wood">Workbench moderation</h1>
      <p className="mt-1 text-sm text-wood-light">
        Designs flagged for review. Approve to put back on the Workbench;
        remove to hide; ban author to remove all of their designs.
      </p>
      {flagged.length === 0 ? (
        <p className="mt-8 text-sm text-wood-light">Nothing to review.</p>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {flagged.map((d) => (
            <li
              key={d.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-amber-200 bg-amber-50/40"
            >
              <div className="aspect-[4/3] bg-cream/60">
                {d.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={d.thumbnail}
                    alt=""
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-wood-light/30">
                    no preview
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 px-3 py-3">
                <div>
                  <p className="font-medium text-wood">{d.name}</p>
                  <p className="text-[11px] text-wood-light">
                    by {d.authorName} ·{" "}
                    {new Date(d.publishedAt).toLocaleDateString()}
                  </p>
                </div>
                <ModerationActions designId={d.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
