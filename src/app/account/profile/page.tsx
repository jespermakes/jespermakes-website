import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { ProfileForm } from "./profile-form";

export const metadata = {
  title: "Profile — My Account",
};

export default async function ProfileEditPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/profile");
  }
  const [row] = await db
    .select({
      id: users.id,
      displayName: users.displayName,
      bio: users.bio,
      avatarUrl: users.avatarUrl,
      website: users.website,
      location: users.location,
      name: users.name,
      email: users.email,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);
  if (!row) redirect("/login?callbackUrl=/account/profile");

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-serif text-3xl text-wood">Your maker profile</h1>
      <p className="mt-1 text-sm text-wood-light">
        This is the public face you show on The Workbench and on comments.
      </p>
      <div className="mt-8">
        <ProfileForm
          initial={{
            displayName: row.displayName ?? row.name ?? "",
            bio: row.bio ?? "",
            avatarUrl: row.avatarUrl ?? "",
            website: row.website ?? "",
            location: row.location ?? "",
          }}
          userId={row.id}
        />
      </div>
    </main>
  );
}
