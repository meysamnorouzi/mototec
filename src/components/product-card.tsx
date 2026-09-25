import Link from "next/link";

import { PriceTag, StockBadge } from "@/components/price-tag";
import { ProductCover } from "@/components/product-cover";
import type { Product } from "@/lib/types";

export function ProductCard({ product, wide = false }: { product: Product; wide?: boolean }) {
  return (
    <article className={`group flex h-full flex-col overflow-hidden rounded-[1.6rem] bg-panel shadow-[0_20px_50px_-32px_rgba(0,0,0,0.65)] transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-28px_rgba(0,0,0,0.55)] ${wide ? "md:grid md:grid-cols-2" : ""}`}>
      <Link href={`/product/${product.slug}`} className="contents">
        <div className={`relative overflow-hidden bg-ink ${wide ? "aspect-[4/3] md:aspect-auto md:min-h-full" : "aspect-[4/3] sm:aspect-[4/5]"}`}>
          {product.image ? (
            // Remote WordPress media hosts vary, so this stays a plain image.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image.src} alt={product.image.alt || product.name} className="shot h-full w-full object-cover" />
          ) : (
            <ProductCover product={product} className="h-full" />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent opacity-80 transition duration-500 group-hover:opacity-40" />
          <p className="absolute bottom-4 start-4 text-sm text-white">{product.brand}</p>
        </div>
        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] tracking-[0.22em] text-graphite">{product.model || product.brand}</p>
            <StockBadge status={product.stockStatus} />
          </div>
          <h2 className="text-lg font-semibold leading-8">{product.name}</h2>
          <p className="line-clamp-3 text-sm leading-7 text-graphite">{product.shortDescription}</p>
          <div className="mt-auto pt-3">
            <PriceTag price={product.price} regularPrice={product.regularPrice} />
          </div>
        </div>
      </Link>
    </article>
  );
}

export function ProductGrid({ products, featured = false }: { products: Product[]; featured?: boolean }) {
  if (products.length === 0) {
    return (
      <div className="rounded-[1.6rem] bg-panel px-6 py-16 text-center shadow-[0_20px_50px_-36px_rgba(0,0,0,0.5)]">
        <p className="text-lg font-medium">محصولی در این بخش نیست</p>
        <p className="mt-2 text-sm text-graphite">با اضافه شدن کالا در وردپرس، همین‌جا نمایش داده می‌شود.</p>
      </div>
    );
  }

  return (
    <ul className={featured ? "grid gap-5 md:grid-cols-2" : "grid gap-5 sm:grid-cols-2 xl:grid-cols-3"}>
      {products.map((product, index) => (
        <li
          key={product.id}
          className={`rise ${featured && index === 0 ? "md:col-span-2" : ""}`}
          style={{ animationDelay: `${index * 90}ms` }}
        >
          <ProductCard product={product} wide={featured && index === 0} />
        </li>
      ))}
    </ul>
  );
}
