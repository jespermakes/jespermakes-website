import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thank you! — Jesper Makes",
};

const PRODUCT_INFO: Record<
  string,
  { name: string; download?: { href: string; label: string } }
> = {
  "pallet-starter-kit": {
    name: "Pallet Builder\u2019s Starter Kit",
  },
  "cone-lamp-laser": {
    name: "Cone Lamp Laser File",
    download: {
      href: "/downloads/cone-lamp-laser.svg",
      label: "Download SVG file",
    },
  },
  "cone-lamp-3dprint": {
    name: "Cone Lamp 3D Print Files",
    download: {
      href: "/downloads/cone-lamp-3dprint.zip",
      label: "Download ZIP file",
    },
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
            {product.download ? (
              <div className="mt-6">
                <a
                  href={product.download.href}
                  download
                  className="inline-block bg-amber hover:bg-amber-dark text-cream px-8 py-4 rounded-lg font-medium text-lg transition-colors"
                >
                  {product.download.label}
                </a>
              </div>
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
              Head back to the shop to see all available products.
            </p>
          </>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-4 mt-8">
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
