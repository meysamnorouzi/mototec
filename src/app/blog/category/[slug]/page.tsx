import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { PostGrid } from "@/components/post-card";
import { getPostCategory, getPostCategoryTree, getPostsByCategory, postCategoryTrail } from "@/lib/posts";
import { pageMeta } from "@/lib/seo";
import type { Category } from "@/lib/types";

export const dynamicParams = false;

export async function generateStaticParams() {
  const categories = await getPostCategoryTree();
  return flatten(categories).map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getPostCategory(slug);
  if (!category) return { title: "موضوع" };
  return pageMeta({
    title: category.name,
    description: category.description || `نوشته‌های ${category.name} در مجله موتوتک`,
    path: `/blog/category/${slug}`,
    image: "/images/helmet-ride.jpg",
  });
}

export default async function BlogCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [category, tree, posts] = await Promise.all([
    getPostCategory(slug),
    getPostCategoryTree(),
    getPostsByCategory(slug),
  ]);
  if (!category) notFound();

  const trail = postCategoryTrail(tree, slug);

  return (
    <>
      <PageHeader
        eyebrow="مجله"
        title={category.name}
        description={category.description}
        image={posts[0]?.image?.src || "/images/helmet-ride.jpg"}
        imageAlt={category.name}
        crumbs={[
          { href: "/", label: "خانه" },
          { href: "/blog", label: "مجله" },
          ...trail.map((item, index) => ({
            href: index === trail.length - 1 ? undefined : `/blog/category/${item.slug}`,
            label: item.name,
          })),
        ]}
      />
      <div className="mx-auto max-w-6xl px-5 py-12">
        <PostGrid posts={posts} />
      </div>
    </>
  );
}

function flatten(categories: Category[]): Category[] {
  return categories.flatMap((category) => [category, ...flatten(category.children)]);
}
