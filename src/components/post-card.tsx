import { formatDate } from "@/lib/format";
import type { Post } from "@/lib/types";

export function PostCard({ post }: { post: Post }) {
  const category = post.categories[0]?.name;
  const date = formatDate(post.date);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.6rem] bg-panel shadow-[0_20px_50px_-32px_rgba(0,0,0,0.65)] transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-28px_rgba(0,0,0,0.55)]">
      <a href={`/blog/${post.slug}/`} className="contents">
        <div className="relative aspect-[4/3] overflow-hidden bg-ink">
          {post.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.image.src} alt={post.image.alt || post.title} className="shot h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-end bg-ink p-5 text-white">
              <p className="text-sm text-white/70">{category || "بلاگ"}</p>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-3 p-5">
          <p className="text-xs text-graphite">{[category, date].filter(Boolean).join(" · ")}</p>
          <h2 className="text-lg font-semibold leading-8">{post.title}</h2>
          <p className="line-clamp-3 text-sm leading-7 text-graphite">{post.excerpt}</p>
        </div>
      </a>
    </article>
  );
}

export function PostGrid({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return (
      <div className="rounded-[1.6rem] bg-panel px-6 py-16 text-center shadow-[0_20px_50px_-36px_rgba(0,0,0,0.5)]">
        <p className="text-lg font-medium">نوشته‌ای در این بخش نیست</p>
        <p className="mt-2 text-sm text-graphite">با انتشار مطلب در وردپرس، همین‌جا نمایش داده می‌شود.</p>
      </div>
    );
  }

  return (
    <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {posts.map((post, index) => (
        <li key={post.id} className="rise" style={{ animationDelay: `${index * 90}ms` }}>
          <PostCard post={post} />
        </li>
      ))}
    </ul>
  );
}
