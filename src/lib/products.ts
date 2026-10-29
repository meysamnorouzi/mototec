import { cache } from "react";

import { browseProducts } from "./browse";
import { fallbackCategories, fallbackProducts } from "./catalog";
import type { Category, Product, ProductList, ProductQuery } from "./types";
import { fetchWpCategories, fetchWpProducts, isWordPressConfigured } from "./wp";

export { isWordPressConfigured };

export const getCategories = cache(async () => {
  return isWordPressConfigured() ? fetchWpCategories() : fallbackCategories;
});

export function categoryTree(categories: Category[]) {
  return pruneEmpty(buildTree(categories));
}

export const getCategoryTree = cache(async () => {
  return categoryTree(await getCategories());
});

export async function getCategoryBySlug(slug: string) {
  const tree = await getCategoryTree();
  return findCategory(tree, slug);
}

export const getAllProducts = cache(async () => {
  if (!isWordPressConfigured()) return fallbackProducts;
  return fetchWpProducts();
});

export async function getProduct(slug: string) {
  const products = await getAllProducts();
  return products.find((product) => product.slug === slug) ?? null;
}

export async function getRelatedProducts(product: Product, limit = 4) {
  const products = await getAllProducts();
  const slugs = new Set(product.categories.map((category) => category.slug));
  return products
    .filter((item) => item.id !== product.id && item.categories.some((category) => slugs.has(category.slug)))
    .slice(0, limit);
}

export async function queryProducts(query: ProductQuery = {}): Promise<ProductList> {
  const perPage = query.perPage ?? 12;
  const page = Math.max(1, query.page ?? 1);
  let products = await getAllProducts();

  if (query.categorySlug) {
    const category = await getCategoryBySlug(query.categorySlug);
    const slugs = new Set(category ? collectSlugs(category) : [query.categorySlug]);
    products = products.filter((product) => product.categories.some((item) => slugs.has(item.slug)));
  }

  return browseProducts(products, {
    search: query.search,
    sort: query.sort,
    page,
    perPage,
  });
}

export function findCategory(categories: Category[], slug: string): Category | null {
  for (const category of categories) {
    if (category.slug === slug) return category;
    const child = findCategory(category.children, slug);
    if (child) return child;
  }
  return null;
}

export function categoryTrail(categories: Category[], slug: string): Category[] {
  const trail: Category[] = [];

  function walk(nodes: Category[]): boolean {
    for (const node of nodes) {
      trail.push(node);
      if (node.slug === slug || walk(node.children)) return true;
      trail.pop();
    }
    return false;
  }

  walk(categories);
  return trail;
}

function collectSlugs(category: Category): string[] {
  return [category.slug, ...category.children.flatMap(collectSlugs)];
}

function buildTree(categories: Category[]) {
  const nodes = new Map<number, Category>();
  for (const category of categories) {
    nodes.set(category.id, { ...category, children: [] });
  }

  const roots: Category[] = [];
  for (const category of nodes.values()) {
    const parent = category.parent ? nodes.get(category.parent) : undefined;
    if (parent) parent.children.push(category);
    else roots.push(category);
  }
  return roots;
}

function pruneEmpty(categories: Category[]): Category[] {
  return categories
    .map((category) => ({ ...category, children: pruneEmpty(category.children) }))
    .filter((category) => category.count > 0 || category.children.length > 0);
}

