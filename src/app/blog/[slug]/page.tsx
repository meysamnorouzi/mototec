import { BlogLive } from "@/components/blog-live";

export function generateStaticParams() {
  return [{ slug: "_" }];
}

export default function BlogPostPage() {
  return <BlogLive />;
}
