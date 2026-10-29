"use client";

import { useEffect } from "react";

import { LiveNotice } from "@/components/live-notice";
import { PageHeader } from "@/components/page-header";
import { PostGrid } from "@/components/post-card";
import { formatDate, formatNumber } from "@/lib/format";
import { sanitizeRichText } from "@/lib/html";
import { loadPostCategoryTree, loadPosts } from "@/lib/live";
import { sectionSlug } from "@/lib/path";
import { postCategoryTrail, readingMinutes, relatedPosts } from "@/lib/posts";
import { site } from "@/lib/site";
import type { Category } from "@/lib/types";
import { useLive } from "@/lib/use-live";
import { useLocationPath } from "@/lib/use-location-path";

function loadJournal() {
  return Promise.all([loadPosts(), loadPostCategoryTree()] as const);
}

export function BlogLive() {
  const path = useLocationPath();
  const { data, error } = useLive(loadJournal);

  if (error) return <LiveNotice status="error" />;
  if (!path || !data) return <LiveNotice status="loading" />;

  const [posts, categories] = data;
  const slug = sectionSlug(path, "/blog");
  if (slug && slug !== "category") return <Article slug={slug} posts={posts} categories={categories} />;

  return (
    <>
      <PageHeader
        eyebrow="بلاگ"
        title="از جاده و مسیر"
        description="نوشتهٔ تازه، همین‌جا و بدون بیلد دوباره دیده می‌شود."
        image="/images/helmet-ride.jpg"
        imageAlt="موتورسوار در مسیر"
      />
      <div className="mx-auto max-w-6xl px-5 py-12">
        <CategoryChips categories={categories} />
        <div className="mt-8">
          <PostGrid posts={posts} />
        </div>
      </div>
    </>
  );
}

function Article({
  slug,
  posts,
  categories,
}: {
  slug: string;
  posts: Awaited<ReturnType<typeof loadPosts>>;
  categories: Category[];
}) {
  const post = posts.find((item) => item.slug === slug) ?? null;

  useEffect(() => {
    if (!post) return;
    document.title = `${post.title} | ${site.nameFa}`;
  }, [post]);

  if (!post) {
    return (
      <PageHeader
        eyebrow="بلاگ"
        title="این نوشته پیدا نشد"
        description="اگر تازه منتشر شده، صفحه را یک‌بار تازه کنید."
        image="/images/helmet-ride.jpg"
      />
    );
  }

  const related = relatedPosts(posts, post);
  const primary = post.categories[0];
  const trail = primary ? postCategoryTrail(categories, primary.slug) : [];
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
        eyebrow={primary?.name || "بلاگ"}
        title={post.title}
        description={[formatDate(post.date), `${formatNumber(minutes)} دقیقه مطالعه`].filter(Boolean).join(" · ")}
        image={post.image?.src || "/images/helmet-ride.jpg"}
        imageAlt={post.image?.alt || post.title}
        crumbs={[
          { href: "/", label: "خانه" },
          { href: "/blog/", label: "بلاگ" },
          ...trail.map((item) => ({ href: `/blog/category/${item.slug}/`, label: item.name })),
          { label: post.title },
        ]}
      />
      <article className="mx-auto max-w-3xl px-5 py-12">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {post.categories.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {post.categories.map((category) => (
              <li key={category.id}>
                <a href={`/blog/category/${category.slug}/`} className="inline-flex rounded-full bg-paper px-3 py-1.5 text-sm">
                  {category.name}
                </a>
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

function CategoryChips({ categories }: { categories: Category[] }) {
  const chips = flatten(categories);
  if (chips.length === 0) return null;

  return (
    <ul className="flex gap-2 overflow-x-auto pb-1">
      {chips.map((category) => (
        <li key={category.id}>
          <a
            href={`/blog/category/${category.slug}/`}
            className="inline-flex shrink-0 rounded-full bg-paper px-4 py-2 text-sm transition active:scale-95"
          >
            {category.name}
          </a>
        </li>
      ))}
    </ul>
  );
}

function flatten(categories: Category[]): Category[] {
  return categories.flatMap((category) => [category, ...flatten(category.children)]);
}
