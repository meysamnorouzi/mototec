import Image from "next/image";
import Link from "next/link";

import { optionalContact, site } from "@/lib/site";
import type { Category } from "@/lib/types";

export function SiteFooter({ categories }: { categories: Category[] }) {
  const extras = [
    optionalContact.whatsapp ? { href: optionalContact.whatsapp, label: "واتساپ" } : null,
    optionalContact.instagram ? { href: optionalContact.instagram, label: "اینستاگرام" } : null,
    optionalContact.telegram ? { href: optionalContact.telegram, label: "تلگرام" } : null,
    optionalContact.email ? { href: `mailto:${optionalContact.email}`, label: optionalContact.email } : null,
  ].filter((item): item is { href: string; label: string } => item != null);

  return (
    <footer className="mt-auto border-t border-line bg-ink text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Image src="/logo.png" alt="" width={1001} height={627} className="h-12 w-auto brightness-0 invert" />
          <p className="mt-5 max-w-md text-sm leading-7 text-white/70">{site.description}</p>
        </div>
        <div>
          <p className="text-xs text-white/50">فروشگاه</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/shop" className="hover:text-white/70">
                همه محصولات
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category.id}>
                <Link href={`/shop/${category.slug}`} className="hover:text-white/70">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs text-white/50">تماس</p>
          <a href={`tel:${site.phoneTel}`} className="mt-4 block text-lg">
            {site.phoneDisplay}
          </a>
          {optionalContact.address ? <p className="mt-3 text-sm leading-7 text-white/70">{optionalContact.address}</p> : null}
          {optionalContact.hours ? <p className="mt-2 text-sm text-white/70">{optionalContact.hours}</p> : null}
          {extras.length > 0 ? (
            <ul className="mt-4 space-y-2 text-sm">
              {extras.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="hover:text-white/70">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4 text-xs text-white/50">
          <p>© {site.nameFa}</p>
          <p>{site.domain}</p>
        </div>
      </div>
    </footer>
  );
}
