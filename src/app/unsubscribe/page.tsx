import Link from "next/link";
import type { Metadata } from "next";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe-token";

export const metadata: Metadata = {
  title: "Unsubscribe | Jesper Makes",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// The page the footer link of every email points at. Opening it changes
// nothing (mail scanners open links on their own); the button does it, one
// click, no login. The button posts to /api/newsletter/unsubscribe, which is
// also the RFC 8058 one-click endpoint mail apps call directly.

const MAILTO = "mailto:hello@jespermakes.com?subject=unsubscribe";

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="max-w-xl mx-auto px-6 py-24 md:py-32 text-center">
      <h1 className="font-serif text-4xl text-wood mb-6">{title}</h1>
      <div className="space-y-4 text-wood-light leading-relaxed">{children}</div>
    </div>
  );
}

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string; done?: string; invalid?: string; error?: string }>;
}) {
  const params = await searchParams;

  if (params.done) {
    return (
      <Shell title="You're off the list">
        <p>No more Workshop Letters. Thanks for reading while you did.</p>
        <p>
          Changed your mind? You can sign up again any time on the{" "}
          <Link href="/newsletter" className="text-forest underline underline-offset-4">
            newsletter page
          </Link>
          .
        </p>
      </Shell>
    );
  }

  if (params.error) {
    return (
      <Shell title="That didn't go through">
        <p>Something on my end broke, so you are still on the list. Try the link from the email again in a minute.</p>
        <p>
          If it keeps failing, write to{" "}
          <a href={MAILTO} className="text-forest underline underline-offset-4">
            hello@jespermakes.com
          </a>{" "}
          and I&apos;ll take you off by hand.
        </p>
      </Shell>
    );
  }

  const email = params.invalid ? null : verifyUnsubscribeToken(params.t);

  if (!email) {
    return (
      <Shell title="This link doesn't work">
        <p>
          Some mail apps cut long links short, and then it stops working. Write to{" "}
          <a href={MAILTO} className="text-forest underline underline-offset-4">
            hello@jespermakes.com
          </a>{" "}
          with &quot;unsubscribe&quot; and I&apos;ll take you off by hand, the same day.
        </p>
      </Shell>
    );
  }

  return (
    <Shell title="Unsubscribe">
      <p>
        This stops the Workshop Letter going to <strong className="text-wood">{email}</strong>.
      </p>
      <form method="post" action="/api/newsletter/unsubscribe" className="pt-4">
        <input type="hidden" name="t" value={params.t} />
        <input type="hidden" name="from" value="page" />
        <button
          type="submit"
          className="rounded-lg bg-forest px-8 py-3 font-medium text-cream transition-colors hover:bg-forest-dark"
        >
          Unsubscribe
        </button>
      </form>
      <p className="pt-2 text-sm text-wood-light/70">One click and it&apos;s done. No login.</p>
    </Shell>
  );
}
