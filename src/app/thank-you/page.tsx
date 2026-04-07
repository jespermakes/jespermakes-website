import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thank you! — Jesper Makes",
};

const PRODUCT_INFO: Record<
  string,
  { name: string; hasDownload: boolean }
> = {
  "pallet-starter-kit": {
    name: "Pallet Builder\u2019s Starter Kit",
    hasDownload: false,
  },
  "workshop-wall-charts": {
    name: "Jesper\u2019s Cheat Sheets",
    hasDownload: true,
  },
  "cone-lamp-laser": {
    name: "Cone Lamp Laser File",
    hasDownload: true,
  },
  "cone-lamp-3dprint": {
    name: "Cone Lamp 3D Print Files",
    hasDownload: true,
  },
};

export default async function ThankYou({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const { product: productKey } = await searchParams;
  const product = productKey ? PRODUCT_INFO[productKey] : undefined;

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

        {product ? (
          <>
            <p className="text-wood-light/80 text-lg leading-relaxed mb-2">
              Your purchase of <strong>{product.name}</strong> is complete.
            </p>
            {product.hasDownload ? (
              <p className="text-wood-light/60 text-sm mt-2">
                Sign in to your account to download your files.
              </p>
            ) : (
              <p className="text-wood-light/60 text-sm mt-2">
                We will email you soon with your files.
              </p>
            )}
          </>
        ) : (
          <>
            <p className="text-wood-light/80 text-lg leading-relaxed mb-2">
              Your purchase is complete.
            </p>
            <p className="text-wood-light/60 text-sm">
              Head to your account to download your files.
            </p>
          </>
        )}
      </div>

      {/* Account prompt */}
      <div className="bg-wood/5 rounded-xl p-6 mt-8 mb-8 max-w-md mx-auto">
        <p className="text-wood font-serif text-lg mb-2">Get your downloads</p>
        <p className="text-wood-light/70 text-sm mb-4">
          Create an account or sign in to download your files anytime.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/signup"
            className="inline-block bg-amber text-cream px-6 py-2.5 rounded-lg font-medium hover:bg-amber-dark transition-colors text-sm"
          >
            Create account
          </Link>
          <Link
            href="/login"
            className="inline-block bg-wood text-cream px-6 py-2.5 rounded-lg font-medium hover:bg-wood/90 transition-colors text-sm"
          >
            Sign in
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <Link
          href="/shop"
          className="inline-block bg-amber hover:bg-amber-dark text-cream px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Back to shop
        </Link>
        <a
          href="https://youtube.com/@jespermakes"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block border border-wood/20 hover:border-amber text-wood px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Watch build videos
        </a>
      </div>
    </div>
  );
}
