import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thank you! — Jesper Makes",
};

export default function ThankYou() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-24 md:py-32 text-center">
      <div className="mb-8">
        <div className="w-16 h-16 bg-amber/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-amber"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>
        <h1 className="font-serif text-4xl md:text-5xl text-wood mb-4">
          Thank you!
        </h1>
        <p className="text-wood-light/80 text-lg leading-relaxed mb-2">
          Your Pallet Builder&apos;s Starter Kit is on its way to your inbox.
        </p>
        <p className="text-wood-light/60 text-sm">
          Check your email for the download link. If you don&apos;t see it
          within a few minutes, check your spam folder.
        </p>
      </div>

      <div className="border border-wood/10 rounded-xl p-8 mb-8">
        <h2 className="font-serif text-xl text-wood mb-3">
          What happens next?
        </h2>
        <ol className="text-wood-light/70 text-left space-y-3 text-sm list-decimal list-inside">
          <li>Download and open the PDF bundle</li>
          <li>Pick your first build (I recommend the simple table)</li>
          <li>Find some pallet wood — most places give it away free</li>
          <li>Start building. Make mistakes. Fix them. That&apos;s the process.</li>
        </ol>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <a
          href="https://youtube.com/@jespermakes"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-amber hover:bg-amber-dark text-cream px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Watch build videos
        </a>
        <Link
          href="/"
          className="inline-block border border-wood/20 hover:border-amber text-wood px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
