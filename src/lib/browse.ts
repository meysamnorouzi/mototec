import { normalizeSearch } from "./format";
import type { Product, ProductList, ProductQuery } from "./types";

export function browseProducts(
  products: Product[],
  query: Pick<ProductQuery, "search" | "sort" | "page" | "perPage"> = {},
): ProductList {
  const perPage = Math.max(1, query.perPage ?? 12);
  let items = products;

  if (query.search) {
    const needle = normalizeSearch(query.search);
    items = items.filter((product) => {
      const haystack = normalizeSearch(
        [product.name, product.brand, product.model, product.sku, product.shortDescription].join(" "),
      );
      return haystack.includes(needle);
    });
  }

  items = sortProducts(items, query.sort ?? "new");
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(1, query.page ?? 1), totalPages);
  const start = (page - 1) * perPage;

  return {
    items: items.slice(start, start + perPage),
    total,
    page,
    perPage,
    totalPages,
  };
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
