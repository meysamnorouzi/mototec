import type { Category, GalleryImage, Product, Spec, StockStatus } from "./types";
import { stripHtml } from "./format";

type WcMeta = { key: string; value: unknown };
type WcCategory = {
  id: number;
  name: string;
  slug: string;
  parent: number;
  count: number;
  description?: string;
};
type WcImage = { src?: string; alt?: string; name?: string };
type WcAttribute = { name?: string; options?: string[]; visible?: boolean };
type WcProduct = {
  id: number;
  name: string;
  slug: string;
  sku?: string;
  price?: string;
  regular_price?: string;
  sale_price?: string;
  stock_status?: string;
  stock_quantity?: number | null;
  description?: string;
  short_description?: string;
  categories?: { id: number; name: string; slug: string }[];
  images?: WcImage[];
  attributes?: WcAttribute[];
  meta_data?: WcMeta[];
  date_modified?: string;
  mototec?: Record<string, unknown>;
};

export function isWordPressConfigured() {
  return Boolean(wordpressConfig());
}

function wordpressConfig() {
  const url = process.env.WORDPRESS_URL?.replace(/\/$/, "");
  const key = process.env.WC_CONSUMER_KEY;
  const secret = process.env.WC_CONSUMER_SECRET;
  if (!url || !key || !secret) return null;
  return { url, key, secret };
}

