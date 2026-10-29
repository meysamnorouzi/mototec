import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import Link from "next/link";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/lib/site";

import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazir",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.nameFa} | ${site.headline}`,
    template: `%s | ${site.nameFa}`,
  },
  description: site.description,
  applicationName: site.nameFa,
  authors: [{ name: site.nameFa, url: site.url }],
  creator: site.nameFa,
  publisher: site.nameFa,
  category: "shopping",
  keywords: [
    "موتوتک",
    "MotoTec",
    "دوربین ثبت وقایع",
    "دش‌کم",
    "اینترکام کلاه کاسکت",
    "بلوتوث موتور",
    "لوازم موتورسیکلت",
    "بلاگ موتوتک",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  alternates: { canonical: "/" },
  openGraph: {
    title: site.slogan,
    description: site.description,
    url: "/",
    siteName: site.nameFa,
    locale: "fa_IR",
    type: "website",
    images: [{ url: "/images/night-ride.jpg", width: 1200, height: 675, alt: site.nameFa }],
  },
  twitter: {
    card: "summary_large_image",
    title: site.slogan,
    description: site.description,
    images: ["/images/night-ride.jpg"],
  },
  formatDetection: { telephone: true, email: false, address: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Store",
        name: site.nameFa,
        alternateName: site.nameEn,
        url: site.url,
        image: `${site.url}/logo.jpg`,
        logo: `${site.url}/icon.png`,
        description: site.description,
        slogan: site.slogan,
        telephone: site.phoneTel,
        currenciesAccepted: "IRR",
        areaServed: "IR",
        inLanguage: "fa",
      },
      {
        "@type": "WebSite",
        name: site.nameFa,
        url: site.url,
        inLanguage: "fa",
        potentialAction: {
          "@type": "SearchAction",
          target: `${site.url}/shop?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
        >
          رفتن به محتوا
        </a>
        <SiteHeader />
        <main id="content" className="flex-1 pb-24 md:pb-0">
          {children}
        </main>
        <SiteFooter />
        <nav
          className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-ink/90 pb-[env(safe-area-inset-bottom)] text-white backdrop-blur-md md:hidden"
          aria-label="میانبر"
        >
          <ul className="grid grid-cols-4 text-center text-xs">
            <li>
              <Link href="/" className="block px-2 py-3 active:bg-white/10">
                خانه
              </Link>
            </li>
            <li>
              <Link href="/shop" className="block px-2 py-3 active:bg-white/10">
                فروشگاه
              </Link>
            </li>
            <li>
              <Link href="/blog" className="block px-2 py-3 active:bg-white/10">
                بلاگ
              </Link>
            </li>
            <li>
              <a href={`tel:${site.phoneTel}`} className="block px-2 py-3 active:bg-white/10">
                تماس
              </a>
            </li>
          </ul>
        </nav>
      </body>
    </html>
  );
}
