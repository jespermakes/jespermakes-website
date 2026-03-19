import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — Jesper Makes",
  description:
    "Get in touch with Jesper Makes — general inquiries, brand collaborations, press, and more.",
};

export default function Contact() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
      {/* Header */}
      <div className="max-w-2xl mb-16">
        <h1 className="font-serif text-4xl md:text-5xl text-wood mb-4">
          Get in touch
        </h1>
        <p className="text-wood-light/80 text-lg leading-relaxed">
          Whether you want to say hi, ask about a build, or talk business —
          here&apos;s how to reach me.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 md:gap-16">
        {/* General inquiries */}
        <div className="space-y-12">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-amber"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                  />
                </svg>
              </div>
              <h2 className="font-serif text-2xl text-wood">
                General inquiries
              </h2>
            </div>
            <p className="text-wood-light/70 leading-relaxed mb-4">
              Questions about a build, feedback on a video, or just want to say
              hi? This is the right place. I read every email — though I
              can&apos;t always respond to all of them.
            </p>
            <a
              href="mailto:hello@jespermakes.com"
              className="inline-block text-amber hover:text-amber-dark font-medium transition-colors text-lg"
            >
              hello@jespermakes.com
            </a>
          </section>

          {/* Sponsorships */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-amber"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  />
                </svg>
              </div>
              <h2 className="font-serif text-2xl text-wood">
                Sponsorships &amp; collaborations
              </h2>
            </div>
            <p className="text-wood-light/70 leading-relaxed mb-4">
              I&apos;m always open to hearing from brands that make sense for
              the workshop. I only work with products I&apos;d genuinely use
              myself — no exceptions. If you think there&apos;s a fit, I&apos;d
              love to hear your ideas.
            </p>
            <a
              href="mailto:sponsors@jespermakes.com"
              className="inline-block text-amber hover:text-amber-dark font-medium transition-colors text-lg"
            >
              sponsors@jespermakes.com
            </a>
            <div className="mt-4">
              <Link
                href="/sponsors"
                className="text-wood-light/60 hover:text-amber text-sm transition-colors"
              >
                More about working together →
              </Link>
            </div>
          </section>

          {/* Press */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-amber"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5"
                  />
                </svg>
              </div>
              <h2 className="font-serif text-2xl text-wood">
                Press &amp; media
              </h2>
            </div>
            <p className="text-wood-light/70 leading-relaxed mb-4">
              Writing an article or feature? Download logos, photos, and brand
              assets from the press kit. For interviews or specific requests,
              reach out directly.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="mailto:hello@jespermakes.com"
                className="inline-block text-amber hover:text-amber-dark font-medium transition-colors"
              >
                hello@jespermakes.com
              </a>
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              <Link
                href="/press-kit"
                className="inline-block border border-wood/20 hover:border-amber text-wood px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                📸 Press Kit — Photos &amp; Logos
              </Link>
              <Link
                href="/mediakit"
                className="inline-block border border-wood/20 hover:border-amber text-wood px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                📊 Media Kit — Audience Stats
              </Link>
            </div>
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-8">
          {/* Social */}
          <div className="bg-wood/5 rounded-xl p-8">
            <h3 className="font-serif text-xl text-wood mb-4">
              Find me online
            </h3>
            <p className="text-wood-light/60 text-sm mb-6">
              For quick questions, DMs are often faster than email.
            </p>
            <div className="space-y-4">
              <a
                href="https://youtube.com/@jespermakes"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-wood-light hover:text-amber transition-colors group"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z"/></svg>
                <span className="font-medium">YouTube</span>
                <span className="text-wood-light/40 text-sm">351K subscribers</span>
              </a>
              <a
                href="https://instagram.com/jespermakes"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-wood-light hover:text-amber transition-colors group"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069ZM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z"/></svg>
                <span className="font-medium">Instagram</span>
                <span className="text-wood-light/40 text-sm">@jespermakes</span>
              </a>
              <a
                href="https://tiktok.com/@jespermakes"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-wood-light hover:text-amber transition-colors group"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07Z"/></svg>
                <span className="font-medium">TikTok</span>
                <span className="text-wood-light/40 text-sm">@jespermakes</span>
              </a>
            </div>
          </div>

          {/* Location */}
          <div className="bg-wood/5 rounded-xl p-8">
            <h3 className="font-serif text-xl text-wood mb-3">
              Based in Denmark 🇩🇰
            </h3>
            <p className="text-wood-light/60 text-sm leading-relaxed">
              Working from my workshop in Denmark. Time zone is CET/CEST
              (Central European Time).
            </p>
          </div>

          {/* Response expectations */}
          <div className="bg-wood/5 rounded-xl p-8">
            <h3 className="font-serif text-xl text-wood mb-3">
              Response times
            </h3>
            <div className="space-y-3 text-sm text-wood-light/60">
              <div className="flex justify-between">
                <span>General emails</span>
                <span className="text-wood-light/80">I read all, reply when I can</span>
              </div>
              <div className="border-t border-wood/5" />
              <div className="flex justify-between">
                <span>Sponsorship inquiries</span>
                <span className="text-wood-light/80">Within 2 business days</span>
              </div>
              <div className="border-t border-wood/5" />
              <div className="flex justify-between">
                <span>Press requests</span>
                <span className="text-wood-light/80">Within 2 business days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
