"use client";

import { Suspense } from "react";

import { LiveNotice } from "@/components/live-notice";
import { PageHeader } from "@/components/page-header";
import { ProductGrid } from "@/components/product-card";
import { ShopBrowser, ShopCatalog } from "@/components/shop-browser";
import { loadCategoryTree, loadProducts } from "@/lib/live";
import { sectionSlug } from "@/lib/path";
import { categoryTrail, findCategory, productsInCategory } from "@/lib/products";
import { categoryImage } from "@/lib/seo";
import { orderedStorefrontCategories } from "@/lib/storefront";
import type { Product } from "@/lib/types";
import { useLive } from "@/lib/use-live";
import { useLocationPath } from "@/lib/use-location-path";

function loadShop() {
  return Promise.all([loadProducts(), loadCategoryTree()] as const);
}

export function ShopLive() {
  const path = useLocationPath();
  const { data, error } = useLive(loadShop);

  if (error) return <LiveNotice status="error" />;
  if (!path || !data) return <LiveNotice status="loading" />;

  const [products, tree] = data;
  const slug = sectionSlug(path, "/shop");
  if (slug) return <CategoryView slug={slug} products={products} tree={tree} />;

  const categories = orderedStorefrontCategories(tree);
  const cards = products.map(toCard);

  return (
    <>
      <PageHeader
        eyebrow="فروشگاه"
        title="محصولات موتوتک"
        description="محصول تازه، همین‌جا و بدون بیلد دوباره دیده می‌شود."
        image="/images/night-ride.jpg"
      />
      <Suspense fallback={<ShopCatalog categories={categories} products={cards} />}>
        <ShopBrowser categories={categories} products={cards} />
      </Suspense>
    </>
  );
}

function CategoryView({
  slug,
  products,
  tree,
}: {
  slug: string;
  products: Product[];
  tree: Awaited<ReturnType<typeof loadCategoryTree>>;
}) {
  const category = findCategory(tree, slug);
  if (!category) {
    return (
      <PageHeader
        eyebrow="فروشگاه"
        title="این دسته پیدا نشد"
        description="اگر تازه ساخته شده، صفحه را یک‌بار تازه کنید."
        image="/images/night-ride.jpg"
      />
    );
  }

  const trail = categoryTrail(tree, slug);
  const items = productsInCategory(products, tree, slug);

  return (
    <>
      <PageHeader
        eyebrow="فروشگاه"
        title={category.name}
        description={category.description}
        image={categoryImage(slug)}
        imageAlt={category.name}
        crumbs={[
          { href: "/", label: "خانه" },
          { href: "/shop/", label: "فروشگاه" },
          ...trail.map((item, index) => ({
            href: index === trail.length - 1 ? undefined : `/shop/${item.slug}/`,
            label: item.name,
          })),
        ]}
      />
      <div className="mx-auto max-w-6xl px-5 py-12">
        {category.children.length > 0 ? (
          <ul className="mt-6 flex flex-wrap gap-2">
            {category.children.map((child) => (
              <li key={child.id}>
                <a href={`/shop/${child.slug}/`} className="inline-flex border border-line bg-panel px-3 py-2 text-sm hover:border-ink">
                  {child.name}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-10">
          <ProductGrid products={items} />
        </div>
      </div>
    </>
  );
}

function toCard(product: Product): Product {
  return {
    ...product,
    description: "",
    gallery: [],
    specs: [],
    features: [],
    boxContents: [],
    faqs: [],
    note: "",
  };
}
