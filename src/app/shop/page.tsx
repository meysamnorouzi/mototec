import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { ProductGrid } from "@/components/product-card";
import { formatNumber } from "@/lib/format";
import { getCategoryTree, queryProducts } from "@/lib/products";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "فروشگاه",
  description: "محصولات موتوتک: دوربین ثبت وقایع خودرو و تجهیزات کلاه کاسکت.",
  path: "/shop",
  image: "/images/night-ride.jpg",
});

const sorts = [
  { id: "new", label: "جدیدترین" },
  { id: "price-asc", label: "ارزان‌ترین" },
  { id: "price-desc", label: "گران‌ترین" },
  { id: "name", label: "نام" },
] as const;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; page?: string }>;
}) {
  const params = await searchParams;
  const sort = sorts.some((item) => item.id === params.sort) ? (params.sort as (typeof sorts)[number]["id"]) : "new";
  const page = Number(params.page || "1");
  const [categories, list] = await Promise.all([
    getCategoryTree(),
    queryProducts({
      search: params.q,
      sort,
      page: Number.isFinite(page) ? page : 1,
    }),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="فروشگاه"
        title="محصولات موتوتک"
        description="فقط دسته‌هایی نشان داده می‌شوند که محصول دارند. با اضافه شدن کالا در وردپرس، فهرست همین‌جا بزرگ‌تر می‌شود."
        image="/images/night-ride.jpg"
      />
      <div className="mx-auto max-w-6xl px-5 py-12">

      <form action="/shop" className="flex flex-col gap-2 rounded-3xl bg-panel p-3 shadow-[0_16px_40px_-30px_rgba(0,0,0,0.6)] sm:flex-row sm:rounded-full sm:p-2">
        <label className="sr-only" htmlFor="q">
          جستجو
        </label>
        <input
          id="q"
          name="q"
          defaultValue={params.q || ""}
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

      {categories.length > 0 ? (
        <ul className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {categories.flatMap((category) => [category, ...category.children]).map((category) => (
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
      <Pager page={list.page} totalPages={list.totalPages} q={params.q} sort={sort} />
    </div>
    </>
  );
}

function Pager({
  page,
  totalPages,
  q,
  sort,
}: {
  page: number;
  totalPages: number;
  q?: string;
  sort: string;
}) {
  if (totalPages <= 1) return null;
  const href = (next: number) => {
    const query = new URLSearchParams();
    if (q) query.set("q", q);
    if (sort !== "new") query.set("sort", sort);
    query.set("page", String(next));
    return `/shop?${query.toString()}`;
  };

  return (
    <nav className="mt-8 flex items-center justify-between text-sm" aria-label="صفحه‌بندی">
      {page > 1 ? <Link href={href(page - 1)}>صفحه قبل</Link> : <span />}
      <span className="text-graphite">
        {formatNumber(page)} از {formatNumber(totalPages)}
      </span>
      {page < totalPages ? <Link href={href(page + 1)}>صفحه بعد</Link> : <span />}
    </nav>
  );
}
