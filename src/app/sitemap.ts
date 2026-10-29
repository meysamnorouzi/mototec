import type { MetadataRoute } from "next";

import { getAllPosts, getPostCategoryTree } from "@/lib/posts";
import { getAllProducts, getCategoryTree } from "@/lib/products";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, posts, topics] = await Promise.all([
    getAllProducts(),
    getCategoryTree(),
    getAllPosts(),
    getPostCategoryTree(),
  ]);
  const flat = categories.flatMap((category) => [category, ...category.children]);
  const flatTopics = topics.flatMap((topic) => [topic, ...topic.children]);

  const now = new Date();
  const page = (path: string) => `${site.url.replace(/\/$/, "")}${path === "/" ? "/" : `${path}/`}`;

  return [
    { url: page("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: page("/shop"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: page("/blog"), lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: page("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: page("/contact"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    ...flat.map((category) => ({
      url: page(`/shop/${category.slug}`),
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...products.map((product) => ({
      url: page(`/product/${product.slug}`),
      lastModified: product.modified ? new Date(product.modified) : now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...flatTopics.map((topic) => ({
      url: page(`/blog/category/${topic.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
    ...posts.map((post) => ({
      url: page(`/blog/${post.slug}`),
      lastModified: post.modified ? new Date(post.modified) : now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
