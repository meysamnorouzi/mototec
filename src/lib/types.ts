export type Spec = {
  label: string;
  value: string;
};

export type Category = {
  id: number;
  slug: string;
  name: string;
  description: string;
  parent: number;
  count: number;
  children: Category[];
};

export type GalleryImage = {
  src: string;
  alt: string;
};

export type StockStatus = "instock" | "outofstock" | "onbackorder" | "unknown";

export type Product = {
  id: number;
  slug: string;
  name: string;
  brand: string;
  model: string;
  sku: string;
  price: number | null;
  regularPrice: number | null;
  stockStatus: StockStatus;
  stockQuantity: number | null;
  image: GalleryImage | null;
  gallery: GalleryImage[];
  shortDescription: string;
  description: string;
  specs: Spec[];
  features: string[];
  boxContents: string[];
  warranty: string;
  shippingStatus: string;
  note: string;
  categories: { id: number; slug: string; name: string }[];
  modified: string;
};

export type ProductQuery = {
  categorySlug?: string;
  search?: string;
  sort?: "new" | "price-asc" | "price-desc" | "name";
  page?: number;
  perPage?: number;
};

export type ProductList = {
  items: Product[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};
