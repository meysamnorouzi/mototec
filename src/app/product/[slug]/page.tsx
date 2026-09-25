import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { PriceTag, StockBadge } from "@/components/price-tag";
import { ProductGallery } from "@/components/product-gallery";
import { ProductGrid } from "@/components/product-card";
import { formatNumber } from "@/lib/format";
import { sanitizeRichText } from "@/lib/html";
import { categoryTrail, getCategoryTree, getProduct, getRelatedProducts } from "@/lib/products";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "محصول" };
  return pageMeta({
    title: product.name,
    description: product.shortDescription,
    path: `/product/${product.slug}`,
    image: product.image?.src,
  });
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const [tree, related] = await Promise.all([getCategoryTree(), getRelatedProducts(product)]);
  const primary = [...product.categories].reverse().find((category) => category.slug) ?? product.categories[0];
  const trail = primary ? categoryTrail(tree, primary.slug) : [];
  const description = sanitizeRichText(product.description);
  const facts = [
    product.sku ? ["کد محصول", product.sku] : null,
    product.warranty ? ["گارانتی", product.warranty] : null,
    product.shippingStatus ? ["ارسال", product.shippingStatus] : null,
    product.stockQuantity != null ? ["موجودی", `${formatNumber(product.stockQuantity)} عدد`] : null,
  ].filter((item): item is [string, string] => item != null);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    brand: product.brand,
    sku: product.sku || undefined,
    description: product.shortDescription,
    image: product.gallery.map((image) => image.src),
    category: product.categories.map((category) => category.name).join(" / "),
    offers:
      product.price != null
        ? {
            "@type": "Offer",
            priceCurrency: "IRR",
            price: product.price,
            availability:
              product.stockStatus === "outofstock"
                ? "https://schema.org/OutOfStock"
                : "https://schema.org/InStock",
          }
        : undefined,
  };

  return (
    <>
      <PageHeader
        eyebrow={product.brand || "محصول"}
        title={product.name}
        description={product.model ? `مدل ${product.model}` : undefined}
        image={product.image?.src || "/images/night-ride.jpg"}
        imageAlt={product.image?.alt || product.name}
        crumbs={[
          { href: "/", label: "خانه" },
          { href: "/shop", label: "فروشگاه" },
          ...trail.map((item) => ({ href: `/shop/${item.slug}`, label: item.name })),
          { label: product.name },
        ]}
      />
      <div className="mx-auto max-w-6xl px-5 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <ProductGallery product={product} images={product.gallery} />
        </div>
        <div className="lg:col-span-6">
          <p className="text-xs tracking-[0.28em] text-graphite">{product.brand}</p>
          <p className="mt-3 text-3xl font-semibold leading-snug md:text-4xl">{product.name}</p>
          {product.model ? <p className="mt-2 text-sm text-graphite">مدل {product.model}</p> : null}
          <div className="mt-4">
            <StockBadge status={product.stockStatus} />
          </div>
          <p className="mt-5 text-sm leading-8 text-graphite">{product.shortDescription}</p>
          <div className="mt-6 border border-line bg-panel p-5">
            <PriceTag price={product.price} regularPrice={product.regularPrice} size="lg" />
            {facts.length > 0 ? (
              <dl className="mt-5 space-y-3 text-sm">
                {facts.map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 border-t border-line pt-3">
                    <dt className="text-graphite">{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            <a href={`tel:${site.phoneTel}`} className="mt-6 flex justify-center bg-ink px-5 py-3 text-sm text-white">
              سفارش و استعلام · {site.phoneDisplay}
            </a>
          </div>
          {product.note ? (
            <p className="mt-4 border border-line bg-paper px-4 py-3 text-sm leading-7 text-graphite">{product.note}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-16 grid gap-12 lg:grid-cols-2">
        {description ? (
          <section>
            <h2 className="text-2xl font-semibold">توضیح محصول</h2>
            <div className="rich-text mt-4 text-sm leading-8 text-graphite" dangerouslySetInnerHTML={{ __html: description }} />
          </section>
        ) : null}
        {product.features.length > 0 ? (
          <section>
            <h2 className="text-2xl font-semibold">ویژگی‌ها</h2>
            <ul className="mt-4 space-y-3 text-sm leading-7">
              {product.features.map((feature) => (
                <li key={feature} className="border-s-2 border-ink ps-4">
                  {feature}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      {product.specs.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-2xl font-semibold">مشخصات فنی</h2>
          <dl className="mt-4 border border-line bg-panel">
            {product.specs.map((spec) => (
              <div key={`${spec.label}-${spec.value}`} className="grid gap-1 border-b border-line px-4 py-4 last:border-b-0 sm:grid-cols-3">
                <dt className="text-sm text-graphite">{spec.label}</dt>
                <dd className="text-sm sm:col-span-2">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {product.boxContents.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-2xl font-semibold">اقلام داخل جعبه</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {product.boxContents.map((item) => (
              <li key={item} className="border border-line bg-panel px-4 py-3 text-sm">
                {item}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section className="mt-16">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl font-semibold">محصولات مرتبط</h2>
            {primary ? (
              <Link href={`/shop/${primary.slug}`} className="text-sm underline underline-offset-4">
                دسته {primary.name}
              </Link>
            ) : null}
          </div>
          <ProductGrid products={related} />
        </section>
      ) : null}
    </div>
    </>
  );
}
