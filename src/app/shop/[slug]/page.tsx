import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { ProductGrid } from "@/components/product-card";
import { categoryTrail, getCategoryBySlug, getCategoryTree, queryProducts } from "@/lib/products";
import { categoryImage, pageMeta } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "دسته" };
  return pageMeta({
    title: category.name,
    description: category.description || `محصولات ${category.name} در موتوتک`,
    path: `/shop/${slug}`,
    image: categoryImage(slug),
  });
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [category, tree] = await Promise.all([getCategoryBySlug(slug), getCategoryTree()]);
  if (!category) notFound();

  const list = await queryProducts({ categorySlug: slug, perPage: 24 });
  const trail = categoryTrail(tree, slug);

  return (
    <>
      <PageHeader
        eyebrow="فروشگاه"
        title={category.name}
        description={category.description}
        image={categoryImage(slug)}
        imageAlt={category.name}
        crumbs={[
          { href: "/", label: "خانه" },
          { href: "/shop", label: "فروشگاه" },
          ...trail.map((item, index) => ({
            href: index === trail.length - 1 ? undefined : `/shop/${item.slug}`,
            label: item.name,
          })),
        ]}
      />
      <div className="mx-auto max-w-6xl px-5 py-12">
      {category.children.length > 0 ? (
        <ul className="mt-6 flex flex-wrap gap-2">
          {category.children.map((child) => (
            <li key={child.id}>
              <Link href={`/shop/${child.slug}`} className="inline-flex border border-line bg-panel px-3 py-2 text-sm hover:border-ink">
                {child.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-10">
        <ProductGrid products={list.items} />
      </div>
    </div>
    </>
  );
}
