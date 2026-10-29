import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { PostGrid } from "@/components/post-card";
import { getAllPosts, getPostCategoryTree } from "@/lib/posts";
import { pageMeta } from "@/lib/seo";
import type { Category } from "@/lib/types";

export const metadata = pageMeta({
  title: "مجله",
  description: "راهنمای خرید و نکته‌های استفاده از دوربین ثبت وقایع و تجهیزات موتور در موتوتک.",
  path: "/blog",
  image: "/images/helmet-ride.jpg",
});

export default async function BlogPage() {
  const [categories, posts] = await Promise.all([getPostCategoryTree(), getAllPosts()]);

  return (
    <>
      <PageHeader
        eyebrow="مجله"
        title="از جاده و مسیر"
        description="نکته‌های انتخاب و استفاده از دوربین، اینترکام و تجهیزات موتوتک."
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

function CategoryChips({ categories }: { categories: Category[] }) {
  const chips = flatten(categories);
  if (chips.length === 0) return null;

  return (
    <ul className="flex gap-2 overflow-x-auto pb-1">
      {chips.map((category) => (
        <li key={category.id}>
          <Link
            href={`/blog/category/${category.slug}`}
            className="inline-flex shrink-0 rounded-full bg-paper px-4 py-2 text-sm transition active:scale-95"
          >
            {category.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function flatten(categories: Category[]): Category[] {
  return categories.flatMap((category) => [category, ...flatten(category.children)]);
}
