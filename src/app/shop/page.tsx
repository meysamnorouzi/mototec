import { Suspense } from "react";

import { PageHeader } from "@/components/page-header";
import { ShopBrowser, ShopCatalog } from "@/components/shop-browser";
import { getAllProducts, getCategoryTree } from "@/lib/products";
import { pageMeta } from "@/lib/seo";
import { orderedStorefrontCategories } from "@/lib/storefront";
import type { Product } from "@/lib/types";

export const metadata = pageMeta({
  title: "فروشگاه",
  description: "تجهیزات هوشمند، اکسسوری و لوازم کاربردی خودرو و موتورسیکلت در فروشگاه موتوتک.",
  path: "/shop",
  image: "/images/night-ride.jpg",
});

export default async function ShopPage() {
  const [tree, products] = await Promise.all([getCategoryTree(), getAllProducts()]);
  const categories = orderedStorefrontCategories(tree);
  const cards = products.map(toCard);

  return (
    <>
      <PageHeader
        eyebrow="فروشگاه"
        title="محصولات موتوتک"
        description="دسته‌های خالی مخفی می‌مانند. با اضافه شدن کالا در وردپرس، همان دسته و محصول همین‌جا دیده می‌شود."
        image="/images/night-ride.jpg"
      />
      <Suspense fallback={<ShopCatalog categories={categories} products={cards} />}>
        <ShopBrowser categories={categories} products={cards} />
      </Suspense>
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
