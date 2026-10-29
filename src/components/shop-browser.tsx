"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, type FormEvent } from "react";

import { ProductGrid } from "@/components/product-card";
import { browseProducts } from "@/lib/browse";
import { formatNumber } from "@/lib/format";
import type { Category, Product } from "@/lib/types";

const sorts = [
  { id: "new", label: "جدیدترین" },
  { id: "price-asc", label: "ارزان‌ترین" },
  { id: "price-desc", label: "گران‌ترین" },
  { id: "name", label: "نام" },
] as const;

type ShopSort = (typeof sorts)[number]["id"];

export function ShopBrowser({ categories, products }: { categories: Category[]; products: Product[] }) {
  const params = useSearchParams();
  const requested = params.get("sort");
  const sort: ShopSort = sorts.some((item) => item.id === requested) ? (requested as ShopSort) : "new";
  const page = Number(params.get("page") || "1");

  return (
    <ShopCatalog
      categories={categories}
      products={products}
      q={params.get("q")?.trim() ?? ""}
      sort={sort}
      page={Number.isFinite(page) ? page : 1}
    />
  );
}

export function ShopCatalog({
  categories,
  products,
  q = "",
  sort = "new",
  page = 1,
}: {
  categories: Category[];
  products: Product[];
  q?: string;
  sort?: ShopSort;
  page?: number;
}) {
  const router = useRouter();
  const list = useMemo(() => browseProducts(products, { search: q, sort, page }), [products, q, sort, page]);
  const chips = categories.flatMap((category) => [category, ...category.children]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const nextSort = String(data.get("sort") || "new");
    router.push(
      shopHref({
        q: String(data.get("q") || "").trim(),
        sort: sorts.some((item) => item.id === nextSort) ? nextSort : "new",
      }),
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <form
        key={`${q}:${sort}`}
        action="/shop"
        onSubmit={onSubmit}
        className="flex flex-col gap-2 rounded-3xl bg-panel p-3 shadow-[0_16px_40px_-30px_rgba(0,0,0,0.6)] sm:flex-row sm:rounded-full sm:p-2"
      >
        <label className="sr-only" htmlFor="q">
          جستجو
        </label>
        <input
          id="q"
          name="q"
          defaultValue={q}
          placeholder="نام، برند یا مدل"
          className="min-w-0 flex-1 rounded-full bg-transparent px-4 py-3 text-sm outline-none"
        />
        <label className="sr-only" htmlFor="sort">
          مرتب‌سازی
        </label>
        <select id="sort" name="sort" defaultValue={sort} className="rounded-full bg-paper px-4 py-3 text-sm">
          {sorts.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-full bg-ink px-5 py-3 text-sm text-white transition hover:scale-105">
          نمایش
        </button>
      </form>

      {chips.length > 0 ? (
        <ul className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {chips.map((category) => (
            <li key={category.id}>
              <Link
                href={`/shop/${category.slug}`}
                className="inline-flex shrink-0 rounded-full bg-paper px-4 py-2 text-sm transition active:scale-95"
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-8 text-sm text-graphite">{formatNumber(list.total)} محصول</p>
      <div className="mt-5">
        <ProductGrid products={list.items} />
      </div>
      <Pager page={list.page} totalPages={list.totalPages} q={q} sort={sort} />
    </div>
  );
}

function Pager({ page, totalPages, q, sort }: { page: number; totalPages: number; q: string; sort: string }) {
  if (totalPages <= 1) return null;

  return (
    <nav className="mt-8 flex items-center justify-between text-sm" aria-label="صفحه‌بندی">
      {page > 1 ? <Link href={shopHref({ q, sort, page: page - 1 })}>صفحه قبل</Link> : <span />}
      <span className="text-graphite">
        {formatNumber(page)} از {formatNumber(totalPages)}
      </span>
      {page < totalPages ? <Link href={shopHref({ q, sort, page: page + 1 })}>صفحه بعد</Link> : <span />}
    </nav>
  );
}

function shopHref({ q, sort, page = 1 }: { q?: string; sort?: string; page?: number }) {
  const query = new URLSearchParams();
  if (q) query.set("q", q);
  if (sort && sort !== "new") query.set("sort", sort);
  if (page > 1) query.set("page", String(page));
  const value = query.toString();
  return value ? `/shop?${value}` : "/shop";
}
