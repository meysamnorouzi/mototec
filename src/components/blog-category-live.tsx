"use client";

import { useEffect } from "react";

import { LiveNotice } from "@/components/live-notice";
import { PageHeader } from "@/components/page-header";
import { PostGrid } from "@/components/post-card";
import { loadPostCategoryTree, loadPosts } from "@/lib/live";
import { sectionSlug } from "@/lib/path";
import { findCategory } from "@/lib/products";
import { postCategoryTrail, postsInCategory } from "@/lib/posts";
import { site } from "@/lib/site";
import { useLive } from "@/lib/use-live";
import { useLocationPath } from "@/lib/use-location-path";

function loadTopics() {
  return Promise.all([loadPosts(), loadPostCategoryTree()] as const);
}

export function BlogCategoryLive() {
  const path = useLocationPath();
  const { data, error } = useLive(loadTopics);
  const slug = path ? sectionSlug(path, "/blog/category") : null;
  const category = data && slug ? findCategory(data[1], slug) : null;

  useEffect(() => {
    if (!category) return;
    document.title = `${category.name} | ${site.nameFa}`;
  }, [category]);

  if (error) return <LiveNotice status="error" />;
  if (!path || !data) return <LiveNotice status="loading" />;

  if (!category || !slug) {
    return (
      <PageHeader
        eyebrow="بلاگ"
        title="این موضوع پیدا نشد"
        description="اگر تازه ساخته شده، صفحه را یک‌بار تازه کنید."
        image="/images/helmet-ride.jpg"
      />
    );
  }

  const [posts, tree] = data;
  const trail = postCategoryTrail(tree, slug);
  const items = postsInCategory(posts, tree, slug);

  return (
    <>
      <PageHeader
        eyebrow="بلاگ"
        title={category.name}
        description={category.description}
        image={items[0]?.image?.src || "/images/helmet-ride.jpg"}
        imageAlt={category.name}
        crumbs={[
          { href: "/", label: "خانه" },
          { href: "/blog/", label: "بلاگ" },
          ...trail.map((item, index) => ({
            href: index === trail.length - 1 ? undefined : `/blog/category/${item.slug}/`,
            label: item.name,
          })),
        ]}
      />
      <div className="mx-auto max-w-6xl px-5 py-12">
        <PostGrid posts={items} />
      </div>
    </>
  );
}
