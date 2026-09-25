import { fallbackCategories, fallbackProducts } from "./catalog";
import { normalizeSearch } from "./format";
import type { Category, Product, ProductList, ProductQuery } from "./types";
import { fetchWpCategories, fetchWpProducts, isWordPressConfigured } from "./wp";

export { isWordPressConfigured };

export async function getCategories() {
  const categories = isWordPressConfigured() ? await fetchWpCategories() : fallbackCategories;
  return categories;
}

export async function getCategoryTree() {
  const categories = await getCategories();
  return pruneEmpty(buildTree(categories));
}

export async function getCategoryBySlug(slug: string) {
  const tree = await getCategoryTree();
  return findCategory(tree, slug);
}

export async function getAllProducts() {
  if (!isWordPressConfigured()) return fallbackProducts;
  return fetchWpProducts();
}

export async function getProduct(slug: string) {
  const products = await getAllProducts();
  return products.find((product) => product.slug === slug) ?? null;
}

export async function getRelatedProducts(product: Product, limit = 3) {
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

  if (query.search) {
    const needle = normalizeSearch(query.search);
    products = products.filter((product) => {
      const haystack = normalizeSearch(
        [product.name, product.brand, product.model, product.sku, product.shortDescription].join(" "),
      );
      return haystack.includes(needle);
    });
  }

  products = sortProducts(products, query.sort ?? "new");
  const total = products.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage;

  return {
    items: products.slice(start, start + perPage),
    total,
    page,
    perPage,
    totalPages,
  };
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

function sortProducts(products: Product[], sort: NonNullable<ProductQuery["sort"]>) {
  const copy = [...products];
  if (sort === "name") {
    return copy.sort((a, b) => a.name.localeCompare(b.name, "fa"));
  }
  if (sort === "price-asc" || sort === "price-desc") {
    const direction = sort === "price-asc" ? 1 : -1;
    return copy.sort((a, b) => {
      if (a.price == null && b.price == null) return 0;
      if (a.price == null) return 1;
      if (b.price == null) return -1;
      return (a.price - b.price) * direction;
    });
  }
  return copy.sort((a, b) => {
    if (a.modified === b.modified) return b.id - a.id;
    return a.modified < b.modified ? 1 : -1;
  });
}
