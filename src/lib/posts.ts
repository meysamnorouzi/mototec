import { cache } from "react";

import { stripHtml } from "./format";
import { fallbackPostCategories, fallbackPosts } from "./journal";
import { categoryTrail, categoryTree, findCategory } from "./products";
import type { Category, Post } from "./types";
import { fetchWpPostCategories, fetchWpPosts, isWordPressConfigured } from "./wp";

export const getPostCategories = cache(async () => {
  return isWordPressConfigured() ? fetchWpPostCategories() : fallbackPostCategories;
});

export const getPostCategoryTree = cache(async () => {
  return categoryTree(await getPostCategories());
});

export async function getPostCategory(slug: string) {
  return findCategory(await getPostCategoryTree(), slug);
}

export function postCategoryTrail(categories: Category[], slug: string) {
  return categoryTrail(categories, slug);
}

export const getAllPosts = cache(async () => {
  const posts = isWordPressConfigured() ? await fetchWpPosts() : fallbackPosts;
  return [...posts].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.id - a.id));
});

export async function getPost(slug: string) {
  const posts = await getAllPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}

export async function getPostsByCategory(slug: string) {
  const [posts, category] = await Promise.all([getAllPosts(), getPostCategory(slug)]);
  const slugs = new Set(category ? collectSlugs(category) : [slug]);
  return posts.filter((post) => post.categories.some((item) => slugs.has(item.slug)));
}

export async function getRelatedPosts(post: Post, limit = 3) {
  const posts = await getAllPosts();
  const slugs = new Set(post.categories.map((category) => category.slug));
  const related = posts.filter(
    (item) => item.id !== post.id && item.categories.some((category) => slugs.has(category.slug)),
  );
  const rest = posts.filter((item) => item.id !== post.id && !related.includes(item));
  return [...related, ...rest].slice(0, limit);
}

export function readingMinutes(post: Post) {
  const words = stripHtml(`${post.title} ${post.excerpt} ${post.content}`).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}

function collectSlugs(category: Category): string[] {
  return [category.slug, ...category.children.flatMap(collectSlugs)];
}
