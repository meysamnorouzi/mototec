import { categoryTree } from "./products";
import { sortPosts } from "./posts";
import type { Category, Post, Product } from "./types";
import { fetchWpCategories, fetchWpPostCategories, fetchWpPosts, fetchWpProducts } from "./wp";

function once<T>(load: () => Promise<T>) {
  let pending: Promise<T> | null = null;
  return () => {
    if (!pending) {
      pending = load().catch((error: unknown) => {
        pending = null;
        throw error;
      });
    }
    return pending;
  };
}

export const loadProducts = once(() => fetchWpProducts());

export const loadCategoryTree = once(async () => categoryTree(await fetchWpCategories()));

export const loadPosts = once(async () => sortPosts(await fetchWpPosts()));

export const loadPostCategoryTree = once(async () => categoryTree(await fetchWpPostCategories()));

export function menuProducts(products: Product[]) {
  return products.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    categorySlugs: product.categories.map((category) => category.slug),
  }));
}

export type LiveCatalog = {
  products: Product[];
  categories: Category[];
};

export type LiveJournal = {
  posts: Post[];
  categories: Category[];
};
