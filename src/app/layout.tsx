import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import { SessionProvider } from "next-auth/react";
import { Analytics } from "@vercel/analytics/react";
import { auth } from "@/lib/auth";
import { SiteJsonLd } from "@/components/site-json-ld";
import { MobileNav } from "@/components/mobile-nav";
import { ConditionalChrome } from "@/components/conditional-chrome";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jesper Makes — Build something real",
  description:
    "Danish woodworker and maker. Real build guides, honest measurements, no shortcuts.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/favicon-180.png", sizes: "180x180", type: "image/png" },
    ],
  },
  other: {
    "impact-site-verification": "ff0ac512-8cf5-48f8-8237-3f0a69250e76",
  },
};

async function Header() {
  const session = await auth();

  return (
    <header className="border-b border-wood/10">
      <nav className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="Jesper Makes Workshop" width={52} height={52} className="rounded-full" />
        </Link>
        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8 text-sm font-sans">
          <Link
            href="/shop"
            className="text-wood-light hover:text-forest transition-colors"
          >
            Shop
          </Link>
          <div className="relative group">
            <Link
              href="/tools"
              className="text-wood-light hover:text-forest transition-colors"
            >
              Tools & Links
            </Link>
            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
              <div className="bg-cream border border-wood/10 rounded-xl shadow-lg py-2 w-52">
                {[
                  { title: "Festool", slug: "festool", icon: "⚡" },
                  { title: "Power Tools", slug: "power-tools", icon: "🔨" },
                  { title: "Hand Tools", slug: "hand-tools", icon: "✋" },
                  { title: "Finishing", slug: "finishing", icon: "🎨" },
                  { title: "3D Printing & Laser", slug: "3d-printing-laser", icon: "🖨️" },
                  { title: "Workshop Essentials", slug: "workshop-essentials", icon: "🔧" },
                  { title: "Office & YouTube Gear", slug: "office-youtube", icon: "📷" },
                  { title: "Gardening & Outdoors", slug: "gardening-outdoors", icon: "🌿" },
                ].map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/tools/category/${cat.slug}`}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-wood-light hover:text-forest hover:bg-wood/5 transition-colors"
                  >
                    <span className="text-base">{cat.icon}</span>
                    {cat.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="relative group">
            <span className="text-wood-light hover:text-forest transition-colors cursor-pointer">
              Creator Tools
            </span>
            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
              <div className="bg-cream border border-wood/10 rounded-xl shadow-lg py-2 w-52">
                <Link
                  href="/title-lab"
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-wood-light hover:text-forest hover:bg-wood/5 transition-colors"
                >
                  <span className="text-base">🧪</span>
                  Title Lab
                </Link>
                <Link
                  href="/storyteller"
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-wood-light hover:text-forest hover:bg-wood/5 transition-colors"
                >
                  <span className="text-base">🎬</span>
                  Storyteller Engine
                </Link>
                <Link
                  href="/box-joint-jig"
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-wood-light hover:text-forest hover:bg-wood/5 transition-colors"
                >
                  <span className="text-base">🧰</span>
                  Box Joint Jig
                </Link>
                <Link
                  href="/cone-lamp"
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-wood-light hover:text-forest hover:bg-wood/5 transition-colors"
                >
                  <span className="text-base">💡</span>
                  Cone Lamp
                </Link>
              </div>
            </div>
          </div>
          <Link
            href="/workbench"
            className="text-wood-light hover:text-forest transition-colors"
          >
            Workbench
          </Link>
          <Link
            href="/blog"
            className="text-wood-light hover:text-forest transition-colors"
          >
            Blog
          </Link>
          <Link
            href="/about"
            className="text-wood-light hover:text-forest transition-colors"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="text-wood-light hover:text-forest transition-colors"
          >
            Contact
          </Link>
          {session?.user ? (
            <Link
              href="/account"
              className="text-forest hover:text-forest-dark transition-colors font-medium"
            >
              {session.user.name?.split(" ")[0] || "Account"}
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-wood-light hover:text-forest transition-colors"
            >
              Sign in
            </Link>
          )}
          <div className="flex items-center gap-3">
            <a href="https://youtube.com/@jespermakes" target="_blank" rel="noopener noreferrer" className="text-wood-light hover:text-forest transition-colors" aria-label="YouTube">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z"/></svg>
            </a>
            <a href="https://instagram.com/jespermakes" target="_blank" rel="noopener noreferrer" className="text-wood-light hover:text-forest transition-colors" aria-label="Instagram">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069ZM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z"/></svg>
            </a>
            <a href="https://tiktok.com/@jespermakes" target="_blank" rel="noopener noreferrer" className="text-wood-light hover:text-forest transition-colors" aria-label="TikTok">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07Z"/></svg>
            </a>
          </div>
        </div>
        {/* Mobile nav */}
        <MobileNav userName={session?.user?.name?.split(" ")[0]} />
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-wood/10 mt-auto">
      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-wood-light/60 font-sans">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Jesper Makes Workshop" width={32} height={32} className="rounded-full opacity-60" />
          <p>&copy; {new Date().getFullYear()} Jesper Makes Workshop</p>
        </div>
        <div className="flex flex-col items-center sm:items-end gap-3">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link href="/shop" className="hover:text-forest transition-colors">
              Shop
            </Link>
            <Link href="/tools" className="hover:text-forest transition-colors">
              Tools
            </Link>
            <Link href="/blog" className="hover:text-forest transition-colors">
              Blog
            </Link>
            <Link href="/about" className="hover:text-forest transition-colors">
              About
            </Link>
            <Link href="/contact" className="hover:text-forest transition-colors">
              Contact
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-wood-light/40">
            <Link href="/refund" className="hover:text-forest transition-colors">
              Refund Policy
            </Link>
            <Link href="/privacy" className="hover:text-forest transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-forest transition-colors">
              Terms
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://youtube.com/@jespermakes" target="_blank" rel="noopener noreferrer" className="hover:text-forest transition-colors" aria-label="YouTube">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z"/></svg>
            </a>
            <a href="https://instagram.com/jespermakes" target="_blank" rel="noopener noreferrer" className="hover:text-forest transition-colors" aria-label="Instagram">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069ZM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z"/></svg>
            </a>
            <a href="https://tiktok.com/@jespermakes" target="_blank" rel="noopener noreferrer" className="hover:text-forest transition-colors" aria-label="TikTok">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07Z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="font-sans min-h-screen flex flex-col antialiased">
        <SiteJsonLd />
        <SessionProvider session={session}>
          <ConditionalChrome header={<Header />} footer={<Footer />}>
            {children}
          </ConditionalChrome>
          <Analytics />
        </SessionProvider>
      </body>
    </html>
  );
}
