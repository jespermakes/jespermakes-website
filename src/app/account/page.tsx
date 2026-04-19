import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, purchases } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { NewsletterToggle } from "./newsletter-toggle";
import { ChangePasswordForm } from "./change-password-form";

export const metadata = {
  title: "My Account — Jesper Makes",
};

const PRODUCT_INFO: Record<
  string,
  { name: string; description: string; downloadSku?: string; downloadLabel?: string }
> = {
  "workshop-wall-charts": {
    name: "Jesper's Cheat Sheets",
    description: "8 printable A4 reference sheets for your workshop wall",
    downloadSku: "workshop-wall-charts",
    downloadLabel: "Download PDF",
  },
  "cone-lamp-laser": {
    name: "Cone Lamp Laser File",
    description: "SVG laser cut file for the Cone Lamp",
    downloadSku: "cone-lamp-laser",
    downloadLabel: "Download ZIP",
  },
  "cone-lamp-3dprint": {
    name: "Cone Lamp 3D Print Files",
    description: "STL files + PDF instruction guide",
    downloadSku: "cone-lamp-3dprint",
    downloadLabel: "Download ZIP",
  },
  "pallet-starter-kit": {
    name: "The Pallet Builder's Starter Kit",
    description: "5 build guides + tool recommendations",
  },
  "workshop-tee": {
    name: "Jesper Makes Workshop Tee",
    description: "Unisex black tee — printed & shipped by Printful",
  },
};

const GUILD_TIERS: Record<string, { label: string; color: string }> = {
  free: { label: "Free", color: "text-wood-light" },
  apprentice: { label: "Apprentice", color: "text-forest" },
  journeyman: { label: "Journeyman", color: "text-forest-dark" },
  master: { label: "Master", color: "text-wood" },
};

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user.id
    ? await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
      })
    : null;

  const userPurchases = session.user.id
    ? await db
        .select()
        .from(purchases)
        .where(eq(purchases.userId, session.user.id))
        .orderBy(desc(purchases.purchasedAt))
    : [];

  const guildTier = (user as Record<string, unknown>)?.guildTier as string || "free";
  const tierInfo = GUILD_TIERS[guildTier] || GUILD_TIERS.free;
  const newsletterSubscribed = !!(user as Record<string, unknown>)?.newsletterSubscribed;
  const hasPassword = !!(user as Record<string, unknown>)?.passwordHash;

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="font-serif text-3xl text-wood mb-8">My Account</h1>

      {/* Profile */}
      <div className="bg-white rounded-lg border border-wood/10 p-6 mb-6">
        <h2 className="font-serif text-xl text-wood mb-3">Profile</h2>
        <div className="space-y-2 text-wood-light">
          {session.user.name && (
            <p>
              <span className="text-wood-light/60">Name:</span>{" "}
              {session.user.name}
            </p>
          )}
          <p>
            <span className="text-wood-light/60">Email:</span>{" "}
            {session.user.email}
          </p>
          {user?.createdAt && (
            <p>
              <span className="text-wood-light/60">Member since:</span>{" "}
              {new Date(user.createdAt).toLocaleDateString("en-GB", {
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
        </div>
      </div>

      {/* Purchases & Downloads */}
      <div className="bg-white rounded-lg border border-wood/10 p-6 mb-6">
        <h2 className="font-serif text-xl text-wood mb-4">My Purchases</h2>

        {userPurchases.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-wood-light/60 mb-4">No purchases yet.</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-forest text-white px-5 py-2.5 rounded-full font-medium hover:bg-forest/90 transition-colors text-sm"
            >
              Browse the Shop
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {userPurchases.map((purchase) => {
              const product = PRODUCT_INFO[purchase.sku];
              return (
                <div
                  key={purchase.id}
                  className="flex items-center justify-between py-4 border-b border-wood/5 last:border-0"
                >
                  <div>
                    <h3 className="font-serif text-lg text-wood">
                      {product?.name || purchase.sku}
                    </h3>
                    <p className="text-wood-light/60 text-sm">
                      {product?.description || "Digital product"}
                    </p>
                    <p className="text-wood-light/40 text-xs mt-1">
                      Purchased{" "}
                      {purchase.purchasedAt
                        ? new Date(purchase.purchasedAt).toLocaleDateString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )
                        : "recently"}
                    </p>
                  </div>
                  {product?.downloadSku && (
                    <a
                      href={`/api/downloads/${product.downloadSku}`}
                      className="inline-flex items-center gap-2 bg-forest text-white px-4 py-2 rounded-lg font-medium hover:bg-forest/90 transition-colors text-sm flex-shrink-0"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                        />
                      </svg>
                      {product.downloadLabel}
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Newsletter */}
      <div className="bg-white rounded-lg border border-wood/10 p-6 mb-6">
        <h2 className="font-serif text-xl text-wood mb-3">Newsletter</h2>
        <p className="text-wood-light/60 text-sm mb-4">
          Get build tips, new product announcements, and workshop updates.
        </p>
        <NewsletterToggle initialSubscribed={newsletterSubscribed} />
      </div>

      {/* Guild Membership */}
      <div className="bg-white rounded-lg border border-wood/10 p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-xl text-wood">Guild Membership</h2>
          <span className={`text-sm font-medium ${tierInfo.color}`}>
            {tierInfo.label}
          </span>
        </div>
        <div className="bg-forest/5 rounded-lg p-4 text-center">
          <p className="font-serif text-lg text-wood mb-1">Coming soon</p>
          <p className="text-wood-light/60 text-sm">
            The Jesper Makes Guild is being built. Join projects, unlock skills,
            and connect with fellow makers. Stay tuned.
          </p>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-lg border border-wood/10 p-6 mb-6">
        <h2 className="font-serif text-xl text-wood mb-3">
          {hasPassword ? "Change Password" : "Set Password"}
        </h2>
        <ChangePasswordForm hasExistingPassword={hasPassword} />
      </div>

      {/* Sign out */}
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <button
          type="submit"
          className="text-sm text-wood-light/60 hover:text-forest transition-colors underline"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
