"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

export default function NewsletterPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      setState("error");
      return;
    }
    setState("loading");
    setErrorMessage("");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMessage(
          data.error || "Something went wrong. Please try again."
        );
        setState("error");
        return;
      }
      setState("success");
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setState("error");
    }
  }

  return (
    <main className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-12 md:pt-24 md:pb-16">
        <p className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40 mb-6">
          THE NEWSLETTER
        </p>
        <h1 className="font-serif text-4xl md:text-6xl leading-tight text-wood mb-6 max-w-3xl">
          One email. Once in a while. Worth reading.
        </h1>
        <p className="text-lg md:text-xl text-wood-light/70 max-w-2xl leading-relaxed mb-10">
          Join 3,300+ makers who get the behind-the-scenes on what I&apos;m
          building, what I&apos;m learning, and what&apos;s coming next on
          the channel. No spam, no upsells, and you can unsubscribe any
          time.
        </p>

        {/* Signup form */}
        <div className="bg-white/50 border border-wood/[0.06] rounded-2xl p-6 md:p-8 max-w-xl">
          {state === "success" ? (
            <div>
              <p className="text-[10px] font-bold tracking-[0.15em] text-forest mb-3">
                YOU&apos;RE IN
              </p>
              <h2 className="font-serif text-2xl text-wood mb-3">
                Thanks for subscribing.
              </h2>
              <p className="text-wood-light/80 leading-relaxed mb-4">
                Check your inbox for a confirmation. If it doesn&apos;t
                arrive within a few minutes, have a look in your spam
                folder and mark it as not-spam so the next one lands
                where it should.
              </p>
              <p className="text-wood-light/80 leading-relaxed">
                Go build something.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <label
                htmlFor="newsletter-email"
                className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40 mb-2 block"
              >
                YOUR EMAIL
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (state === "error") setState("idle");
                }}
                placeholder="you@example.com"
                disabled={state === "loading"}
                className="w-full bg-white border border-wood/15 rounded-xl px-4 py-3 text-wood placeholder:text-wood-light/30 focus:outline-none focus:border-forest/60 mb-3"
              />
              {state === "error" && errorMessage ? (
                <p className="text-sm text-red-700 mb-3">{errorMessage}</p>
              ) : null}
              <button
                type="submit"
                disabled={state === "loading"}
                className="w-full bg-wood text-cream rounded-xl py-3 font-semibold hover:bg-wood-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {state === "loading" ? "Subscribing..." : "Subscribe"}
              </button>
              <p className="text-xs text-wood-light/40 mt-4 leading-relaxed">
                I&apos;ll only use your email to send the newsletter. No
                sharing, no selling, no surprise marketing emails. One-click
                unsubscribe in every email.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* What you get */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-t border-wood/10">
        <p className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40 mb-4">
          WHAT YOU GET
        </p>
        <h2 className="font-serif text-3xl md:text-4xl text-wood mb-10 max-w-3xl">
          Four things, delivered roughly once a month.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white/50 border border-wood/[0.06] rounded-2xl p-6">
            <p className="text-[10px] font-bold tracking-[0.15em] text-forest mb-3">
              01 &nbsp; BEHIND THE SCENES
            </p>
            <h3 className="font-serif text-xl text-wood mb-3">
              The story behind the videos
            </h3>
            <p className="text-wood-light/80 leading-relaxed">
              The honest version of what happened during a build. What
              broke. What I cut from the final video. Why the idea worked
              or didn&apos;t. The stuff that doesn&apos;t fit into twelve
              edited minutes.
            </p>
          </div>

          <div className="bg-white/50 border border-wood/[0.06] rounded-2xl p-6">
            <p className="text-[10px] font-bold tracking-[0.15em] text-forest mb-3">
              02 &nbsp; FIRST LOOK
            </p>
            <h3 className="font-serif text-xl text-wood mb-3">
              New tools and downloads, first
            </h3>
            <p className="text-wood-light/80 leading-relaxed">
              When I ship something new on the site, newsletter subscribers
              see it before anyone else. Occasionally there&apos;s something
              exclusive to the list that doesn&apos;t get a public launch
              at all.
            </p>
          </div>

          <div className="bg-white/50 border border-wood/[0.06] rounded-2xl p-6">
            <p className="text-[10px] font-bold tracking-[0.15em] text-forest mb-3">
              03 &nbsp; LONGER THOUGHTS
            </p>
            <h3 className="font-serif text-xl text-wood mb-3">
              Things that don&apos;t fit in a video
            </h3>
            <p className="text-wood-light/80 leading-relaxed">
              Writing about craft, materials, storytelling, and the weird
              business of being a woodworker on the internet. Less
              polished than a video. More honest because of it.
            </p>
          </div>

          <div className="bg-white/50 border border-wood/[0.06] rounded-2xl p-6">
            <p className="text-[10px] font-bold tracking-[0.15em] text-forest mb-3">
              04 &nbsp; SHOP & SUBSCRIBER DEALS
            </p>
            <h3 className="font-serif text-xl text-wood mb-3">
              Quiet discounts, early access
            </h3>
            <p className="text-wood-light/80 leading-relaxed">
              When new products drop in the shop, subscribers hear first.
              Occasionally a subscriber-only discount code. No pressure,
              no fake urgency, just a head start if you want one.
            </p>
          </div>
        </div>
      </section>

      {/* What you don't get */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-t border-wood/10">
        <p className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40 mb-4">
          WHAT YOU DON&apos;T GET
        </p>
        <h2 className="font-serif text-3xl md:text-4xl text-wood mb-10 max-w-3xl">
          Things I promise not to do.
        </h2>

        <div className="space-y-5 text-lg text-wood-light/80 leading-relaxed max-w-2xl">
          <p>
            <span className="text-wood font-semibold">Daily emails.</span>{" "}
            Once a month is the target. Sometimes two weeks, sometimes
            six. Never more than that.
          </p>
          <p>
            <span className="text-wood font-semibold">Manufactured
            urgency.</span> No fake countdowns. No &quot;last chance&quot;
            emails when there&apos;s nothing actually ending.
          </p>
          <p>
            <span className="text-wood font-semibold">Your email going
            anywhere.</span> I don&apos;t share, sell, or rent the list.
            It&apos;s hosted on Resend, secured with the usual boring
            industry stuff, and you can delete your subscription in one
            click any time.
          </p>
          <p>
            <span className="text-wood font-semibold">Filler.</span> If I
            don&apos;t have something worth sending, I don&apos;t send
            one. An empty-calorie email just to &quot;stay top of
            mind&quot; is exactly the kind of newsletter I unsubscribe
            from, and I won&apos;t write one.
          </p>
        </div>
      </section>

      {/* Social proof / closer */}
      <section className="max-w-3xl mx-auto px-6 py-16 border-t border-wood/10">
        <div className="bg-forest/10 border border-forest/20 rounded-2xl p-8">
          <p className="text-[10px] font-bold tracking-[0.15em] text-forest mb-3">
            A QUICK NOTE
          </p>
          <h2 className="font-serif text-2xl md:text-3xl text-wood mb-4">
            If you&apos;re reading this from a video description, thanks.
          </h2>
          <p className="text-wood-light/80 leading-relaxed mb-4">
            YouTube gives me your attention for ten or twelve minutes at a
            time. The newsletter lets me keep the conversation going
            when I actually have something to say, not when an algorithm
            decides I need to post.
          </p>
          <p className="text-wood-light/80 leading-relaxed">
            If that sounds like your kind of thing, the signup form is at
            the top of this page. If not, no hard feelings. Go watch
            something on the channel instead.
          </p>
        </div>
      </section>

      {/* Back to the top CTA */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-t border-wood/10 text-center">
        <p className="text-wood-light/60 mb-4">Ready to subscribe?</p>
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="inline-block bg-wood text-cream rounded-xl px-6 py-3 font-semibold hover:bg-wood-light transition-colors"
        >
          Back to the signup form →
        </a>
        <p className="mt-8 text-sm text-wood-light/40">
          Not interested in email? Find me on{" "}
          <a
            href="https://www.youtube.com/c/JesperMakes"
            target="_blank"
            rel="noopener noreferrer"
            className="text-forest hover:underline"
          >
            YouTube
          </a>{" "}
          or browse the{" "}
          <Link href="/blog" className="text-forest hover:underline">
            blog
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
