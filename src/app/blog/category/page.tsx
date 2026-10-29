import { BlogCategoryLive } from "@/components/blog-category-live";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "موضوع",
  description: "موضوع‌های بلاگ موتوتک",
  path: "/blog/category",
  image: "/images/helmet-ride.jpg",
});

export default function BlogCategoryShellPage() {
  return <BlogCategoryLive />;
}
