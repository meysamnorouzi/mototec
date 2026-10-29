import Link from "next/link";

import { FaqList } from "@/components/faq-list";
import { PostGrid } from "@/components/post-card";
import { ProductGrid } from "@/components/product-card";
import { getAllPosts } from "@/lib/posts";
import { getAllProducts, getCategoryTree } from "@/lib/products";
import { categoryImage } from "@/lib/seo";
import { site } from "@/lib/site";
import {
  featuredProducts,
  homeFaqs,
  newestProducts,
  orderedStorefrontCategories,
  productBrands,
  whyMototec,
} from "@/lib/storefront";

export default async function HomePage() {
  const [tree, products, posts] = await Promise.all([
    getCategoryTree(),
    getAllProducts(),
    getAllPosts(),
  ]);

  const categories = orderedStorefrontCategories(tree);
  const bestsellers = featuredProducts(products, 8);
  const newest = newestProducts(products, 8);
  const brands = productBrands(products);
  const guides = posts.slice(0, 6);

  return (
    <>
      <section className="relative isolate min-h-[100svh] overflow-hidden bg-ink text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/night-ride.jpg" alt="" className="drift absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/25" />
        <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-5 pb-28 pt-24 md:pb-16">
          <p className="rise text-xs tracking-[0.38em] text-white/70">{site.nameEn.toUpperCase()}</p>
          <h1
            className="rise mt-4 max-w-3xl text-4xl font-extrabold leading-[1.2] sm:text-5xl md:text-7xl"
            style={{ animationDelay: "90ms" }}
          >
            {site.headline}
          </h1>
          <p
            className="rise mt-5 max-w-xl text-sm leading-8 text-white/80 sm:text-base"
            style={{ animationDelay: "160ms" }}
          >
            تجهیزات هوشمند، اکسسوری و لوازم کاربردی خودرو و موتورسیکلت
          </p>
          <div className="rise mt-8 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: "220ms" }}>
            <Link
              href="/shop"
              className="rounded-full bg-white px-6 py-3 text-center text-sm text-ink transition active:scale-95"
            >
              مشاهده محصولات
            </Link>
            <a
              href={`tel:${site.phoneTel}`}
              className="rounded-full border border-white/40 px-6 py-3 text-center text-sm backdrop-blur-md transition active:bg-white/10"
            >
              مشاوره · {site.phoneDisplay}
            </a>
          </div>
        </div>
      </section>

      <div className="overflow-hidden border-y border-white/10 bg-ink py-4 text-sm text-white/70">
        <div className="marquee flex w-max gap-10">
          {Array.from({ length: 2 }).map((_, copy) => (
            <p key={copy} className="flex gap-10">
              {[...brands, "دوربین ثبت وقایع", "اینترکام", "تجهیزات موتور"].map((item) => (
                <span key={`${copy}-${item}`}>{item}</span>
              ))}
            </p>
          ))}
        </div>
      </div>

      {categories.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-5 sm:py-16">
          <div className="mb-8 flex items-end justify-between gap-4 border-t border-ink/15 pt-8">
            <div>
              <p className="text-xs text-graphite">دسته‌بندی</p>
              <h2 className="mt-2 text-3xl font-semibold">خرید بر اساس کاربرد</h2>
            </div>
            <Link href="/shop" className="text-sm underline decoration-metal underline-offset-4">
              همه محصولات
            </Link>
          </div>
          <ul className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => (
              <li key={category.id} className="rise h-full" style={{ animationDelay: `${index * 90}ms` }}>
                <Link
                  href={`/shop/${category.slug}`}
                  className="group relative flex h-full min-h-56 flex-col overflow-hidden rounded-[1.4rem] sm:min-h-64"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={categoryImage(category.slug)}
                    alt=""
                    className="shot absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
                  <div className="relative mt-auto flex flex-1 flex-col justify-end p-5 text-white sm:p-6">
                    <h3 className="text-xl font-semibold sm:text-2xl">{category.name}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-7 text-white/80">{category.description}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {bestsellers.length > 0 ? (
        <section className="mx-auto max-w-6xl px-5 py-8">
          <div className="mb-8 flex items-end justify-between gap-4 border-t border-ink/15 pt-8">
            <div>
              <p className="text-xs text-graphite">فروشگاه</p>
              <h2 className="mt-2 text-3xl font-semibold">محصولات پرفروش</h2>
            </div>
            <Link href="/shop" className="text-sm underline decoration-metal underline-offset-4">
              مشاهده همه
            </Link>
          </div>
          <ProductGrid products={bestsellers} />
        </section>
      ) : null}

      {newest.length > 0 ? (
        <section className="mx-auto max-w-6xl px-5 py-8">
          <div className="mb-8 flex items-end justify-between gap-4 border-t border-ink/15 pt-8">
            <div>
              <p className="text-xs text-graphite">تازه‌ها</p>
              <h2 className="mt-2 text-3xl font-semibold">جدیدترین محصولات</h2>
            </div>
            <Link href="/shop?sort=new" className="text-sm underline decoration-metal underline-offset-4">
              همه جدیدها
            </Link>
          </div>
          <ProductGrid products={newest} />
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-8 border-t border-ink/15 pt-8">
          <p className="text-xs text-graphite">اعتماد</p>
          <h2 className="mt-2 text-3xl font-semibold">چرا MotoTec؟</h2>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {whyMototec.map((item, index) => (
            <li
              key={item.title}
              className="rise border border-line bg-panel p-5"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <p className="text-xs text-graphite">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-3 text-lg font-semibold leading-8">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-graphite">{item.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {brands.length > 0 ? (
        <section className="mx-auto max-w-6xl px-5 py-8">
          <div className="mb-8 border-t border-ink/15 pt-8">
            <p className="text-xs text-graphite">برندها</p>
            <h2 className="mt-2 text-3xl font-semibold">برندهای موجود</h2>
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {brands.map((brand) => (
              <li
                key={brand}
                className="flex min-h-24 items-center justify-center border border-line bg-panel px-4 py-6 text-lg font-semibold tracking-wide"
              >
                {brand}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {guides.length > 0 ? (
        <section className="mx-auto max-w-6xl px-5 py-8">
          <div className="mb-8 flex items-end justify-between gap-4 border-t border-ink/15 pt-8">
            <div>
              <p className="text-xs text-graphite">راهنمای خرید</p>
              <h2 className="mt-2 text-3xl font-semibold">قبل از خرید، درست انتخاب کن</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-graphite">
                مقاله‌ها و راهنماها کمک می‌کنند مدل مناسب خودرو یا موتور خودتان را پیدا کنید.
              </p>
            </div>
            <Link href="/blog" className="shrink-0 text-sm underline decoration-metal underline-offset-4">
              همه نوشته‌ها
            </Link>
          </div>
          <PostGrid posts={guides} />
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-5 py-8 pb-20">
        <div className="mb-8 border-t border-ink/15 pt-8">
          <p className="text-xs text-graphite">سوالات پرتکرار</p>
          <h2 className="mt-2 text-3xl font-semibold">سوالات متداول</h2>
        </div>
        <FaqList items={[...homeFaqs]} idPrefix="home-faq" />
      </section>
    </>
  );
}
