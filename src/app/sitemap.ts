import type { MetadataRoute } from "next";

import { getAllProducts, getCategoryTree } from "@/lib/products";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([getAllProducts(), getCategoryTree()]);
  const flat = categories.flatMap((category) => [category, ...category.children]);

  const now = new Date();

  return [
    { url: site.url, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/shop`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${site.url}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${site.url}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    ...flat.map((category) => ({
      url: `${site.url}/shop/${category.slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...products.map((product) => ({
      url: `${site.url}/product/${product.slug}`,
      lastModified: product.modified ? new Date(product.modified) : now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