async function wcFetch<T>(path: string, query: Record<string, string> = {}) {
  const config = wordpressConfig();
  if (!config) {
    throw new Error("WordPress is not configured");
  }

  const endpoint = new URL(`${config.url}/wp-json/wc/v3/${path}`);
  for (const [key, value] of Object.entries(query)) {
    endpoint.searchParams.set(key, value);
  }

  const token = Buffer.from(`${config.key}:${config.secret}`).toString("base64");
  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Basic ${token}`,
      Accept: "application/json",
    },
    next: { revalidate: 120, tags: ["woocommerce"] },
  });

  if (!response.ok) {
    throw new Error(`WooCommerce request failed (${response.status})`);
  }

  return {
    data: (await response.json()) as T,
    totalPages: Number(response.headers.get("x-wp-totalpages") || "1"),
  };
}

async function fetchAll<T>(path: string, query: Record<string, string> = {}) {
  const items: T[] = [];
  for (let page = 1; page <= 20; page += 1) {
    const { data, totalPages } = await wcFetch<T[]>(path, {
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
  const categories = await fetchAll<WcCategory>("products/categories", {
    hide_empty: "false",
    orderby: "name",
    order: "asc",
  });

  return categories
    .filter((category) => category.slug !== "uncategorized")
    .map<Category>((category) => ({
      id: category.id,
      slug: category.slug,
      name: decodeHtml(category.name),
      description: stripHtml(category.description || ""),
      parent: category.parent || 0,
      count: category.count || 0,
      children: [],
    }));
}

export async function fetchWpProducts() {
  const products = await fetchAll<WcProduct>("products", { status: "publish" });
  return products.map(mapProduct);
}

function mapProduct(product: WcProduct): Product {
  const mototec = product.mototec ?? {};
  const brand =
    text(mototec.brand) ||
    metaText(product.meta_data, ["brand", "pa_brand"]) ||
    attributeValue(product.attributes, ["برند", "brand"]) ||
    "";
  const model =
    text(mototec.model) ||
    metaText(product.meta_data, ["model"]) ||
    attributeValue(product.attributes, ["مدل", "model"]) ||
    "";
  const images = (product.images ?? [])
    .filter((image): image is WcImage & { src: string } => Boolean(image.src))
    .map<GalleryImage>((image) => ({
      src: image.src,
      alt: image.alt || image.name || product.name,
    }));
  const price = money(product.price);
  const regularPrice = money(product.regular_price);
  const description = product.description || "";
  const shortDescription = stripHtml(product.short_description || "") || stripHtml(description);

  return {
    id: product.id,
    slug: product.slug,
    name: decodeHtml(product.name),
    brand,
    model,
    sku: product.sku || "",
    price,
    regularPrice: regularPrice != null && price != null && regularPrice > price ? regularPrice : regularPrice,
    stockStatus: stockStatus(product.stock_status),
    stockQuantity: typeof product.stock_quantity === "number" ? product.stock_quantity : null,
    image: images[0] ?? null,
    gallery: images,
    shortDescription,
    description,
    specs: specsFrom(mototec.specs ?? metaValue(product.meta_data, ["specs", "specifications"]), product.attributes),
    features: lines(mototec.features ?? metaValue(product.meta_data, ["features"])),
    boxContents: lines(mototec.box_contents ?? metaValue(product.meta_data, ["box_contents", "box"])),
    warranty: text(mototec.warranty) || metaText(product.meta_data, ["warranty"]),
    shippingStatus: text(mototec.shipping_status) || metaText(product.meta_data, ["shipping_status", "shipping"]),
    note: text(mototec.note) || metaText(product.meta_data, ["note"]),
    categories: (product.categories ?? []).map((category) => ({
      id: category.id,
      slug: category.slug,
      name: decodeHtml(category.name),
    })),
    modified: product.date_modified || "",
  };
}

function stockStatus(value?: string): StockStatus {
  if (value === "instock" || value === "outofstock" || value === "onbackorder") return value;
  return "unknown";
}

function money(value?: string) {
  if (!value) return null;
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return amount;
}

function metaValue(meta: WcMeta[] | undefined, keys: string[]) {
  if (!meta) return undefined;
  for (const key of keys) {
    const found = meta.find((item) => item.key === key || item.key === `_${key}` || item.key === `_mototec_${key}`);
    if (found && found.value != null && found.value !== "") return found.value;
  }
  return undefined;
}

function metaText(meta: WcMeta[] | undefined, keys: string[]) {
  return text(metaValue(meta, keys));
}

function text(value: unknown) {
  if (typeof value === "string") return decodeHtml(value).trim();
  if (typeof value === "number") return String(value);
  return "";
}

function lines(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => text(item)).filter(Boolean);
  }
  const raw = text(value);
  if (!raw) return [];
  if (raw.startsWith("[")) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) return parsed.map((item) => text(item)).filter(Boolean);
    } catch {
      /* treat as lines */
    }
  }
  return raw
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}

function specsFrom(value: unknown, attributes: WcAttribute[] | undefined): Spec[] {
  const parsed = parseSpecs(value);
  if (parsed.length > 0) return parsed;

  return (attributes ?? [])
    .filter((attribute) => attribute.visible !== false && attribute.name && attribute.options?.length)
    .filter((attribute) => !/^(برند|مدل|brand|model)$/i.test(attribute.name || ""))
    .map((attribute) => ({
      label: attribute.name || "",
      value: (attribute.options ?? []).join("، "),
    }));
}

function parseSpecs(value: unknown): Spec[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const record = item as { label?: unknown; name?: unknown; value?: unknown };
        const label = text(record.label ?? record.name);
        const specValue = text(record.value);
        if (!label || !specValue) return null;
        return { label, value: specValue };
      })
      .filter((item): item is Spec => item != null);
  }

  const raw = text(value);
  if (!raw) return [];
  if (raw.startsWith("[")) {
    try {
      return parseSpecs(JSON.parse(raw) as unknown);
    } catch {
      /* treat as lines */
    }
  }

  return raw
    .split(/\r?\n/)
    .map((line) => {
      const separator = line.includes(":") ? ":" : line.includes("：") ? "：" : "";
      if (!separator) return null;
      const [label, ...rest] = line.split(separator);
      const specValue = rest.join(separator).trim();
      if (!label?.trim() || !specValue) return null;
      return { label: label.trim(), value: specValue };
    })
    .filter((item): item is Spec => item != null);
}

function attributeValue(attributes: WcAttribute[] | undefined, names: string[]) {
  const wanted = new Set(names.map((name) => name.toLowerCase()));
  const found = attributes?.find((attribute) => wanted.has((attribute.name || "").toLowerCase()));
  return found?.options?.[0] || "";
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}
