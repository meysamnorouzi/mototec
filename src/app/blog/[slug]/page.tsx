import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { PostGrid } from "@/components/post-card";
import { formatDate, formatNumber } from "@/lib/format";
import { sanitizeRichText } from "@/lib/html";
import { getAllPosts, getPost, getPostCategoryTree, getRelatedPosts, postCategoryTrail, readingMinutes } from "@/lib/posts";
import { pageMeta } from "@/lib/seo";

export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return [...new Set(posts.map((post) => post.slug).filter(Boolean))].map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "نوشته" };
  return pageMeta({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.image?.src,
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const [tree, related] = await Promise.all([getPostCategoryTree(), getRelatedPosts(post)]);
  const primary = post.categories[0];
  const trail = primary ? postCategoryTrail(tree, primary.slug) : [];
  const content = sanitizeRichText(post.content);
  const minutes = readingMinutes(post);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.date || undefined,
    dateModified: post.modified || post.date || undefined,
    author: post.author ? { "@type": "Organization", name: post.author } : undefined,
    image: post.image?.src,
    description: post.excerpt,
    articleSection: post.categories.map((category) => category.name).join(" / ") || undefined,
  };

  return (
    <>
      <PageHeader
        eyebrow={primary?.name || "مجله"}
        title={post.title}
        description={[formatDate(post.date), `${formatNumber(minutes)} دقیقه مطالعه`].filter(Boolean).join(" · ")}
        image={post.image?.src || "/images/helmet-ride.jpg"}
        imageAlt={post.image?.alt || post.title}
        crumbs={[
          { href: "/", label: "خانه" },
          { href: "/blog", label: "مجله" },
          ...trail.map((item) => ({ href: `/blog/category/${item.slug}`, label: item.name })),
          { label: post.title },
        ]}
      />
      <article className="mx-auto max-w-3xl px-5 py-12">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {post.categories.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {post.categories.map((category) => (
              <li key={category.id}>
                <Link href={`/blog/category/${category.slug}`} className="inline-flex rounded-full bg-paper px-3 py-1.5 text-sm">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
        {content ? (
          <div className="rich-text mt-8 text-sm leading-8 text-graphite" dangerouslySetInnerHTML={{ __html: content }} />
        ) : null}
      </article>
      {related.length > 0 ? (
        <section className="mx-auto max-w-6xl px-5 pb-16">
          <h2 className="mb-6 text-2xl font-semibold">نوشته‌های دیگر</h2>
          <PostGrid posts={related} />
        </section>
      ) : null}
    </>
  );
}
