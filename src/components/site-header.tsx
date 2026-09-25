"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { site } from "@/lib/site";
import type { Category } from "@/lib/types";

type MenuProduct = {
  id: number;
  slug: string;
  name: string;
  categorySlugs: string[];
};

export function SiteHeader({ categories, products }: { categories: Category[]; products: MenuProduct[] }) {
  const [open, setOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(categories[0]?.id ?? null);
  const active = categories.find((category) => category.id === activeId) ?? categories[0];

  function productsIn(slug: string) {
    return products.filter((product) => product.categorySlugs.includes(slug));
  }

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div className="relative mx-auto flex max-w-6xl items-center gap-3 border-b border-line bg-paper px-4 py-2 text-ink shadow-sm md:mt-3 md:rounded-full md:border md:px-5">
        <Link href="/" className="shrink-0" aria-label="موتوتک" onClick={() => setOpen(false)}>
          <Image src="/logo.png" alt="موتوتک" width={1001} height={627} priority className="h-9 w-auto md:h-11" />
        </Link>

        <nav className="pointer-events-none absolute inset-0 hidden items-center justify-center md:flex" aria-label="اصلی">
          <div className="pointer-events-auto flex items-center gap-8 text-sm">
          <div
            className="relative"
            onMouseEnter={() => {
              setShopOpen(true);
              setActiveId((current) => current ?? categories[0]?.id ?? null);
            }}
            onMouseLeave={() => setShopOpen(false)}
          >
            <Link href="/shop" className="inline-flex py-3 hover:text-graphite" aria-expanded={shopOpen}>
              فروشگاه
            </Link>
            {shopOpen && categories.length > 0 ? (
              <div className="absolute top-full left-1/2 z-30 w-[40rem] -translate-x-1/2 pt-3">
                <div className="menu-in overflow-hidden rounded-2xl border border-line bg-panel text-ink shadow-2xl">
                  <div className="grid grid-cols-[13rem_1fr]">
                    <ul className="border-e border-line bg-paper p-2">
                      <li>
                        <Link href="/shop" className="block rounded-xl px-3 py-2 text-graphite hover:bg-panel hover:text-ink">
                          همه محصولات
                        </Link>
                      </li>
                      {categories.map((category) => (
                        <li key={category.id} onMouseEnter={() => setActiveId(category.id)}>
                          <Link
                            href={`/shop/${category.slug}`}
                            className={`mt-1 block rounded-xl px-3 py-2.5 ${active?.id === category.id ? "bg-ink text-white" : "hover:bg-panel"}`}
                          >
                            {category.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <div className="p-4">
                      {active ? <ShopFlyout category={active} productsIn={productsIn} /> : null}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          <Link href="/about" className="hover:text-graphite">
            درباره ما
          </Link>
          <Link href="/contact" className="hover:text-graphite">
            تماس با ما
          </Link>
          </div>
        </nav>

        <a
          href={`tel:${site.phoneTel}`}
          className="ms-auto hidden rounded-full bg-ink px-4 py-2 text-sm text-white transition hover:scale-105 md:inline-flex"
        >
          {site.phoneDisplay}
        </a>

        <button
          type="button"
          className="ms-auto rounded-full border border-ink px-4 py-2 text-sm md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "بستن" : "منو"}
        </button>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          className="menu-in max-h-[calc(100svh-8.5rem)] overflow-y-auto border-b border-line bg-paper px-4 py-3 text-ink md:hidden"
          aria-label="موبایل"
        >
          <ul className="space-y-1 text-base">
            <li>
              <Link href="/shop" onClick={() => setOpen(false)} className="block rounded-2xl px-3 py-3 active:bg-ink/5">
                فروشگاه
              </Link>
              <ul className="space-y-1 ps-3">
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link href={`/shop/${category.slug}`} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2.5 active:bg-ink/5">
                      {category.name}
                    </Link>
                    <ProductBranch category={category} products={products} onNavigate={() => setOpen(false)} />
                  </li>
                ))}
              </ul>
            </li>
            <li>
              <Link href="/about" onClick={() => setOpen(false)} className="block rounded-2xl px-3 py-3 active:bg-ink/5">
                درباره ما
              </Link>
            </li>
            <li>
              <Link href="/contact" onClick={() => setOpen(false)} className="block rounded-2xl px-3 py-3 active:bg-ink/5">
                تماس با ما
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}

function ShopFlyout({
  category,
  productsIn,
}: {
  category: Category;
  productsIn: (slug: string) => MenuProduct[];
}) {
  if (category.children.length > 0) {
    return (
      <div>
        <p className="text-xs text-graphite">{category.name}</p>
        <ul className="mt-3 space-y-4">
          {category.children.map((child) => (
            <li key={child.id}>
              <Link href={`/shop/${child.slug}`} className="text-sm font-medium hover:text-graphite">
                {child.name}
              </Link>
              <ul className="mt-1">
                {productsIn(child.slug).map((product) => (
                  <li key={product.id}>
                    <Link href={`/product/${product.slug}`} className="block rounded-lg px-2 py-1.5 text-sm text-graphite hover:bg-paper hover:text-ink">
                      {product.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const items = productsIn(category.slug);
  if (items.length === 0) return <p className="text-sm text-graphite">محصولی در این دسته نیست</p>;

  return (
    <div>
      <p className="text-xs text-graphite">{category.name}</p>
      <ul className="mt-3">
        {items.map((product) => (
          <li key={product.id}>
            <Link href={`/product/${product.slug}`} className="block rounded-lg px-2 py-2 text-sm hover:bg-paper">
              {product.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProductBranch({
  category,
  products,
  onNavigate,
}: {
  category: Category;
  products: MenuProduct[];
  onNavigate: () => void;
}) {
  const direct = products.filter((product) => product.categorySlugs.includes(category.slug));
  const owned = category.children.length
    ? []
    : direct.filter((product) => !category.children.some((child) => product.categorySlugs.includes(child.slug)));

  return (
    <ul className="mt-2 space-y-1 border-s border-line ps-3 text-sm text-graphite">
      {category.children.map((child) => (
        <li key={child.id}>
          <Link href={`/shop/${child.slug}`} onClick={onNavigate} className="block py-2">
            {child.name}
          </Link>
          <ul className="space-y-1 ps-3">
            {products
              .filter((product) => product.categorySlugs.includes(child.slug))
              .map((product) => (
                <li key={product.id}>
                  <Link href={`/product/${product.slug}`} onClick={onNavigate} className="block py-1.5 text-ink">
                    {product.name}
                  </Link>
                </li>
              ))}
          </ul>
        </li>
      ))}
      {(category.children.length ? [] : owned.length ? owned : direct).map((product) => (
        <li key={product.id}>
          <Link href={`/product/${product.slug}`} onClick={onNavigate} className="block py-1.5 text-ink">
            {product.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
