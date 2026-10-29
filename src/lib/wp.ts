import type { Category, Faq, GalleryImage, Post, Product, Spec, StockStatus } from "./types";
import { stripHtml } from "./format";

type ApiImage = { src?: string; alt?: string };
type ApiTerm = {
  id?: number;
  slug?: string;
  name?: string;
  description?: string;
  parent?: number;
  count?: number;
};
type ApiFaq = { question?: string; answer?: string };
type ApiProduct = {
  id?: number;
  slug?: string;
  name?: string;
  brand?: string;
  model?: string;
  sku?: string;
  price?: number | string | null;
  regular_price?: number | string | null;
  stock_status?: string;
  stock_quantity?: number | null;
  description?: string;
  short_description?: string;
  categories?: ApiTerm[];
  images?: ApiImage[];
  specs?: { label?: string; value?: string }[];
  features?: unknown;
  box_contents?: unknown;
  warranty?: string;
  shipping_status?: string;
  note?: string;
  faqs?: ApiFaq[];
  featured?: boolean;
  modified?: string;
};
type ApiPost = {
  id?: number;
  slug?: string;
  title?: string;
  excerpt?: string;
  content?: string;
  date?: string;
  modified?: string;
  image?: ApiImage | null;
  categories?: ApiTerm[];
  author?: string;
};

/** WordPress that serves the Mototec catalog and journal. */
const API_ORIGIN = "https://admin.mototec.ir";

export function isWordPressConfigured() {
  return Boolean(process.env.MOTOTEC_API_KEY?.trim());
}

function wordpressConfig() {
  const key = process.env.MOTOTEC_API_KEY?.trim();
  if (!key) return null;
  const url = (process.env.WORDPRESS_URL?.trim() || API_ORIGIN).replace(/\/+$/, "");
  return { url, key };
}

function apiEndpoint(origin: string, path: string, query: Record<string, string>) {
  // This host has no /wp-json rewrite. WordPress publishes REST on index.php?rest_route=.
  const endpoint = new URL("index.php", `${origin}/`);
  endpoint.searchParams.set("rest_route", `/mototec/v1/${path.replace(/^\/+/, "")}`);
  for (const [key, value] of Object.entries(query)) {
    endpoint.searchParams.set(key, value);
  }
  return endpoint;
}

async function apiFetch<T>(path: string, query: Record<string, string> = {}) {
  const config = wordpressConfig();
  if (!config) {
    throw new Error("WordPress is not configured");
  }

  const endpoint = apiEndpoint(config.url, path, query);
  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-Mototec-Key": config.key,
  };

  const response = await fetch(endpoint, {
    headers,
    cache: "force-cache",
  });

  if (!response.ok) {
    throw new Error(`Mototec API ${path} failed (${response.status})`);
  }

  return {
    data: (await response.json()) as T,
    totalPages: Number(response.headers.get("x-wp-totalpages") || "1"),
  };
}

async function fetchAll<T>(path: string, query: Record<string, string> = {}) {
  const items: T[] = [];
  for (let page = 1; page <= 20; page += 1) {
    const { data, totalPages } = await apiFetch<T[]>(path, {
      ...query,
      per_page: "100",
      page: String(page),
    });
    items.push(...data);
    if (page >= totalPages || data.length === 0) break;
  }
  return items;
}

export async function fetchWpCategories() {
  const { data } = await apiFetch<ApiTerm[]>("product-categories");
  return data.map(mapCategory);
}

export async function fetchWpProducts() {
  const products = await fetchAll<ApiProduct>("products");
  return products.map(mapProduct).filter((product) => product.slug);
}

export async function fetchWpPostCategories() {
  const { data } = await apiFetch<ApiTerm[]>("post-categories");
  return data.map(mapCategory);
}

export async function fetchWpPosts() {
  const posts = await fetchAll<ApiPost>("posts");
  return posts.map(mapPost).filter((post) => post.slug);
}

function mapCategory(category: ApiTerm): Category {
  return {
    id: number(category.id),
    slug: text(category.slug),
    name: text(category.name),
    description: text(category.description),
    parent: number(category.parent),
    count: number(category.count),
    children: [],
  };
}

function mapProduct(product: ApiProduct): Product {
  const images = (product.images ?? [])
    .filter((image): image is ApiImage & { src: string } => Boolean(image.src))
    .map<GalleryImage>((image) => ({
      src: image.src,
      alt: text(image.alt) || text(product.name),
    }));
  const price = money(product.price);
  const regularPrice = money(product.regular_price);
  const description = product.description || "";

  return {
    id: number(product.id),
    slug: text(product.slug),
    name: text(product.name),
    brand: text(product.brand),
    model: text(product.model),
    sku: text(product.sku),
    price,
    regularPrice: regularPrice != null && price != null && regularPrice > price ? regularPrice : regularPrice,
    stockStatus: stockStatus(product.stock_status),
    stockQuantity: typeof product.stock_quantity === "number" ? product.stock_quantity : null,
    image: images[0] ?? null,
    gallery: images,
    shortDescription: stripHtml(product.short_description || "") || stripHtml(description),
    description,
    specs: (product.specs ?? [])
      .map((spec) => ({ label: text(spec.label), value: text(spec.value) }))
      .filter((spec): spec is Spec => Boolean(spec.label && spec.value)),
    features: lines(product.features),
    boxContents: lines(product.box_contents),
    warranty: text(product.warranty),
    shippingStatus: text(product.shipping_status),
    note: text(product.note),
    faqs: (product.faqs ?? [])
      .map((item) => ({ question: text(item.question), answer: text(item.answer) }))
      .filter((item): item is Faq => Boolean(item.question && item.answer)),
    featured: Boolean(product.featured),
    categories: (product.categories ?? []).map((category) => ({
      id: number(category.id),
      slug: text(category.slug),
      name: text(category.name),
    })),
    modified: text(product.modified),
  };
}

function mapPost(post: ApiPost): Post {
  const image = post.image?.src
    ? { src: post.image.src, alt: text(post.image.alt) || text(post.title) }
    : null;

  return {
    id: number(post.id),
    slug: text(post.slug),
    title: text(post.title),
    excerpt: text(post.excerpt),
    content: post.content || "",
    date: text(post.date),
    modified: text(post.modified),
    image,
    categories: (post.categories ?? []).map((category) => ({
      id: number(category.id),
      slug: text(category.slug),
      name: text(category.name),
    })),
    author: text(post.author),
  };
}

function stockStatus(value?: string): StockStatus {
  if (value === "instock" || value === "outofstock" || value === "onbackorder") return value;
  return "unknown";
}

function money(value?: number | string | null) {
  if (value == null || value === "") return null;
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return amount;
}

function number(value?: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function text(value?: string) {
  return (value || "").trim();
}

function lines(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean);
}
