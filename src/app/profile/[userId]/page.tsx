import Link from "next/link";
import { notFound } from "next/navigation";
import { and, count, desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { follows, users, workbenchDesigns } from "@/lib/db/schema";
import {
  DesignCard,
  type WorkbenchDesignSummary,
} from "@/components/workbench/design-card";
import { FollowButton } from "@/components/workbench/follow-button";
import { publicDisplayName } from "@/lib/profile";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ userId: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { userId } = await params;
  const [u] = await db
    .select({
      displayName: users.displayName,
      name: users.name,
      email: users.email,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!u) return { title: "Maker — Jesper Makes" };
  const dn = publicDisplayName(u);
  return {
    title: `${dn} — Jesper Makes`,
    description: `Designs by ${dn} on The Workbench.`,
  };
}

export default async function ProfilePage({ params }: PageProps) {
  const { userId } = await params;
  const [u] = await db
    .select({
      id: users.id,
      displayName: users.displayName,
      name: users.name,
      email: users.email,
      bio: users.bio,
      avatarUrl: users.avatarUrl,
      website: users.website,
      location: users.location,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!u) notFound();

  const dn = publicDisplayName(u);

  const [designsRows, followerRow, followingRow] = await Promise.all([
    db
      .select({
        id: workbenchDesigns.id,
        name: workbenchDesigns.name,
        description: workbenchDesigns.description,
        authorName: workbenchDesigns.authorName,
        thumbnail: workbenchDesigns.thumbnail,
        tags: workbenchDesigns.tags,
        category: workbenchDesigns.category,
        downloadCount: workbenchDesigns.downloadCount,
        likeCount: workbenchDesigns.likeCount,
        remixCount: workbenchDesigns.remixCount,
        publishedAt: workbenchDesigns.publishedAt,
      })
      .from(workbenchDesigns)
      .where(
        and(
          eq(workbenchDesigns.authorId, userId),
          eq(workbenchDesigns.status, "published"),
        ),
      )
      .orderBy(desc(workbenchDesigns.publishedAt))
      .limit(48),
    db
      .select({ count: count() })
      .from(follows)
      .where(eq(follows.followingId, userId)),
    db
      .select({ count: count() })
      .from(follows)
      .where(eq(follows.followerId, userId)),
  ]);

  const followerCount = Number(followerRow[0]?.count ?? 0);
  const followingCount = Number(followingRow[0]?.count ?? 0);
  const designCount = designsRows.length;

  const session = await auth();
  const viewerId = session?.user?.id ?? null;
  let isFollowing = false;
  if (viewerId && viewerId !== userId) {
    const [existing] = await db
      .select({ id: follows.id })
      .from(follows)
      .where(
        and(
          eq(follows.followerId, viewerId),
          eq(follows.followingId, userId),
        ),
      )
      .limit(1);
    isFollowing = !!existing;
  }

  const designs: WorkbenchDesignSummary[] = designsRows.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description ?? "",
    authorName: r.authorName,
    authorId: userId,
    thumbnail: r.thumbnail,
    tags: r.tags,
    category: r.category,
    downloadCount: r.downloadCount,
    likeCount: r.likeCount,
    remixCount: r.remixCount,
    publishedAt: r.publishedAt.toISOString(),
  }));

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div
          className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-forest/10 font-serif text-2xl text-forest"
          aria-hidden
        >
          {u.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={u.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            dn[0]?.toUpperCase() ?? "·"
          )}
        </div>
        <div className="flex-1">
          <h1 className="font-serif text-3xl text-wood">{dn}</h1>
          {u.location ? (
            <p className="text-sm text-wood-light">{u.location}</p>
          ) : null}
          {u.bio ? (
            <p className="mt-2 max-w-prose whitespace-pre-line text-sm text-wood">
              {u.bio}
            </p>
          ) : null}
          {u.website ? (
            <a
              href={u.website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-sm text-forest underline hover:text-forest-dark"
            >
              {u.website.replace(/^https?:\/\//, "")}
            </a>
          ) : null}
          <p className="mt-3 text-[12px] text-wood-light/70">
            {designCount} design{designCount === 1 ? "" : "s"} ·{" "}
            {followerCount} follower{followerCount === 1 ? "" : "s"} ·{" "}
            following {followingCount} ·{" "}
            joined{" "}
            {u.createdAt
              ? new Date(u.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  year: "numeric",
                })
              : ""}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {viewerId && viewerId !== userId ? (
              <FollowButton userId={userId} initialFollowing={isFollowing} />
            ) : null}
            {viewerId === userId ? (
              <Link
                href="/account/profile"
                className="rounded-xl border border-wood/[0.12] bg-white px-4 py-1.5 text-[12px] text-wood hover:border-forest/40"
              >
                Edit profile
              </Link>
            ) : null}
          </div>
        </div>
      </header>

      <section className="mt-10">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-wood-light/40">
          Designs
        </h2>
        {designs.length === 0 ? (
          <p className="mt-4 text-sm text-wood-light">
            {dn} hasn&apos;t published any designs yet.
          </p>
        ) : (
          <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {designs.map((d) => (
              <li key={d.id}>
                <DesignCard design={d} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
