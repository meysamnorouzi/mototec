import { BlogCategoryLive } from "@/components/blog-category-live";

export function generateStaticParams() {
  return [{ slug: "_" }];
}

export default function BlogCategoryPage() {
  return <BlogCategoryLive />;
}