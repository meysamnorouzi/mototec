import Link from "next/link";

import { ProductGrid } from "@/components/product-card";
import { categoryImage } from "@/lib/seo";
import { getCategoryTree, queryProducts } from "@/lib/products";
import { site } from "@/lib/site";

export default async function HomePage() {
  const [categories, list] = await Promise.all([
    getCategoryTree(),
    queryProducts({ perPage: 6 }),
  ]);

  return (
    <>
      <section className="relative isolate min-h-[100svh] overflow-hidden bg-ink text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/night-ride.jpg" alt="" className="drift absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/20" />
        <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-5 pb-28 pt-24 md:pb-16">
          <p className="rise text-xs tracking-[0.38em] text-white/70">{site.nameEn.toUpperCase()}</p>
          <h1 className="rise mt-4 max-w-3xl text-4xl font-extrabold leading-[1.2] sm:text-5xl md:text-7xl" style={{ animationDelay: "90ms" }}>
            هر چیزی که
            <span className="mt-2 block">موتورت نیاز داره</span>
          </h1>
          <p className="rise mt-5 max-w-xl text-sm leading-8 text-white/80 sm:text-base" style={{ animationDelay: "160ms" }}>
            {site.description}
          </p>
          <div className="rise mt-8 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: "220ms" }}>
            <Link href="/shop" className="rounded-full bg-white px-6 py-3 text-center text-sm text-ink transition active:scale-95">
              ورود به فروشگاه
            </Link>
            <a href={`tel:${site.phoneTel}`} className="rounded-full border border-white/40 px-6 py-3 text-center text-sm backdrop-blur-md transition active:bg-white/10">
              {site.phoneDisplay}
            </a>
          </div>
        </div>
      </section>

      <div className="overflow-hidden border-y border-white/10 bg-ink py-4 text-sm text-white/70">
        <div className="marquee flex w-max gap-10">
          {Array.from({ length: 2 }).map((_, copy) => (
            <p key={copy} className="flex gap-10">
              {["AZDOME", "LINGDU", "MAXTO", "دوربین ثبت وقایع", "اینترکام", "کلاه کاسکت"].map((item) => (
                <span key={`${copy}-${item}`}>{item}</span>
              ))}
            </p>
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-5 sm:py-16">
        <div className="mb-8 flex items-end justify-between gap-4 border-t border-ink/15 pt-8">
          <div>
            <p className="text-xs text-graphite">دسته‌ها</p>
            <h2 className="mt-2 text-3xl font-semibold">خرید بر اساس کاربرد</h2>
          </div>
          <Link href="/shop" className="text-sm underline decoration-metal underline-offset-4">
            همه محصولات
          </Link>
        </div>
        <ul className="grid items-stretch gap-5 md:grid-cols-2">
          {categories.map((category, index) => (
            <li key={category.id} className="rise h-full" style={{ animationDelay: `${index * 120}ms` }}>
              <Link href={`/shop/${category.slug}`} className="group relative flex h-full min-h-64 flex-col overflow-hidden rounded-[1.4rem] sm:min-h-80 sm:rounded-[1.8rem]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={categoryImage(category.slug)} alt="" className="shot absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />
                <div className="relative mt-auto flex min-h-64 flex-1 flex-col justify-end p-5 text-white sm:min-h-80 sm:p-6">
                  <h3 className="text-2xl font-semibold sm:text-3xl">{category.name}</h3>
                  <p className="mt-2 max-w-md text-sm leading-7 text-white/80">{category.description}</p>
                  {category.children.length > 0 ? (
                    <p className="mt-4 text-sm text-white/70">{category.children.map((child) => child.name).join(" · ")}</p>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-8 pb-20">
        <div className="mb-8 border-t border-ink/15 pt-8">
          <p className="text-xs text-graphite">محصولات</p>
          <h2 className="mt-2 text-3xl font-semibold">الان در موتوتک</h2>
        </div>
        <ProductGrid products={list.items} featured />
      </section>
    </>
  );
}
