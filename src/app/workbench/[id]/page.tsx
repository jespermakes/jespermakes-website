import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { workbenchDesigns, workbenchLikes } from "@/lib/db/schema";
import { DesignDetail } from "@/components/workbench/design-detail";
import type { StudioDesignFile } from "@/lib/studio/file-format";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const [row] = await db
    .select({ name: workbenchDesigns.name, description: workbenchDesigns.description })
    .from(workbenchDesigns)
    .where(eq(workbenchDesigns.id, id))
    .limit(1);
  if (!row) return { title: "Workbench Design" };
  return {
    title: `${row.name} — The Workbench`,
    description: (row.description || "").slice(0, 160) || "Community design on The Workbench.",
  };
}

export default async function WorkbenchDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [row] = await db
    .select()
    .from(workbenchDesigns)
    .where(
      and(
        eq(workbenchDesigns.id, id),
        eq(workbenchDesigns.status, "published"),
      ),
    )
    .limit(1);
  if (!row) notFound();

  // Bump download count on view (best-effort; not awaited).
  void db
    .update(workbenchDesigns)
    .set({ downloadCount: sql`${workbenchDesigns.downloadCount} + 1` })
    .where(eq(workbenchDesigns.id, id))
    .catch(() => {});

  let remixOfName: string | null = null;
  let remixOfAuthorName: string | null = null;
  if (row.remixOfId) {
    const [parent] = await db
      .select({
        name: workbenchDesigns.name,
        authorName: workbenchDesigns.authorName,
      })
      .from(workbenchDesigns)
      .where(eq(workbenchDesigns.id, row.remixOfId))
      .limit(1);
    remixOfName = parent?.name ?? null;
    remixOfAuthorName = parent?.authorName ?? null;
  }

  const session = await auth();
  const isLoggedIn = !!session?.user?.id;
  const isAuthor = session?.user?.id === row.authorId;
  let initialLiked = false;
  if (session?.user?.id) {
    const [existing] = await db
      .select({ id: workbenchLikes.id })
      .from(workbenchLikes)
      .where(
        and(
          eq(workbenchLikes.userId, session.user.id),
          eq(workbenchLikes.designId, id),
        ),
      )
      .limit(1);
    initialLiked = !!existing;
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <nav className="mb-6 text-sm text-wood-light">
        <Link href="/workbench" className="hover:text-forest">
          ← Back to The Workbench
        </Link>
      </nav>
      <DesignDetail
        design={{
          id: row.id,
          name: row.name,
          description: row.description ?? "",
          authorName: row.authorName,
          authorId: row.authorId,
          tags: row.tags,
          category: row.category,
          thumbnail: row.thumbnail,
          data: row.data as StudioDesignFile,
          downloadCount: row.downloadCount + 1,
          likeCount: row.likeCount,
          remixCount: row.remixCount,
          remixOfId: row.remixOfId,
          remixOfName,
          remixOfAuthorName,
          publishedAt: row.publishedAt.toISOString(),
        }}
        isLoggedIn={isLoggedIn}
        isAuthor={isAuthor}
        initialLiked={initialLiked}
      />
    </main>
  );
}
