import { BlogLive } from "@/components/blog-live";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "بلاگ",
  description: "راهنمای خرید و نکته‌های استفاده از دوربین ثبت وقایع و تجهیزات موتور در موتوتک.",
  path: "/blog",
  image: "/images/helmet-ride.jpg",
});

export default function BlogPage() {
  return <BlogLive />;
}
