import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
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
};

function Header() {
  return (
    <header className="border-b border-wood/10">
      <nav className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="Jesper Makes Workshop" width={52} height={52} className="rounded-full" />
        </Link>
        <div className="flex items-center gap-8 text-sm font-sans">
          <Link
            href="/shop"
            className="text-wood-light hover:text-amber transition-colors"
          >
            Shop
          </Link>
          <Link
            href="/about"
            className="text-wood-light hover:text-amber transition-colors"
          >
            About
          </Link>
          <a
            href="https://youtube.com/@jespermakes"
            target="_blank"
            rel="noopener noreferrer"
            className="text-wood-light hover:text-amber transition-colors"
          >
            YouTube
          </a>
        </div>
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
        <div className="flex items-center gap-6">
          <a
            href="https://youtube.com/@jespermakes"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-amber transition-colors"
          >
            YouTube
          </a>
          <Link href="/shop" className="hover:text-amber transition-colors">
            Shop
          </Link>
          <Link href="/about" className="hover:text-amber transition-colors">
            About
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="font-sans min-h-screen flex flex-col antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
